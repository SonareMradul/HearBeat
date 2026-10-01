const crypto = require("crypto");
const https = require("https");
const User = require("../models/User");
const Payment = require("../models/Payment");

const PLANS = {
  weekly: { name: "Weekly", amount: 29, durationDays: 7 },
  monthly: { name: "Monthly", amount: 99, durationDays: 30 },
  yearly: { name: "Yearly", amount: 499, durationDays: 365 },
};

const razorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const createRazorpayOrder = (payload) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            return reject(new Error("Invalid Razorpay response"));
          }
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsed);
          } else {
            const message = parsed?.error?.description || "Razorpay order creation failed";
            const error = new Error(message);
            error.response = { data: parsed };
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });

const getUser = (req) => User.findById(req.user.id);

const publicSubscription = (user) => {
  const sub = user.subscription || {};
  const active =
    sub.status === "active" &&
    sub.endAt &&
    new Date(sub.endAt).getTime() > Date.now();

  return {
    plan: active ? sub.plan : "free",
    status: active ? "active" : "expired",
    startAt: sub.startAt || null,
    endAt: sub.endAt || null,
    daysRemaining: active
      ? Math.max(0, Math.ceil((new Date(sub.endAt) - Date.now()) / 86400000))
      : 0,
  };
};

const activatePaidPayment = async (payment, razorpayPaymentId, signature = "") => {
  const user = await User.findById(payment.user);
  if (!user) throw new Error("User not found");

  if (payment.status !== "paid") {
    const plan = PLANS[payment.plan];
const now = new Date();

const existingEnd =
  user.subscription?.status === "active" &&
  user.subscription?.endAt &&
  new Date(user.subscription.endAt) > now
    ? new Date(user.subscription.endAt)
    : now;

const endAt = new Date(
  existingEnd.getTime() + plan.durationDays * 86400000
);

    user.subscription = {
      plan: payment.plan,
      status: "active",
      startAt: now,
      endAt,
      razorpayPaymentId,
      razorpayOrderId: payment.razorpayOrderId,
    };
    await user.save();

    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = signature;
    payment.paidAt = now;
    await payment.save();
  }

  return publicSubscription(user);
};

exports.getPlans = (req, res) => {
  res.json({
    success: true,
    plans: Object.entries(PLANS).map(([id, plan]) => ({
      id,
      ...plan,
      amountPaise: plan.amount * 100,
      currency: "INR",
    })),
  });
};

exports.getSubscription = async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const subscription = publicSubscription(user);
    if (user.subscription?.status === "active" && subscription.status !== "active") {
      user.subscription.status = "expired";
      await user.save();
    }
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (!razorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server environment.",
      });
    }

    const planId = String(req.body.plan || "").toLowerCase();
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan" });

    const user = await getUser(req);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const receipt = `hb_${String(user._id).slice(-8)}_${Date.now()}`;
    const order = await createRazorpayOrder({
      amount: plan.amount * 100,
      currency: "INR",
      receipt,
      notes: {
        app: "HearBeat",
        userId: String(user._id),
        plan: planId,
      },
    });

    await Payment.create({
      user: user._id,
      plan: planId,
      amount: plan.amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan: {
        id: planId,
        name: plan.name,
        amount: plan.amount,
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Razorpay order error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.description || "Unable to create payment order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Incomplete payment response" });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment || String(payment.user) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: "Payment order not found" });
    }

    if (payment.status === "paid") {
      const user = await User.findById(req.user.id);
      return res.json({ success: true, message: "Payment already verified", subscription: publicSubscription(user) });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(razorpay_signature);
    const valid =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!valid) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ success: false, message: "Payment signature verification failed" });
    }

    const subscription = await activatePaidPayment(
      payment,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: true,
      message: `${PLANS[payment.plan].name} plan activated`,
      subscription,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Unable to verify payment" });
  }
};

exports.paymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.handleWebhook = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(503).json({ success: false, message: "Webhook secret is not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(signature || "");
    const valid =
      providedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event !== "payment.captured" && event.event !== "order.paid") {
      return res.json({ success: true, ignored: true });
    }

    const paymentEntity = event.payload?.payment?.entity;
    const orderId =
      paymentEntity?.order_id ||
      event.payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id || "";

    if (!orderId) return res.json({ success: true, ignored: true });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) return res.status(404).json({ success: false, message: "Order not found" });

    await activatePaidPayment(payment, paymentId);
    res.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
