const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { addComment } = require("../controllers/videoController");
const { likeComment, replyToComment } = require("../controllers/videoController");
const {
  uploadVideo,
  getVideos,
  deleteVideo,
  likeVideo,
  dislikeVideo
} = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");

// ================= Public routes =================
router.get("/", auth, getVideos); // Hamma video ro‘yxatini ko‘ra oladi

// ================= Admin routes =================
router.post("/upload", auth, role("admin"), uploadVideo); // video upload
router.delete("/:id", auth, role("admin"), deleteVideo);  // video o‘chirish

// ================= Like/Dislike routes =================
router.put("/:id/like", authMiddleware, likeVideo);
router.put("/:id/dislike", authMiddleware, dislikeVideo);
router.post('/:id/comment', authMiddleware, addComment);
// Izohga like bosish
router.put('/:videoId/comments/:commentId/like', auth, likeComment);

// Izohga javob yozish
router.post('/:videoId/comments/:commentId/reply', auth, replyToComment);
module.exports = router;
