import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Trash2 } from "lucide-react";
import api from "../services/api";
import { usePlayer } from "../context/PlayerContext";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const { playSong } = usePlayer();

  const fetchPlaylists = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await api.get("/playlists");
      setPlaylists(res.data.playlists || []);
    } catch (error) {
      console.error("Unable to load playlists:", error);
    }
  }, []);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  const deletePlaylist = async (id) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists((prev) => prev.filter((playlist) => playlist._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to delete playlist");
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <Link to="/create-playlist" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg">New Playlist</Link>
      </div>

      {playlists.length === 0 ? <p className="text-zinc-400">No playlists found.</p> : (
        <div className="grid md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
              <Link to={`/playlists/${playlist._id}`} className="block hover:text-green-400">
                <h2 className="text-xl font-semibold truncate">{playlist.name}</h2>
                <p className="text-zinc-400 mt-2">{playlist.songs.length} Songs</p>
              </Link>
              <div className="flex gap-3 mt-5">
                <button type="button" disabled={!playlist.songs.length} onClick={() => playSong(playlist.songs[0])} className="bg-green-500 disabled:opacity-40 px-4 py-2 rounded flex items-center gap-2"><Play size={16} /> Play</button>
                <button type="button" onClick={() => deletePlaylist(playlist._id)} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
