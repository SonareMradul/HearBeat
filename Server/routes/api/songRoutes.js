const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const upload = require("../../middleware/upload");

const {
  uploadSong,
  streamSong,
  getAllSongs,
   searchSongs,
} = require("../../controllers/songController");

// Upload Song
router.post(
  "/upload",
  auth,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "song", maxCount: 1 },
  ]),
  uploadSong
);

// Get All Songs
router.get("/", getAllSongs);

// Stream Song
router.get("/stream/:filename", streamSong);
router.get("/search", searchSongs);

module.exports = router;