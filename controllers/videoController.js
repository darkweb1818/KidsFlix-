const Video = require("../models/Video");
const cloudinary = require("cloudinary").v2;


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ================= Upload Video =================
exports.uploadVideo = async (req, res) => {
  try {
    const { title = "", description = "", tags = "", ageLimit = 0, isFeatured = false } = req.body;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "Video fayli tanlanmagan" });
    }

    const file = req.files.video;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "videos",
      streaming_profile: "full_hd",
      eager: [{ width: 300, height: 200, crop: "pad", format: "jpg" }]
    });

    const hlsUrl = result.secure_url.replace(".mp4", ".m3u8");

    const video = await Video.create({
      title,
      description,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      ageLimit: Number(ageLimit),
      isFeatured: isFeatured === "true" || isFeatured === true,
      videoUrl: hlsUrl,
      thumbnailUrl: result.eager?.[0]?.secure_url || "",
      cloudinaryId: result.public_id,
      uploadedBy: req.user.id
    });

    res.status(201).json(video);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Serverda yuklash xatoligi" });
  }
};




// ================= Get Videos =================
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("uploadedBy", "name");
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Video olish xatolik" });
  }
};

// ================= Get By Category =================
exports.getByCategory = async (req, res) => {
  try {
    const videos = await Video.find({ category: req.params.name }).limit(30);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Video olish xatolik" });
  }
};

// ================= Featured / Trending =================
exports.getFeatured = async (req, res) => {
  const videos = await Video.find({ isFeatured: true }).limit(5);
  res.json(videos);
};

exports.getTrending = async (req, res) => {
  const videos = await Video.find().sort({ views: -1 }).limit(20);
  res.json(videos);
};

// ================= Delete Video =================
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    if (video.cloudinaryId) {
      await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: "video" });
    }

    await video.deleteOne();
    res.json({ message: "Video o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: "Video o‘chirish xatolik" });
  }
};

// ================= Like / Dislike =================
exports.likeVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video topilmadi" });

  const userId = req.user.id;

  if (video.likes.includes(userId)) {
    video.likes.pull(userId);
  } else {
    video.likes.push(userId);
    video.dislikes.pull(userId);
  }

  await video.save();
  res.json({ likesCount: video.likes.length, dislikesCount: video.dislikes.length });
};

exports.dislikeVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video topilmadi" });

  const userId = req.user.id;

  if (video.dislikes.includes(userId)) {
    video.dislikes.pull(userId);
  } else {
    video.dislikes.push(userId);
    video.likes.pull(userId);
  }

  await video.save();
  res.json({ likesCount: video.likes.length, dislikesCount: video.dislikes.length });
};

// ================= Comment =================
exports.addComment = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video topilmadi" });

  video.comments.unshift({
    user: req.user.id,
    username: req.user.username,
    text: req.body.text,
    likes: [],
    replies: []
  });

  await video.save();
  res.json(video.comments);
};

exports.likeComment = async (req, res) => {
  const { videoId, commentId } = req.params;
  const video = await Video.findById(videoId);
  const comment = video.comments.id(commentId);

  if (comment.likes.includes(req.user.id)) {
    comment.likes.pull(req.user.id);
  } else {
    comment.likes.push(req.user.id);
  }

  await video.save();
  res.json(comment);
};

exports.replyToComment = async (req, res) => {
  const { videoId, commentId } = req.params;
  const video = await Video.findById(videoId);
  const comment = video.comments.id(commentId);

  comment.replies.push({
    user: req.user.id,
    username: req.user.username,
    text: req.body.text
  });

  await video.save();
  res.json(comment.replies);
};

// 🔍 SEARCH VIDEOS
exports.searchVideos = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) return res.json([]);

    const videos = await Video.find({
      title: { $regex: q, $options: "i" }
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

