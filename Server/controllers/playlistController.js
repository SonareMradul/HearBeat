const mongoose = require("mongoose");
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createPlaylist = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: "Playlist name is required" });
    const playlist = await Playlist.create({ name, user: req.user.id, songs: [] });
    res.status(201).json({ success: true, message: "Playlist created successfully", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).populate("songs").sort({ updatedAt: -1 });
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    if (!validId(playlistId) || !validId(songId)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const [playlist, song] = await Promise.all([
      Playlist.findOne({ _id: playlistId, user: req.user.id }),
      Song.findById(songId),
    ]);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (playlist.songs.some((id) => id.toString() === songId)) return res.status(400).json({ success: false, message: "Song already exists in playlist" });

    playlist.songs.push(songId);
    await playlist.save();
    res.json({ success: true, message: "Song added successfully", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    if (!validId(playlistId) || !validId(songId)) return res.status(400).json({ success: false, message: "Invalid ID" });
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    playlist.songs = playlist.songs.filter((song) => song.toString() !== songId);
    await playlist.save();
    res.json({ success: true, message: "Song removed successfully", playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!validId(playlistId)) return res.status(400).json({ success: false, message: "Invalid playlist ID" });
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, user: req.user.id });
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    res.json({ success: true, message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!validId(playlistId)) return res.status(400).json({ success: false, message: "Invalid playlist ID" });
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user.id }).populate("songs");
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
