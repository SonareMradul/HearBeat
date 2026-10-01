import { useState } from "react";
import api from "../services/api";
import SongCard from "../components/SongCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSongs = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/songs/search", { params: { q: value } });
      setResults(Array.isArray(res.data) ? res.data : res.data.songs || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <input type="search" placeholder="Search songs, artists..." value={query} onChange={(e) => searchSongs(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700 outline-none focus:border-green-500 mb-8" />
      {loading && <p className="text-zinc-400 mb-6">Searching...</p>}
      {!loading && query && results.length === 0 && <p className="text-zinc-400">No songs found.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((song) => <SongCard key={song._id} song={song} />)}
      </div>
    </div>
  );
}
