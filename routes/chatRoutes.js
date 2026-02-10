//const router = require("express").Router();
//const Chat = require("../models/Chat");
//const multer = require("multer");
//const { uploadFile, sendMessage, editMessage, deleteMessage, getChat } = require("../controllers/chatController");

//// Multer storage
//const storage = multer.diskStorage({
//  destination: (req, file, cb) => cb(null, "uploads/"),
//  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
//});
//const upload = multer({ storage });

//// Routes
//router.get("/:id", getChat);            // load chat
//router.post("/", sendMessage);          // send text message
//router.post("/file", upload.single("file"), uploadFile); // send file (img, video, audio)
//router.put("/:id", editMessage);
//router.delete("/:id", deleteMessage);

//// history
//router.get("/:id", async (req, res) => {
//  const { me } = req.query;

//  const messages = await Chat.find({
//    $or: [
//      { sender: me, receiver: req.params.id },
//      { sender: req.params.id, receiver: me },
//    ],
//  }).sort({ createdAt: 1 });

//  res.json(messages);
//});


//// save message
//router.post("/", async (req, res) => {
//  const msg = await Chat.create(req.body);
//  res.json(msg);
//});


//// seen
//router.put("/seen/:id", async (req, res) => {
//  const { me } = req.query;

//  await Chat.updateMany(
//    { sender: req.params.id, receiver: me },
//    { seen: true }
//  );

//  res.json({ ok: true });
//});


//// delete
//router.delete("/:id", async (req, res) => {
//  await Chat.findByIdAndDelete(req.params.id);
//  res.json({ ok: true });
//});


//// edit
//router.put("/:id", async (req, res) => {
//  const msg = await Chat.findByIdAndUpdate(
//    req.params.id,
//    { text: req.body.text },
//    { new: true }
//  );
//  res.json(msg);
//});

//module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Models
const Chat = require("../models/Chat"); // Chat model bo'lishi kerak

// GET chat history
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { me } = req.query;

    const messages = await Chat.find({
      $or: [
        { sender: me, receiver: id },
        { sender: id, receiver: me },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND text message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const msg = await Chat.create({ sender, receiver, text });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND file message (image, video, audio)
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });

    const { sender, receiver, type } = req.body;
    const msg = await Chat.create({
      sender,
      receiver,
      type, // 'image', 'video', 'audio'
      fileUrl: `/uploads/${req.file.filename}`,
    });

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE message
router.delete("/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EDIT message
router.put("/:id", async (req, res) => {
  try {
    const { text } = req.body;
    const msg = await Chat.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    );
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// MARK messages as seen
router.put("/seen/:id", async (req, res) => {
  try {
    const { id } = req.params; // chat partner id
    const { me } = req.query;  // current user id

    const messages = await Chat.updateMany(
      { sender: id, receiver: me, seen: false },
      { $set: { seen: true } }
    );

    res.json({ updated: messages.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
