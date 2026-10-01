import api from "./api";

export const getPlans = async () => {
  const { data } = await api.get("/payments/plans");
  return data;
};

export const getSubscription = async () => {
  const { data } = await api.get("/payments/subscription");
  return data;
};

export const getPaymentHistory = async () => {
  const { data } = await api.get("/payments/history");
  return data;
};

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () =>
        reject(new Error("Razorpay Checkout could not be loaded"))
      );
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Razorpay Checkout could not be loaded"));

    document.body.appendChild(script);
  });

export const startPayment = async (planId, onSuccess) => {
  // Create Razorpay order through our backend
  const { data } = await api.post("/payments/create-order", {
    plan: planId,
  });

  // Load Razorpay Checkout
  await loadRazorpay();

  return new Promise((resolve, reject) => {
    let settled = false;

    const succeed = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "HearBeat",
      description: `${data.plan.name} Plan`,
      order_id: data.order.id,

      prefill: data.prefill,

      theme: {
        color: "#22c55e"
      },

      handler: async (response) => {
        try {
          // Verify payment on our backend
          const verification = await api.post(
            "/payments/verify",
            response
          );

          onSuccess?.(verification.data);

          succeed(verification.data);
        } catch (error) {
          fail(error);
        }
      },

      modal: {
        ondismiss: () => {
          fail(new Error("Payment cancelled"));
        },
      },
    });

    checkout.on("payment.failed", (response) => {
      fail(
        new Error(
          response.error?.description || "Payment failed"
        )
      );
    });

    checkout.open();
  });
};