const History = require("../models/History");
const Video = require("../models/Video");

// Add video to history
exports.addHistory = async (req, res) => {
  const { id: videoId } = req.params;

  try {
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
      return res.status(404).json({ message: "Video not found" });
    }

    await History.updateOne(
      { user: req.user.id, video: videoId },
      { $set: { createdAt: new Date() } },
      { upsert: true }
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get user history
exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id })
      .populate("video")
      .sort({ createdAt: -1 }); // oxirgi ko‘rilgan video birinchi chiqadi

    const filteredHistory = history.filter(h => h.video !== null);

    res.status(200).json(filteredHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
