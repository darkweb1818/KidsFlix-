const Video = require("../models/Video");
const cloudinary = require("cloudinary").v2;

// Cloudinary konfiguratsiyasi
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    const { title, category } = req.body;
    
    // 1. Fayl mavjudligini tekshirish
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "Video fayli tanlanmagan" });
    }

    const file = req.files.video;

    // 2. Cloudinary-ga yuklash
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "video",
      folder: "videos", // Fayllarni tartiblash uchun
      eager: [{ width: 300, height: 200, crop: "pad", format: "jpg" }]
    });

    // 3. Tekshiruv: Agar Cloudinary URL bermasa, bazaga yozmaymiz
    if (!result || !result.secure_url) {
      return res.status(500).json({ message: "Cloudinary-ga yuklashda xatolik" });
    }

    // 4. Bazaga saqlash
    const video = await Video.create({
      title,
      category: category || "uncategorized",
      videoUrl: result.secure_url,
      // Eager transformatsiyasi ba'zan kechikishi mumkin, ehtiyot shart:
      thumbnailUrl: result.eager ? result.eager[0].secure_url : "", 
      uploadedBy: req.user.id,
      likes: [],
      dislikes: []
    });

    res.status(201).json(video);
  } catch (err) {
    console.error("Upload Error:", err); // Xatoni to'liq ko'rish uchun
    res.status(500).json({ message: "Serverda yuklash xatoligi", error: err.message });
  }
};
// Get all videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("uploadedBy", "name");
    res.json(videos);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Video olish xatolik" });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video o‘chirildi" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Video o‘chirish xatolik" });
  }
};

// Like video
// Like video mantiqi
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const userId = req.user.id;

    // Agar foydalanuvchi allaqachon like bosgan bo'lsa - like'ni olib tashlaymiz
    if (video.likes.includes(userId)) {
      video.likes.pull(userId);
    } else {
      // Agar like bosmagan bo'lsa - like qo'shamiz va dislike'ni olib tashlaymiz
      video.likes.push(userId);
      video.dislikes.pull(userId);
    }

    await video.save();
    res.json({
      success: true,
      likes: video.likes,
      dislikes: video.dislikes,
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length
    });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Like qilishda xatolik yuz berdi" });
  }
};

// Dislike video mantiqi
exports.dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const userId = req.user.id;

    // Agar allaqachon dislike bosgan bo'lsa - dislike'ni olib tashlaymiz
    if (video.dislikes.includes(userId)) {
      video.dislikes.pull(userId);
    } else {
      // Agar dislike bosmagan bo'lsa - dislike qo'shamiz va like'ni olib tashlaymiz
      video.dislikes.push(userId);
      video.likes.pull(userId);
    }

    await video.save();
    res.json({
      success: true,
      likes: video.likes,
      dislikes: video.dislikes,
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length
    });
  } catch (err) {
    console.error("Dislike error:", err);
    res.status(500).json({ message: "Dislike qilishda xatolik yuz berdi" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const newComment = {
      user: req.user.id,
      username: req.user.username, // Auth middlevare'dan kelayotgan ism
      text: text
    };

    video.comments.unshift(newComment); // Yangi commentni massiv boshiga qo'shish
    await video.save();

    res.json(video.comments);
  } catch (err) {
    res.status(500).json({ message: "Comment qo'shishda xato" });
  }
};
// Izohga like bosish
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
  res.json(video);
};

// Izohga javob yozish
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
  res.json(video);
};