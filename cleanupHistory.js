const mongoose = require("mongoose");
require("dotenv").config();

const History = require("./models/History");
const Video = require("./models/Video");

// MongoDB URL .env fayldan oling
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/kids-platform";

async function cleanupHistory() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    // History-da video null bo‘lganlarni o‘chirish
    const result = await History.deleteMany({ video: null });
    console.log(`Deleted ${result.deletedCount} invalid history entries`);

    // Optional: historydagi video IDs Video collection bilan mos kelishini tekshirish
    const allHistory = await History.find().populate("video");
    for (const h of allHistory) {
      if (!h.video) {
        await History.findByIdAndDelete(h._id);
        console.log(`Deleted history ${h._id} because video not found`);
      }
    }

    console.log("Cleanup complete");
    process.exit(0);
  } catch (err) {
    console.error("Error cleaning history:", err);
    process.exit(1);
  }
}

cleanupHistory();
