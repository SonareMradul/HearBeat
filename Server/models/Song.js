const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      required: true,
    },

    album: {
      type: String,
      default: "",
    },

    genre: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    coverImage: {
      type: String,
      required: true,
    },

    audioUrl: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    likes: {
      type: Number,
      default: 0,
    },

    plays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Song", songSchema);