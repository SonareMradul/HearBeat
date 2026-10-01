import { Bell, UserCircle, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-10">
      <div>
        <h2 className="text-xl font-semibold">Discover Music</h2>
      </div>
      <div className="flex items-center gap-5">
        <button onClick={() => navigate("/pricing")} className="flex items-center gap-2 rounded-full bg-red-500/10 text-red-300 px-4 py-2 text-sm hover:bg-red-500/20">
          <Crown size={16} /> Premium
        </button>
        <Bell className="text-zinc-400" size={20} />
        <button onClick={() => navigate("/account")} aria-label="Account">
          <UserCircle size={34} />
        </button>
      </div>
    </header>
  );
}
