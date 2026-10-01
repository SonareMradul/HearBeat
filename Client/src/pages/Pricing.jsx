import { useEffect, useState } from "react";
import { Check, Crown, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlans, getSubscription, startPayment } from "../services/payment";

const FALLBACK_PLANS = [
  { id: "weekly", name: "Weekly", amount: 29, durationDays: 7 },
  { id: "monthly", name: "Monthly", amount: 99, durationDays: 30 },
  { id: "yearly", name: "Yearly", amount: 499, durationDays: 365 },
];

const features = [
  "Unlimited music playback",
  "Create and manage playlists",
  "Personal library & favorites",
  "Queue, shuffle and repeat",
];

export default function Pricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [subscription, setSubscription] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPlans().then((res) => setPlans(res.plans || FALLBACK_PLANS)).catch(() => {});
    if (localStorage.getItem("token")) {
      getSubscription().then((res) => setSubscription(res.subscription)).catch(() => {});
    }
  }, []);

  const choosePlan = async (planId) => {
    if (!localStorage.getItem("token")) {
      navigate("/login?redirect=/pricing");
      return;
    }

    setMessage("");
    setLoadingPlan(planId);
    try {
      const result = await startPayment(planId, (verified) => {
        setSubscription(verified.subscription);
      });
      setMessage(result.message || "Payment successful");
    } catch (error) {
      if (error.message !== "Payment cancelled") {
        setMessage(error.response?.data?.message || error.message || "Payment failed");
      }
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:px-10">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="text-zinc-500 hover:text-white mb-12">
          ← Back to HearBeat
        </button>

        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            <Sparkles size={15} /> HearBeat Premium
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
            Music without limits.
          </h1>
          <p className="mt-4 text-zinc-400 text-lg">
            Pick a plan and unlock the full HearBeat experience.
          </p>
          {subscription?.status === "active" && (
            <p className="mt-4 text-sm text-emerald-400">
              Your {subscription.plan} plan is active · {subscription.daysRemaining} days remaining
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {plans.map((plan) => {
            const isPopular = plan.id === "monthly";
            const busy = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-7 bg-zinc-950 ${
                  isPopular ? "border-red-500/70 shadow-2xl shadow-red-500/10" : "border-zinc-800"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-1 text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {plan.id === "yearly" && <Crown size={20} className="text-yellow-400" />}
                </div>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-bold">₹{plan.amount}</span>
                  <span className="text-zinc-500 mb-2">/{plan.id === "weekly" ? "week" : plan.id === "monthly" ? "month" : "year"}</span>
                </div>
                <p className="text-zinc-500 mt-3">Full access for {plan.durationDays} days.</p>

                <div className="my-7 space-y-3">
                  {features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm text-zinc-300">
                      <Check size={18} className="text-red-400 shrink-0" /> {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => choosePlan(plan.id)}
                  disabled={busy}
                  className={`w-full rounded-xl py-3.5 font-semibold transition ${
                    isPopular ? "bg-red-500 hover:bg-red-400" : "bg-white text-black hover:bg-zinc-200"
                  } disabled:opacity-60`}
                >
                  {busy ? <span className="flex justify-center"><Loader2 className="animate-spin" /></span> : "Choose plan"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-2"><ShieldCheck size={17} /> Secure Razorpay Checkout</span>
          <span>UPI · Cards · Net Banking</span>
          <span>No card details stored by HearBeat</span>
        </div>

        {message && (
          <div className="mt-8 max-w-xl mx-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
