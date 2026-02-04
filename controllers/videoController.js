const Video = require("../models/Video");
const cloudinary = require("cloudinary").v2;

/* =========================
   Cloudinary config
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


/* =================================================
   UPLOAD VIDEO  (Netflix style HLS streaming)
================================================= */
exports.uploadVideo = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "Video fayli tanlanmagan" });
    }

    const file = req.files.video;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "videos",

      //  ENG MUHIM → Netflix style streaming
      streaming_profile: "full_hd",

      eager: [
        {
          width: 300,
          height: 200,
          crop: "pad",
          format: "jpg"
        }
      ]
    });

    if (!result?.secure_url) {
      return res.status(500).json({ message: "Cloudinary xatolik" });
    }

    /* =============================
       mp4 → m3u8 (HLS stream)
    ============================= */
    const hlsUrl = result.secure_url.replace(".mp4", ".m3u8");

    const video = await Video.create({
      title,
      category: category || "uncategorized",

      videoUrl: hlsUrl, // HLS
      thumbnailUrl: result.eager?.[0]?.secure_url || "",

      cloudinaryId: result.public_id, //  delete uchun kerak

      uploadedBy: req.user.id,
      likes: [],
      dislikes: [],
      comments: []
    });

    res.status(201).json(video);

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Serverda yuklash xatoligi" });
  }
};


/* =================================================
    GET VIDEOS (pagination + faster)
================================================= */
exports.getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const videos = await Video.find()
      .populate("uploadedBy", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(videos);

  } catch (err) {
    res.status(500).json({ message: "Video olish xatolik" });
  }
};


/* =================================================
   DELETE VIDEO (DB + Cloudinary)
================================================= */
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });


    if (video.cloudinaryId) {
      await cloudinary.uploader.destroy(video.cloudinaryId, {
        resource_type: "video"
      });
    }

    await video.deleteOne();

    res.json({ message: "Video o‘chirildi" });

  } catch (err) {
    res.status(500).json({ message: "Video o‘chirish xatolik" });
  }
};


/* =================================================
   LIKE VIDEO
================================================= */
exports.likeVideo = async (req, res) => {
  try {
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

    res.json({
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length
    });

  } catch (err) {
    res.status(500).json({ message: "Like xatolik" });
  }
};


/* =================================================
   DISLIKE VIDEO
================================================= */
exports.dislikeVideo = async (req, res) => {
  try {
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

    res.json({
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length
    });

  } catch (err) {
    res.status(500).json({ message: "Dislike xatolik" });
  }
};


/* =================================================
    COMMENT
================================================= */
exports.addComment = async (req, res) => {
  try {
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

  } catch (err) {
    res.status(500).json({ message: "Comment xatolik" });
  }
};


/* =================================================
    LIKE COMMENT
================================================= */
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


/* =================================================
    REPLY COMMENT
================================================= */
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
