//const Chat = require("../models/Chat"); // Mongoose model

//// GET chat history
//exports.getChat = async (req, res) => {
//  const { id } = req.params;
//  const { me } = req.query;
//  const messages = await Chat.find({
//    $or: [
//      { sender: me, receiver: id },
//      { sender: id, receiver: me }
//    ]
//  }).sort({ createdAt: 1 });
//  res.json(messages);
//};

//// SEND text message
//exports.sendMessage = async (req, res) => {
//  const msg = await Chat.create(req.body);
//  res.json(msg);
//};

//// SEND file (image/video/audio)
//exports.uploadFile = async (req, res) => {
//  if (!req.file) return res.status(400).json({ error: "File missing" });

//  const fileType = req.file.mimetype;
//  const fileUrl = `/uploads/${req.file.filename}`;

//  const msg = await Chat.create({
//    sender: req.body.sender,
//    receiver: req.body.receiver,
//    text: req.body.text || "",
//    fileUrl,
//    fileType
//  });

//  res.json(msg);
//};

//// EDIT message
//exports.editMessage = async (req, res) => {
//  const msg = await Chat.findByIdAndUpdate(req.params.id, { text: req.body.text }, { new: true });
//  res.json(msg);
//};

//// DELETE message
//exports.deleteMessage = async (req, res) => {
//  await Chat.findByIdAndDelete(req.params.id);
//  res.json({ success: true });
//};
const Chat = require("../models/Chat"); // Mongoose model

// GET chat history
exports.getChat = async (req, res) => {
  const { id } = req.params;
  const { me } = req.query;
  const messages = await Chat.find({
    $or: [
      { sender: me, receiver: id },
      { sender: id, receiver: me }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
};

// SEND text message
exports.sendMessage = async (req, res) => {
  const msg = await Chat.create(req.body);
  res.json(msg);
};

// SEND file (image/video/audio)
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File missing" });

  const fileType = req.file.mimetype.startsWith("image")
    ? "image"
    : req.file.mimetype.startsWith("video")
    ? "video"
    : "audio";

  const fileUrl = `/uploads/${req.file.filename}`;

  const msg = await Chat.create({
    sender: req.body.sender,
    receiver: req.body.receiver,
    text: req.body.text || "",
    fileUrl,
    fileType,
    reactions: [],
    seen: false
  });

  res.json(msg);
};

// EDIT message
exports.editMessage = async (req, res) => {
  const msg = await Chat.findByIdAndUpdate(req.params.id, { text: req.body.text }, { new: true });
  res.json(msg);
};

// DELETE message
exports.deleteMessage = async (req, res) => {
  await Chat.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
