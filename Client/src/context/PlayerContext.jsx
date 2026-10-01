import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

export const PlayerContext = createContext(null);

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:5000";

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [songs, setSongs] = useState([]);
  const [volume, setVolume] = useState(1);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [queue, setQueue] = useState([]);
  const previousVolume = useRef(1);

  const playSong = useCallback(async (song) => {
    if (!song?.audioUrl) return;

    const audio = audioRef.current;
    const audioUrl =
    `${MEDIA_URL}/api/songs/stream/${encodeURIComponent(song.audioUrl)}`;

    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      setCurrentTime(0);
      setDuration(0);
    }

    setCurrentSong(song);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Unable to play audio:", error);
      setIsPlaying(false);
    }
  }, []);

  const addToQueue = useCallback((song) => {
    if (song) setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const pauseSong = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Unable to resume audio:", error);
      setIsPlaying(false);
    }
  }, [currentSong, isPlaying]);

  const seekSong = useCallback((time) => {
    const audio = audioRef.current;
    if (!Number.isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
    setCurrentTime(audio.currentTime);
  }, []);

  const changeVolume = useCallback((value) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    audioRef.current.volume = nextVolume;
    setVolume(nextVolume);
    if (nextVolume > 0) previousVolume.current = nextVolume;
  }, []);

  const toggleMute = useCallback(() => {
    if (volume === 0) {
      changeVolume(previousVolume.current || 1);
    } else {
      previousVolume.current = volume;
      changeVolume(0);
    }
  }, [volume, changeVolume]);

  const playNext = useCallback(() => {
    if (!currentSong) return;

    if (queue.length > 0) {
      const [nextSong, ...remaining] = queue;
      setQueue(remaining);
      playSong(nextSong);
      return;
    }

    if (songs.length === 0) return;

    if (isShuffle && songs.length > 1) {
      const candidates = songs.filter((song) => song._id !== currentSong._id);
      const nextSong = candidates[Math.floor(Math.random() * candidates.length)];
      playSong(nextSong);
      return;
    }

    const index = songs.findIndex((song) => song._id === currentSong._id);
    if (index === -1) return;

    if (index === songs.length - 1) {
      if (repeatMode === "all") {
        playSong(songs[0]);
      } else {
        pauseSong();
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }

    playSong(songs[index + 1]);
  }, [currentSong, queue, songs, isShuffle, repeatMode, playSong, pauseSong]);

  const playPrevious = useCallback(() => {
    if (!currentSong || songs.length === 0) return;

    const index = songs.findIndex((song) => song._id === currentSong._id);
    if (index === -1) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const previousSong = songs[(index - 1 + songs.length) % songs.length];
    playSong(previousSong);
  }, [currentSong, songs, playSong]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("durationchange", updateTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
      audio.removeEventListener("durationchange", updateTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext, repeatMode, volume]);

  useEffect(() => () => audioRef.current.pause(), []);

  return (
    <PlayerContext.Provider
      value={{
        songs,
        setSongs,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playSong,
        pauseSong,
        togglePlayPause,
        seekSong,
        playNext,
        playPrevious,
        audioRef,
        volume,
        changeVolume,
        toggleMute,
        isShuffle,
        setIsShuffle,
        repeatMode,
        setRepeatMode,
        queue,
        setQueue,
        addToQueue,
        removeFromQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
