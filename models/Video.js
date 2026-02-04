const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String }, // thumbnail
  category: { type: String, default: "uncategorized" }, // category
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // like
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String, // Tezroq ko'rsatish uchun ismini ham saqlash tavsiya etiladi
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
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
