////const mongoose = require("mongoose");

////const ChatSchema = new mongoose.Schema(
////  {
////    participants: [
////      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
////    ],

////    messages: [
////      {
////        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
////        text: { type: String, required: true },
////        createdAt: { type: Date, default: Date.now },
////      },
////    ],
////  },
////  { timestamps: true }
////);

////module.exports = mongoose.model("Chat", ChatSchema);
//const mongoose = require("mongoose");

//const messageSchema = new mongoose.Schema(
//  {
//    sender: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: "User",
//    },
//    text: String,

//    seen: {
//      type: Boolean,
//      default: false,
//    },

//    createdAt: {
//      type: Date,
//      default: Date.now,
//    },
//  },
//  { _id: false }
//);

//const chatSchema = new mongoose.Schema(
//  {
//    participants: [
//      {
//        type: mongoose.Schema.Types.ObjectId,
//        ref: "User",
//      },
//    ],

//    messages: [messageSchema],

//    lastMessage: String,

//    unreadCount: {
//      type: Map,
//      of: Number,
//      default: {},
//    },
//  },
//  { timestamps: true }
//);

//module.exports = mongoose.model("Chat", chatSchema);
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
