const express = require("express");
const router = express.Router();
const {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
   removeSongFromPlaylist,
     deletePlaylist,
       getPlaylistById,
} = require("../../controllers/playlistController");

const auth = require("../../middleware/authMiddleware");

router.post("/create", auth, createPlaylist);
router.get("/", auth, getUserPlaylists);
router.post("/:playlistId/add/:songId", auth, addSongToPlaylist);
router.delete("/:playlistId/remove/:songId", auth, removeSongFromPlaylist);
router.delete("/:playlistId", auth, deletePlaylist);
router.get("/:playlistId", auth, getPlaylistById);

module.exports = router;