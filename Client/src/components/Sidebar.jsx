import { House, Search, Library, Plus, ListMusic } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { icon: House, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: ListMusic, label: "Playlists", path: "/playlists" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[280px] shrink-0 border-r border-zinc-800 bg-[#0A0A0A] flex flex-col px-6 py-8">
      <div className="mb-14">
        <h1 className="text-4xl font-semibold tracking-tight">HearBeat</h1>
        <p className="mt-2 text-sm text-zinc-500">Feel Every Beat</p>
      </div>
      <nav className="space-y-2">
        {menu.map(({ icon: Icon, label, path }) => (
          <button key={label} type="button" onClick={() => navigate(path)} className={`flex items-center gap-4 w-full rounded-xl px-4 py-3 transition-all ${location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`)) ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <button type="button" onClick={() => navigate("/create-playlist")} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all">
          <Plus size={18} /> New Playlist
        </button>
      </div>
    </aside>
  );
}
