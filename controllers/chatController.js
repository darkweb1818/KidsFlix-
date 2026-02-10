//const Chat = require("../models/Chat");

//exports.getChat = async (req, res) => {
//  try {
//    const { userId } = req.params;
//    const { me } = req.query;

//    let chat = await Chat.findOne({
//      participants: { $all: [me, userId] },
//    }).populate("messages.sender", "username avatar");

//    if (!chat) {
//      chat = await Chat.create({
//        participants: [me, userId],
//        messages: [],
//      });
//    }

//    res.json(chat);
//  } catch (err) {
//    res.status(500).json({ error: err.message });
//  }
//};

//exports.sendMessage = async (req, res) => {
//  try {
//    const { userId } = req.params;
//    const { me, text } = req.body;

//    let chat = await Chat.findOne({
//      participants: { $all: [me, userId] },
//    });

//    if (!chat) {
//      chat = await Chat.create({
//        participants: [me, userId],
//        messages: [],
//      });
//    }

//    chat.messages.push({
//      sender: me,
//      text,
//    });

//    await chat.save();

//    res.json({ success: true });
//  } catch (err) {
//    res.status(500).json({ error: err.message });
//  }
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

  const fileType = req.file.mimetype;
  const fileUrl = `/uploads/${req.file.filename}`;

  const msg = await Chat.create({
    sender: req.body.sender,
    receiver: req.body.receiver,
    text: req.body.text || "",
    fileUrl,
    fileType
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
