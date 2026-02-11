//const mongoose = require("mongoose");

//const chatSchema = new mongoose.Schema(
//  {
//    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//    text: String,
//    seen: { type: Boolean, default: false },
//  },
//  { timestamps: true }
//);

//module.exports = mongoose.model("Chat", chatSchema);
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  fileType: { type: String, enum: ["image","video","audio"], default: "image" },
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: String }],
  seen: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
