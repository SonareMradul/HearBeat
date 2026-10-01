import { useEffect } from "react";
import api from "../services/api";
import SongCard from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";

export default function Home() {
 const { songs, setSongs } = usePlayer();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await api.get("/songs");
        setSongs(res.data.songs);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSongs();
  }, [setSongs]);


  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-6xl font-semibold tracking-tight">
          Welcome back.
        </h1>

        <p className="text-zinc-500 text-lg mt-4">
          Pick up where you left off.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Continue Listening
        </h2>

        <div className="grid grid-cols-4 gap-6">
          {songs.map((song) => (
            <SongCard key={song._id} song={song} />
          ))}
        </div>
      </section>
    </div>
  );
}