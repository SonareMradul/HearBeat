import { useEffect, useState } from "react";
import { CreditCard, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPaymentHistory, getSubscription } from "../services/payment";

export default function Account() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    Promise.all([getSubscription(), getPaymentHistory()])
      .then(([sub, history]) => {
        setSubscription(sub.subscription);
        setPayments(history.payments || []);
      })
      .catch(() => {});
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-full bg-black text-white p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-500">Account</p>
            <h1 className="text-4xl font-bold mt-2">Your HearBeat plan</h1>
          </div>
          <button onClick={logout} className="flex gap-2 items-center text-zinc-400 hover:text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" />
            <div>
              <h2 className="font-semibold capitalize">{subscription?.plan || "Free"} plan</h2>
              <p className="text-sm text-zinc-500">
                {subscription?.status === "active"
                  ? `${subscription.daysRemaining} days remaining`
                  : "No active premium plan"}
              </p>
            </div>
          </div>

          {subscription?.endAt && (
            <p className="mt-5 text-sm text-zinc-400">
              Access until {new Date(subscription.endAt).toLocaleDateString()}
            </p>
          )}

          <button onClick={() => navigate("/pricing")} className="mt-6 bg-white text-black rounded-xl px-5 py-3 font-semibold">
            {subscription?.status === "active" ? "Change plan" : "View plans"}
          </button>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
            <CreditCard size={19} /> Payment history
          </div>
          {payments.length === 0 ? (
            <p className="p-6 text-zinc-500">No payments yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment._id} className="p-5 border-b border-zinc-900 flex justify-between gap-4">
                <div>
                  <p className="capitalize font-medium">{payment.plan} plan</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p>₹{payment.amount}</p>
                  <p className={`text-xs mt-1 ${payment.status === "paid" ? "text-emerald-400" : "text-zinc-500"}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
