const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  uploadVideo,
  getVideos,
  deleteVideo,
  likeVideo,
  dislikeVideo,
  addComment,
  likeComment,
  replyToComment,
  getFeatured,
  getTrending,
  getByCategory
} = require("../controllers/videoController");

// ================= Public routes =================
router.get("/", auth, getVideos);
router.get("/featured", auth, getFeatured);
router.get("/trending", auth, getTrending);
router.get("/category/:name", auth, getByCategory);

// ================= Admin routes =================
router.post("/upload", auth, role("admin"), uploadVideo);
router.delete("/:id", auth, role("admin"), deleteVideo);

// ================= Like/Dislike routes =================
router.put("/:id/like", auth, likeVideo);
router.put("/:id/dislike", auth, dislikeVideo);

// ================= Comment routes =================
router.post("/:id/comment", auth, addComment);
router.put("/:videoId/comments/:commentId/like", auth, likeComment);
router.post("/:videoId/comments/:commentId/reply", auth, replyToComment);

module.exports = router;
