const multer = require("multer");
const path = require("path");
const fs = require("fs");

const coverDir = path.join(__dirname, "../uploads/covers");
const songDir = path.join(__dirname, "../uploads/songs");
fs.mkdirSync(coverDir, { recursive: true });
fs.mkdirSync(songDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover") return cb(null, coverDir);
    if (file.fieldname === "song") return cb(null, songDir);
    return cb(new Error("Unexpected upload field"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cover" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Cover must be an image"));
  }
  if (file.fieldname === "song" && !file.mimetype.startsWith("audio/")) {
    return cb(new Error("Song must be an audio file"));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
