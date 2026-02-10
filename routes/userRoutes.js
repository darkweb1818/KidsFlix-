const express = require("express");
const router = express.Router();
const User = require("../models/User");


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



// Follow/unfollow user
router.put("/follow/:id", async (req, res) => {
  const { id } = req.params; // user to follow
  const { followerId } = req.body; // who is following

  if (id === followerId)
    return res.status(400).json({ msg: "Cannot follow yourself" });

  try {
    const userToFollow = await User.findById(id);
    const follower = await User.findById(followerId);

    if (!userToFollow || !follower)
      return res.status(404).json({ msg: "User not found" });

    let type = "";
    if (userToFollow.followers.includes(followerId)) {
      // unfollow
      userToFollow.followers.pull(followerId);
      follower.following.pull(id);
      type = "unfollow";
    } else {
      // follow
      userToFollow.followers.push(followerId);
      follower.following.push(id);
      type = "follow";
    }

    await userToFollow.save();
    await follower.save();

    // Socket orqali barcha klientlarga yuborish
    global.io.emit("followUpdated", { userId: id, followerId, type });

    res.json({ msg: "Success", type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
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


module.exports = router;


