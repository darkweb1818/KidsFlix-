const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Chat = require("../models/Chat");

const router = express.Router();

/* ================= UPLOAD PAPKA ================= */
const uploadFolder = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

/* ================= MULTER STORAGE ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

/* ================= GET chat list ================= */


router.get("/list", async (req, res) => {
  try {
    const { me } = req.query;
    if (!me) return res.status(400).json({ message: "User id (me) is required" });

    console.log("Fetching chats for user:", me);

    const chats = await Chat.find({
      $or: [
        { sender: me },
        { receiver: me }
      ]
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Chats found:", chats.length);

    // Duplicate partnerlarni yo‘q qilish
    const seenPartners = new Set();
    const formatted = [];

    chats.forEach(chat => {
      const partner = chat.sender._id.toString() === me ? chat.receiver : chat.sender;
      if (!partner) return; // 🔹 partner mavjud bo‘lmasa skip

      if (!seenPartners.has(partner._id.toString())) {
        seenPartners.add(partner._id.toString());
        const hasMessage = chat.text || chat.fileUrl;

        formatted.push({
          ...chat,
          partner,
          lastMessage: chat.text || (chat.fileUrl ? "Media" : ""),
          unreadCount: hasMessage ? (chat.unreadCount || { [me]: 0 }) : { [me]: 0 },
          lastMessageAt: chat.createdAt
        });
      }
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error in /chats/list:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ================= SEND text message ================= */
router.post("/", async (req, res) => {
  try {
    const msg = await Chat.create(req.body);
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= SEND file message ================= */
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });
    const { sender, receiver, type, text } = req.body;

    const msg = await Chat.create({
      sender,
      receiver,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: type || "image",
      text: text|| "",
      reactions: [],
      seen: false,
      unreadCount: { [receiver]: 1 }
    });



    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/* ================= REACT message ================= */
router.put("/react/:id", async (req, res) => {
  try {
    const { userId, emoji } = req.body;
    const msg = await Chat.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    const existing = msg.reactions.find(r => r.user.toString() === userId);
    if (existing) existing.emoji = emoji;
    else msg.reactions.push({ user: userId, emoji });

    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= MARK as seen ================= */
router.put("/seen/:id", async (req, res) => {
  try {
    const { me } = req.query;
    if (!me) return res.status(400).json({ error: "me query required" });

    const messages = await Chat.updateMany(
      { sender: req.params.id, receiver: me, seen: false },
      { $set: { seen: true } }
    );

    res.json({ updated: messages.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= EDIT message ================= */
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= DELETE message ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/chats/account/:partnerId?me=userId
router.delete("/account/:partnerId", async (req, res) => {
  try {
    const me = req.query.me;
    const partnerId = req.params.partnerId;

    // Chatni haqiqatan o'chirish
    await Chat.deleteMany({
      $or: [
        { sender: me, receiver: partnerId },
        { sender: partnerId, receiver: me }
      ]
    });

    // Socket orqali frontendga yuborish
    if (global.io) {
      global.io.to(me).emit("chatDeleted", { partnerId });
      global.io.to(partnerId).emit("chatDeleted", { by: me });
    }

    res.json({ message: "Chat deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET chat history ================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { me } = req.query;
    if (!me) return res.status(400).json({ error: "me query required" });

    const messages = await Chat.find({
      $or: [
        { sender: me, receiver: id },
        { sender: id, receiver: me }
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
