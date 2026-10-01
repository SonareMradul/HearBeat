import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Trash2 } from "lucide-react";
import api from "../services/api";
import { usePlayer } from "../context/PlayerContext";

export default function PlaylistDetails() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const { playSong } = usePlayer();

  const fetchPlaylist = async () => {
    try {
      const res = await api.get(`/playlists/${playlistId}`);
      setPlaylist(res.data.playlist);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load playlist");
    }
  };

  useEffect(() => { fetchPlaylist(); }, [playlistId]);

  const removeSong = async (songId) => {
    try {
      await api.delete(`/playlists/${playlistId}/remove/${songId}`);
      setPlaylist((prev) => ({ ...prev, songs: prev.songs.filter((song) => song._id !== songId) }));
    } catch (err) {
      alert(err.response?.data?.message || "Unable to remove song");
    }
  };

  if (error) return <div className="p-10 text-red-400">{error}</div>;
  if (!playlist) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="p-8 text-white">
      <Link to="/playlists" className="text-zinc-400 hover:text-white">← My Playlists</Link>
      <h1 className="text-4xl font-bold mt-4">{playlist.name}</h1>
      <p className="text-zinc-400 mt-2">{playlist.songs.length} Songs</p>

      {playlist.songs.length === 0 ? <p className="text-zinc-500 mt-8">This playlist is empty.</p> : (
        <div className="mt-8 space-y-3">
          {playlist.songs.map((song, index) => (
            <div key={song._id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <div className="min-w-0">
                <h2 className="font-semibold truncate">{index + 1}. {song.title}</h2>
                <p className="text-zinc-400 truncate">{song.artist}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button type="button" onClick={() => playSong(song)} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded flex items-center gap-2"><Play size={16} /> Play</button>
                <button type="button" onClick={() => removeSong(song._id)} className="bg-zinc-800 hover:bg-red-500 px-3 py-2 rounded" aria-label={`Remove ${song.title}`}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
