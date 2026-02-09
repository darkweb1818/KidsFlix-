////const mongoose = require("mongoose");

////const userSchema = new mongoose.Schema({
////  name: String,

////  email: {
////    type: String,
////    unique: true
////  },

////  password: String,

////  role: {
////    type: String,
////    enum: ["admin", "student"],
////    default: "student"
////  }

////}, { timestamps: true });

////module.exports = mongoose.model("User", userSchema);
//const mongoose = require("mongoose");

//const userSchema = new mongoose.Schema(
//  {
//    name: String,

//    email: {
//      type: String,
//      unique: true
//    },

//    password: String,

//    role: {
//      type: String,
//      enum: ["admin", "student"],
//      default: "student"
//    },

//    avatar: {
//      type: String,
//      default: ""
//    },

//    lastActive: {
//      type: Date,
//      default: Date.now
//    }
//  },
//  { timestamps: true }
//);

//module.exports = mongoose.model("User", userSchema);
// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/kidsflix.jpg" },
    role: { type: String, default: "user" },
    lastActive: { type: Date, default: Date.now },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

