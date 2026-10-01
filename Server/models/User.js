const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],

    playlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],

    recentlyPlayed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],

    subscription: {
      plan: {
        type: String,
        enum: ["free", "weekly", "monthly", "yearly"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["inactive", "active", "expired"],
        default: "inactive",
      },
      startAt: {
        type: Date,
        default: null,
      },
      endAt: {
        type: Date,
        default: null,
      },
      razorpayPaymentId: {
        type: String,
        default: "",
      },
      razorpayOrderId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);