const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Song = require("./models/Song");
const songsDir = path.join(__dirname, "..", "songs");
const uploadsSongsDir = path.join(__dirname, "uploads", "songs");
const coversDir = path.join(__dirname, "uploads", "covers");

async function seedSongs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Read songs from the existing HearBeat/songs folder
    const files = fs
      .readdirSync(songsDir)
      .filter(file => /\.(mp3|wav|m4a|ogg)$/i.test(file));

    console.log(`Found ${files.length} audio files`);

    if (files.length === 0) {
      console.log("No songs found.");
      process.exit(0);
    }

    // Make sure destination exists
    fs.mkdirSync(uploadsSongsDir, { recursive: true });

    // Find a default cover
    const coverFiles = fs
      .readdirSync(coversDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (coverFiles.length === 0) {
      throw new Error("No cover image found in Server/uploads/covers");
    }

    const defaultCover = coverFiles.find(
      file => file.toLowerCase() === "images.jpg"
    ) || coverFiles[0];

    console.log(`Using cover: ${defaultCover}`);

    let inserted = 0;
    let skipped = 0;

    for (const file of files) {
      const sourcePath = path.join(songsDir, file);
      const destinationPath = path.join(uploadsSongsDir, file);

      // Copy song into the location used by streamSong()
      if (!fs.existsSync(destinationPath)) {
        fs.copyFileSync(sourcePath, destinationPath);
      }

      // Remove extension
      const filenameWithoutExt = path.basename(
        file,
        path.extname(file)
      );

      // Try to create a reasonable title
      const parts = filenameWithoutExt.split(" - ");

      let title;
      let artist;

      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      } else {
        title = filenameWithoutExt.trim();
        artist = "Unknown Artist";
      }

      // Avoid duplicate songs
      const existing = await Song.findOne({
        audioUrl: file
      });

      if (existing) {
        skipped++;
        continue;
      }

      await Song.create({
        title,
        artist,
        album: "",
        genre: "",
        duration: 0,
        coverImage: defaultCover,
        audioUrl: file,
        likes: 0,
        plays: 0
      });

      inserted++;

      console.log(`Added: ${title} - ${artist}`);
    }

    console.log("\n-------------------------");
    console.log(`Songs inserted: ${inserted}`);
    console.log(`Songs skipped:  ${skipped}`);
    console.log("-------------------------");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("SEED ERROR:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSongs();