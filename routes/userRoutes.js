const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {updateUser} = require("../controllers/userController");

const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const storage = multer.memoryStorage();
const upload = multer({ storage });



router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const safeUsers = users.map((u) => ({
      ...u._doc,
      followers: u.followers || [],
      following: u.following || [],
    }));

    res.json(safeUsers);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =================================================
   GET SINGLE USER ( PROFILE UCHUN MUHIM)
   /api/users/:id
================================================= */
router.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username required" });
    }

    const existingUser = await User.findOne({
      username: username.toLowerCase()
    });

    res.json({ exists: !!existingUser });

  } catch (err) {
    console.error("Check username error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET SINGLE USER (PROFILE)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name avatar _id")
      .populate("following", "name avatar _id");

    if (!user)
      return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.put("/:id", async (req, res) => {
  const { name, username, bio, profilePicture } = req.body;

  if (!name?.trim())
    return res.status(400).json({ message: "Full name is required" });

  if (!username?.trim())
    return res.status(400).json({ message: "Username is required" });

  try {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.params.id }
    });

    if (existingUser)
      return res.status(400).json({ message: "Username already taken" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.name = name.trim();
    user.username = username.toLowerCase().trim();
    user.bio = bio;
    user.profilePicture = profilePicture;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Follow / unfollow user
router.put("/follow/:id", async (req, res) => {
  const userId = req.body.userId; // bu authUser._id dan keladi
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!user || !currentUser)
      return res.status(404).json({ message: "User not found" });

    // Agar allaqachon follower bo‘lsa => unfollow
    if (user.followers.includes(userId)) {
      user.followers.pull(userId);
      currentUser.following.pull(id);
    } else {
      user.followers.push(userId);
      currentUser.following.push(id);
    }

    await user.save();
    await currentUser.save();

    res.json({ user, currentUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/unfollow/:id", async (req, res) => {
  try {
    const { followerId } = req.body;
    const targetId = req.params.id;

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: followerId },
    });

    await User.findByIdAndUpdate(followerId, {
      $pull: { following: targetId },
    });

    res.json({ message: "Unfollowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// PUT update profile
router.put("/:id", async (req, res) => {
  const { name, username, bio, profilePicture } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, username, bio, profilePicture },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//  Profile rasm upload
router.post("/upload-profile/:id", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "profiles" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = result.secure_url;
        await user.save();

        res.json({ profilePicture: result.secure_url });
      }
    );

    result.end(req.file.buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


