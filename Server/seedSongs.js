const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Song = require("./models/Song");

const songsDir = path.join(__dirname, "..", "songs");
const uploadsSongsDir = path.join(__dirname, "uploads", "songs");
const coversDir = path.join(__dirname, "uploads", "covers");

// Normalize names so:
// "Zara Zara.mp3" -> "zarazara"
// "zara zara.jpg" -> "zarazara"
const normalize = (name) => {
  return path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

// Some filenames need explicit matching because the audio title
// and cover filename are not exactly the same.
const COVER_ALIASES = {
  "andaazekaramofficialvideomadhursharmamoinerroheb":
    "andaaz e karam.jpg",

  "bapuzimidarjassigillreplayreturnofmelodylatestpunjabisongs":
    "bapu zimidar.jpg",

  "chiggywiggyfullsongwithlyricsvibeswithmusicsongslyricschiggywiggy":
    "chiggy wigggy.jpg",

  "cokestudioseason8tajdareharamatifaslam":
    "tajdar e haram.jpg",

  "djsnakeftjustinbieberletmeloveyoulyricvideo":
    "let me love you.jpg",

  "dualipallevitatinglyrics":
    "levitating.jpg",

  "edsheeranshapeofyoulyrics":
    "shape of you.jpg",

  "ekdafatumiloofficialvideomadhursharmagoonjswapniltarepearlrecords":
    "ek dafa tum milo.jpg",

  "elliegouldinglovemelikeyoudoLyrics":
    "love me like you do.jpg",

  "gangakekinarebunnysagarkriparecord":
    "ganga ke kinare.jpg",

  "guitarsikhdafullaudiosongjessigill":
    "guitar sikhda.jpg",

  "joonnasakneofficialmusicvideo":
    "joon.jpg",

  "justinbieberbabyftludacris":
    "baby.jpg",

  "ladygagabrunomarssmile":
    "die with a smile.jpg",

  "marooncolorsadiyadineshlalyadavamaamplidubeykalpnaneelkamalsinghfasalmoviesong":
    "maroon colour sadiya.jpg",

  "merijaan":
    "meri jaan.jpg",

  "radhagorigorilyricalvideoindreshupadhyaybpraakkriparecords":
    "radha gori gori.jpg",

  "thechainsmokerscloserlyricsfthalsey":
    "closer.jpg",

  "believer":
    "baby.jpg",

  "gehraruafromdhurandhar":
    "Gehra-Hua-From-Dhurandhar.jpg",

  "hanuman":
    "hanuman.jpg",

  "rideit":
    "ride it.jpg",

  "zarazara":
    "zara zara.jpg",
};

function findCover(audioFile, coverFiles) {
  const normalizedAudio = normalize(audioFile);

  // First try explicit mapping.
  if (COVER_ALIASES[normalizedAudio]) {
    const alias = COVER_ALIASES[normalizedAudio];

    const exact = coverFiles.find(
      (file) => file.toLowerCase() === alias.toLowerCase()
    );

    if (exact) return exact;
  }

  // Then try normalized filename matching.
  const normalizedMatch = coverFiles.find(
    (cover) => normalize(cover) === normalizedAudio
  );

  if (normalizedMatch) return normalizedMatch;

  // Partial matching as a fallback.
  const partialMatch = coverFiles.find((cover) => {
    const normalizedCover = normalize(cover);

    return (
      normalizedAudio.includes(normalizedCover) ||
      normalizedCover.includes(normalizedAudio)
    );
  });

  return partialMatch || null;
}

async function seedSongs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    if (!fs.existsSync(songsDir)) {
      throw new Error(`Songs directory not found: ${songsDir}`);
    }

    if (!fs.existsSync(coversDir)) {
      throw new Error(`Covers directory not found: ${coversDir}`);
    }

    const files = fs
      .readdirSync(songsDir)
      .filter((file) => /\.(mp3|wav|m4a|ogg)$/i.test(file));

    const coverFiles = fs
      .readdirSync(coversDir)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

    console.log(`Found ${files.length} audio files`);
    console.log(`Found ${coverFiles.length} cover files`);

    if (files.length === 0) {
      console.log("No songs found.");
      await mongoose.disconnect();
      return;
    }

    if (coverFiles.length === 0) {
      throw new Error("No cover images found.");
    }

    fs.mkdirSync(uploadsSongsDir, { recursive: true });

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let missingCovers = 0;

    for (const file of files) {
      const sourcePath = path.join(songsDir, file);
      const destinationPath = path.join(uploadsSongsDir, file);

      // Copy audio into Server/uploads/songs
      if (!fs.existsSync(destinationPath)) {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied: ${file}`);
      }

      const filenameWithoutExt = path.basename(
        file,
        path.extname(file)
      );

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

      const cover = findCover(file, coverFiles);

      if (!cover) {
        console.log(`⚠️ No cover found for: ${file}`);
        missingCovers++;
      } else {
        console.log(`🖼️ ${file} → ${cover}`);
      }

      const existing = await Song.findOne({
        audioUrl: file,
      });

      if (existing) {
        // Update existing song's cover instead of skipping it.
        if (cover && existing.coverImage !== cover) {
          existing.coverImage = cover;
          await existing.save();

          console.log(`🔄 Updated cover: ${title} → ${cover}`);
          updated++;
        } else {
          skipped++;
        }

        continue;
      }

      await Song.create({
        title,
        artist,
        album: "",
        genre: "",
        duration: 0,
        coverImage: cover || "",
        audioUrl: file,
        likes: 0,
        plays: 0,
      });

      inserted++;

      console.log(`✅ Added: ${title} - ${artist}`);
    }

    console.log("\n==============================");
    console.log(`Songs inserted: ${inserted}`);
    console.log(`Songs updated:  ${updated}`);
    console.log(`Songs skipped:  ${skipped}`);
    console.log(`Missing covers: ${missingCovers}`);
    console.log("==============================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("SEED ERROR:", error);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
}

seedSongs();