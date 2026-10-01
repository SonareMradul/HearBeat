const Song = require("../models/Song");
const path = require("path");

exports.uploadSong = async (req, res) => {
  try {
    if (!req.files?.cover?.[0] || !req.files?.song?.[0]) {
      return res.status(400).json({ success: false, message: "Cover image and audio file are required" });
    }

    const { title, artist, album = "", genre = "" } = req.body;
    if (!title?.trim() || !artist?.trim()) {
      return res.status(400).json({ success: false, message: "Title and artist are required" });
    }

    const song = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      genre: genre.trim(),
      coverImage: req.files.cover[0].filename,
      audioUrl: req.files.song[0].filename,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: "Song uploaded successfully", song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.streamSong = (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "../uploads/songs", filename);
  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) res.status(error.statusCode || 404).json({ success: false, message: "Audio file not found" });
  });
};

exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchSongs = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const songs = await Song.find({
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { artist: { $regex: escaped, $options: "i" } },
        { album: { $regex: escaped, $options: "i" } },
      ],
    }).limit(50);

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error searching songs" });
  }
};
