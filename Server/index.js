const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/api/authRoutes");
const userRoutes = require("./routes/api/userRoutes");
const songRoutes = require("./routes/api/songRoutes");
const playlistRoutes = require("./routes/api/playlistRoutes");
const paymentRoutes = require("./routes/api/paymentRoutes");
const paymentController = require("./controllers/paymentController");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.json({ success: true, message: "🎵 HearBeat API Running" }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "OK" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/payments", paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "MulterError" || err.message?.includes("must be")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("❌ Unable to start server:", error.message);
    process.exit(1);
  }
};

start();
