import { X } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:5000";

export default function Queue() {
  const { queue, playSong, removeFromQueue } = usePlayer();
  if (!queue.length) return null;

  return (
    <div className="fixed right-5 bottom-28 w-80 bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-800 p-4 z-50">
      <h2 className="text-lg font-bold mb-3">Up Next</h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {queue.map((song, index) => (
          <div key={`${song._id}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800">
            <button type="button" onClick={() => playSong(song)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
              <img src={`${MEDIA_URL}/uploads/covers/${encodeURIComponent(song.coverImage)}`} alt={song.title} className="w-12 h-12 rounded object-cover shrink-0" />
              <span className="min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </span>
            </button>
            <button type="button" aria-label={`Remove ${song.title} from queue`} onClick={() => removeFromQueue(index)} className="text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
