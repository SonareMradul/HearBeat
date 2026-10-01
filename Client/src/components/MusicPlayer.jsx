import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:5000";

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    seekSong,
    playNext,
    playPrevious,
    volume,
    changeVolume,
    toggleMute,
    isShuffle,
    setIsShuffle,
    repeatMode,
    setRepeatMode,
  } = usePlayer();

  const formatTime = (time) => {
    if (!Number.isFinite(time) || time <= 0) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRepeat = () => {
    setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off");
  };

  if (!currentSong) {
    return (
      <footer className="h-24 shrink-0 border-t border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
        No song selected
      </footer>
    );
  }

  const cover = `${MEDIA_URL}/uploads/covers/${encodeURIComponent(currentSong.coverImage)}`;

  return (
    <footer className="min-h-24 shrink-0 border-t border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4 w-64 min-w-0">
        <img src={cover} alt={currentSong.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
        <div className="min-w-0">
          <h3 className="font-medium truncate">{currentSong.title}</h3>
          <p className="text-sm text-zinc-500 truncate">{currentSong.artist}</p>
        </div>
      </div>

      <div className="flex flex-col items-center flex-1 max-w-xl min-w-0">
        <div className="flex items-center gap-5 mb-2">
          <button type="button" aria-label="Toggle shuffle" onClick={() => setIsShuffle((value) => !value)}>
            <Shuffle size={18} className={isShuffle ? "text-green-500" : "text-zinc-400 hover:text-white"} />
          </button>
          <button type="button" aria-label="Toggle repeat" onClick={toggleRepeat}>
            {repeatMode === "one" ? <Repeat1 className="text-green-500" size={18} /> : <Repeat size={18} className={repeatMode === "all" ? "text-green-500" : "text-zinc-400 hover:text-white"} />}
          </button>
          <button type="button" aria-label="Previous song" onClick={playPrevious}><SkipBack size={20} /></button>
          <button type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button type="button" aria-label="Next song" onClick={playNext}><SkipForward size={20} /></button>
        </div>

        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-zinc-500 w-10 text-right">{formatTime(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} value={Math.min(currentTime, duration || currentTime)} onChange={(e) => seekSong(Number(e.target.value))} className="flex-1 cursor-pointer" aria-label="Seek" />
          <span className="text-xs text-zinc-500 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="w-64 flex justify-end items-center gap-3">
        <button type="button" aria-label={volume === 0 ? "Unmute" : "Mute"} onClick={toggleMute}>
          {volume === 0 ? <VolumeX size={18} className="text-zinc-400 hover:text-white" /> : <Volume2 size={18} className="text-zinc-400 hover:text-white" />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} className="w-28 accent-white cursor-pointer" aria-label="Volume" />
      </div>
    </footer>
  );
}
