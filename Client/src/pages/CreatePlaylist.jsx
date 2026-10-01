import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreatePlaylist() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createPlaylist = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (!localStorage.getItem("token")) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await api.post("/playlists/create", { name: name.trim() });
      navigate("/playlists");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-black p-8">
      <form onSubmit={createPlaylist} className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-800">
        <h2 className="text-2xl text-white font-bold mb-5">Create Playlist</h2>
        <input type="text" placeholder="Playlist Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-green-500" autoFocus />
        <button disabled={loading || !name.trim()} type="submit" className="mt-5 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded">{loading ? "Creating..." : "Create Playlist"}</button>
      </form>
    </div>
  );
}
