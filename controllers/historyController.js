const History = require("../models/History");

exports.addHistory = async (req, res) => {
  const { videoId } = req.params;

  const item = await History.create({
    user: req.user.id,
    video: videoId,
  });

  res.json(item);
};

exports.getHistory = async (req, res) => {
  const items = await History.find({ user: req.user.id })
    .populate("video")
    .sort({ createdAt: -1 });

  res.json(items);
};
