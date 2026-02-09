////const userRouter = require("express").Router();
////const express = require("express");
////const router = express.Router();

////// Example route
////router.get("/test", (req, res) => {
////  res.json({ message: "User route works!" });
////});

////module.exports = router;
//const router = require("express").Router();
//const User = require("../models/User");

//// ✅ ONLINE USERS (stories uchun)
//router.get("/online", async (req, res) => {
//  try {
//    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//    const users = await User.find({
//      lastActive: { $gte: fiveMinutesAgo }
//    })
//      .select("name avatar")
//      .limit(20)
//      .sort({ lastActive: -1 });

//    res.json(users);
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//});


//module.exports = router;
// routes/userRoutes.js
// routes/userRoutes.js
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("name avatar followers following");
    res.json(users);
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

module.exports = router;


