import { Link } from "react-router-dom";

export default function Library() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold">Your Library</h1>
      <p className="text-zinc-400 mt-2">Manage your playlists and saved music.</p>
      <Link to="/playlists" className="inline-block mt-8 bg-green-500 hover:bg-green-600 px-5 py-3 rounded-lg">Open Playlists</Link>
    </div>
  );
}
