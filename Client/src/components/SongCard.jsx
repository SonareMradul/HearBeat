import { Play, ListPlus } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import api from "../services/api";
import { useEffect, useState } from "react";

const MEDIA_URL =
  import.meta.env.VITE_MEDIA_URL || "http://localhost:5000";

export default function SongCard({ song }) {
  const { playSong, addToQueue } = usePlayer();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!localStorage.getItem("token")) return;

      try {
        const res = await api.get("/playlists");
        setPlaylists(res.data.playlists || []);
      } catch (error) {
        console.error("Unable to load playlists:", error);
      }
    };

    fetchPlaylists();
  }, []);

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/add/${song._id}`);
      alert("Song added to playlist");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add song");
    }
  };

  const cover = `${MEDIA_URL}/uploads/covers/${encodeURIComponent(
    song.coverImage || "images.jpg"
  )}`;

  return (
    <article className="group rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700">
      <button
        type="button"
        onClick={() => playSong(song)}
        className="block w-full text-left overflow-hidden"
      >
        <img
          src={cover}
          alt={song.title}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>

      <div className="p-5">
        <h3 className="font-semibold text-lg truncate">
          {song.title}
        </h3>

        <p className="text-zinc-500 mt-1 truncate">
          {song.artist}
        </p>

        <button
          type="button"
          onClick={() => addToQueue(song)}
          className="mt-4 w-full rounded-xl border border-zinc-700 py-3 flex justify-center items-center gap-2 hover:bg-zinc-800 transition"
        >
          <ListPlus size={18} />
          Add to Queue
        </button>

        <button
          type="button"
          onClick={() => playSong(song)}
          className="mt-3 w-full rounded-xl bg-white text-black py-3 flex justify-center items-center gap-2 hover:bg-zinc-200 transition"
        >
          <Play size={18} />
          Play
        </button>

        {playlists.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                addToPlaylist(e.target.value);
              }
            }}
            className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 mt-3 outline-none"
          >
            <option value="">Add to Playlist</option>

            {playlists.map((playlist) => (
              <option key={playlist._id} value={playlist._id}>
                {playlist.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </article>
  );
}