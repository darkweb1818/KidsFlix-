////const mongoose = require("mongoose");

////const UserSchema = new mongoose.Schema(
////  {
////    name: { type: String, required: true },
////    email: { type: String, required: true, unique: true },
////    password: { type: String, required: true },
////    avatar: { type: String, default: "/kidsflix.jpg" },
////    role: { type: String, default: "user" },
////    lastActive: { type: Date, default: Date.now },
////    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
////    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
////  },
////  { timestamps: true }
////);

////module.exports = mongoose.model("User", UserSchema);

//// PUT: /api/users/:id — profilni yangilash
//router.put("/:id", async (req, res) => {
//  const { id } = req.params;
//  const { name, username, bio, profilePicture } = req.body;

//  try {
//    // Userni topib, yangilash
//    const updatedUser = await User.findByIdAndUpdate(
//      id,
//      { name, username, bio, profilePicture },
//      { new: true, runValidators: true } // new: true -> yangilangan user qaytadi
//    );

//    if (!updatedUser) {
//      return res.status(404).json({ message: "User not found" });
//    }

//    res.json(updatedUser); // Frontendga yangilangan userni yuboradi
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: "Server error" });
//  }
//});
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  role: { type: String, default: "user" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
