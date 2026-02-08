const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: String, // NEW
  videoUrl: { type: String, required: true },
  thumbnail: String,

  category: String,
  tags: [String], // NEW (search uchun)

  ageLimit: { type: Number, default: 0 }, // NEW (Kids safety)

  views: { type: Number, default: 0 }, // NEW (Netflix style)

  isFeatured: { type: Boolean, default: false }, // NEW (Hero banner)

  cloudinaryId: String,

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  comments: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    text: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Izohga like
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  }
]
}, { timestamps: true });
module.exports = mongoose.model("Video", videoSchema);