////////const express = require("express");
////////const router = express.Router();
////////const multer = require("multer");
////////const path = require("path");

////////// Multer storage
////////const storage = multer.diskStorage({
////////  destination: (req, file, cb) => cb(null, "uploads/"),
////////  filename: (req, file, cb) =>
////////    cb(null, Date.now() + path.extname(file.originalname)),
////////});

////////const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

////////// Models
////////const Chat = require("../models/Chat"); // Chat model bo'lishi kerak

////////// GET chat history
////////router.get("/:id", async (req, res) => {
////////  try {
////////    const { id } = req.params;
////////    const { me } = req.query;

////////    const messages = await Chat.find({
////////      $or: [
////////        { sender: me, receiver: id },
////////        { sender: id, receiver: me },
////////      ],
////////    }).sort({ createdAt: 1 });

////////    res.json(messages);
////////  } catch (err) {
////////    res.status(500).json({ error: err.message });
////////  }
////////});

////////// SEND text message
////////router.post("/", async (req, res) => {
////////  try {
////////    const { sender, receiver, text } = req.body;
////////    const msg = await Chat.create({ sender, receiver, text });
////////    res.json(msg);
////////  } catch (err) {
////////    res.status(500).json({ error: err.message });
////////  }
////////});

////////// SEND file message (image, video, audio)
////////router.post("/file", upload.single("file"), async (req, res) => {
////////  try {
////////    if (!req.file) return res.status(400).json({ error: "File required" });

////////    const { sender, receiver, type } = req.body;
////////    const msg = await Chat.create({
////////      sender,
////////      receiver,
////////      type, // 'image', 'video', 'audio'
////////      fileUrl: `/uploads/${req.file.filename}`,
////////    });

////////    res.json(msg);
////////  } catch (err) {
////////    console.error(err);
////////    res.status(500).json({ error: err.message });
////////  }
////////});

////////// DELETE message
////////router.delete("/:id", async (req, res) => {
////////  try {
////////    await Chat.findByIdAndDelete(req.params.id);
////////    res.json({ success: true });
////////  } catch (err) {
////////    res.status(500).json({ error: err.message });
////////  }
////////});

////////// EDIT message
////////router.put("/:id", async (req, res) => {
////////  try {
////////    const { text } = req.body;
////////    const msg = await Chat.findByIdAndUpdate(
////////      req.params.id,
////////      { text },
////////      { new: true }
////////    );
////////    res.json(msg);
////////  } catch (err) {
////////    res.status(500).json({ error: err.message });
////////  }
////////});
////////// MARK messages as seen
////////router.put("/seen/:id", async (req, res) => {
////////  try {
////////    const { id } = req.params; // chat partner id
////////    const { me } = req.query;  // current user id

////////    const messages = await Chat.updateMany(
////////      { sender: id, receiver: me, seen: false },
////////      { $set: { seen: true } }
////////    );

////////    res.json({ updated: messages.modifiedCount });
////////  } catch (err) {
////////    res.status(500).json({ error: err.message });
////////  }
////////});


////////module.exports = router;
//////const express = require("express");
//////const router = express.Router();
//////const multer = require("multer");
//////const path = require("path");
//////const Chat = require("../models/Chat");

//////// Multer storage
//////const storage = multer.diskStorage({
//////  destination: (req, file, cb) => cb(null, "uploads/"),
//////  filename: (req, file, cb) =>
//////    cb(null, Date.now() + path.extname(file.originalname)),
//////});
//////const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

//////// GET chat history
//////router.get("/:id", async (req, res) => {
//////  const { id } = req.params;
//////  const { me } = req.query;
//////  const messages = await Chat.find({
//////    $or: [
//////      { sender: me, receiver: id },
//////      { sender: id, receiver: me }
//////    ],
//////  }).sort({ createdAt: 1 });
//////  res.json(messages);
//////});

//////// SEND text message
//////router.post("/", async (req, res) => {
//////  const msg = await Chat.create(req.body);
//////  res.json(msg);
//////});

//////// SEND file message
//////router.post("/file", upload.single("file"), async (req, res) => {
//////  if (!req.file) return res.status(400).json({ error: "File required" });
//////  const { sender, receiver, type } = req.body;
//////  const msg = await Chat.create({
//////    sender,
//////    receiver,
//////    fileUrl: `/uploads/${req.file.filename}`,
//////    fileType: type,
//////  });
//////  res.json(msg);
//////});

//////// EDIT message
//////router.put("/:id", async (req, res) => {
//////  const { text } = req.body;
//////  const msg = await Chat.findByIdAndUpdate(req.params.id, { text }, { new: true });
//////  res.json(msg);
//////});

//////// DELETE message
//////router.delete("/:id", async (req, res) => {
//////  await Chat.findByIdAndDelete(req.params.id);
//////  res.json({ success: true });
//////});

//////// ADD reaction
//////router.put("/react/:id", async (req, res) => {
//////  const { userId, emoji } = req.body;
//////  const msg = await Chat.findById(req.params.id);
//////  if (!msg) return res.status(404).json({ error: "Message not found" });
//////  const existing = msg.reactions.find(r => r.user.toString() === userId);
//////  if (existing) existing.emoji = emoji;
//////  else msg.reactions.push({ user: userId, emoji });
//////  await msg.save();
//////  res.json(msg);
//////});

//////// MARK as seen
//////router.put("/seen/:id", async (req, res) => {
//////  const { me } = req.query;
//////  const messages = await Chat.updateMany(
//////    { sender: req.params.id, receiver: me, seen: false },
//////    { $set: { seen: true } }
//////  );
//////  res.json({ updated: messages.modifiedCount });
//////});

//////// GET chat list
//////router.get("/list", async (req, res) => {
//////  const { me } = req.query;

//////  const chats = await Chat.find({
//////    participants: me
//////  })
//////    .populate("participants", "name avatar")
//////    .sort({ updatedAt: -1 });

//////  // Oxirgi xabar va unread count
//////  const formatted = chats.map(chat => {
//////    const lastMessage = chat.messages[chat.messages.length - 1];
//////    const unreadCount = chat.unreadCount || {};
//////    return {
//////      _id: chat._id,
//////      participants: chat.participants,
//////      lastMessage: lastMessage?.text || "",
//////      unreadCount
//////    };
//////  });

//////  res.json(formatted);
//////});


//////module.exports = router;
////const express = require("express");
////const router = express.Router();
////const multer = require("multer");
////const path = require("path");
////const Chat = require("../models/Chat");

////// ================= MULTER STORAGE =================
////const storage = multer.diskStorage({
////  destination: (req, file, cb) => cb(null, "uploads/"), // backend rootda uploads papka bo'lishi kerak
////  filename: (req, file, cb) =>
////    cb(null, Date.now() + path.extname(file.originalname)),
////});
////const upload = multer({
////  storage,
////  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
////});

////// ================= ROUTES =================

////// GET chat history
////router.get("/:id", async (req, res) => {
////  const { id } = req.params;
////  const { me } = req.query;

////  const messages = await Chat.find({
////    $or: [
////      { sender: me, receiver: id },
////      { sender: id, receiver: me }
////    ],
////  }).sort({ createdAt: 1 });

////  res.json(messages);
////});

////// SEND text message
////router.post("/", async (req, res) => {
////  const msg = await Chat.create(req.body);
////  res.json(msg);
////});

////// SEND file message
////router.post("/file", upload.single("file"), async (req, res) => {
////  if (!req.file) return res.status(400).json({ error: "File required" });

////  const { sender, receiver, type } = req.body;

////  const msg = await Chat.create({
////    sender,
////    receiver,
////    fileUrl: `/uploads/${req.file.filename}`, // frontendga static URL jo'natiladi
////    fileType: type,
////    text: "",
////    reactions: [],
////    seen: false
////  });

////  res.json(msg);
////});

////// EDIT message
////router.put("/:id", async (req, res) => {
////  const { text } = req.body;
////  const msg = await Chat.findByIdAndUpdate(req.params.id, { text }, { new: true });
////  res.json(msg);
////});

////// DELETE message
////router.delete("/:id", async (req, res) => {
////  await Chat.findByIdAndDelete(req.params.id);
////  res.json({ success: true });
////});

////// ADD reaction
////router.put("/react/:id", async (req, res) => {
////  const { userId, emoji } = req.body;
////  const msg = await Chat.findById(req.params.id);
////  if (!msg) return res.status(404).json({ error: "Message not found" });

////  const existing = msg.reactions.find(r => r.user.toString() === userId);
////  if (existing) existing.emoji = emoji;
////  else msg.reactions.push({ user: userId, emoji });

////  await msg.save();
////  res.json(msg);
////});

////// MARK as seen
////router.put("/seen/:id", async (req, res) => {
////  const { me } = req.query;
////  const messages = await Chat.updateMany(
////    { sender: req.params.id, receiver: me, seen: false },
////    { $set: { seen: true } }
////  );
////  res.json({ updated: messages.modifiedCount });
////});

////// GET chat list
////router.get("/list", async (req, res) => {
////  const { me } = req.query;

////  const chats = await Chat.find({
////    participants: me
////  })
////    .populate("participants", "name avatar")
////    .sort({ updatedAt: -1 });

////  // Oxirgi xabar va unread count
////  const formatted = chats.map(chat => {
////    const lastMessage = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
////    const unreadCount = chat.unreadCount || {};
////    return {
////      _id: chat._id,
////      participants: chat.participants,
////      lastMessage: lastMessage?.text || "",
////      unreadCount
////    };
////  });

////  res.json(formatted);
////});

////module.exports = router;
//const express = require("express");
//const multer = require("multer");
//const path = require("path");
//const Chat = require("../models/Chat");
//const router = express.Router();

//// ================= MULTER STORAGE =================
//const storage = multer.diskStorage({
//  destination: (req, file, cb) => cb(null, "uploads/"), // backend rootda uploads papka bo'lishi kerak
//  filename: (req, file, cb) =>
//    cb(null, Date.now() + path.extname(file.originalname)),
//});

//const upload = multer({
//  storage,
//  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
//});

//// ================= ROUTES =================

//// GET chat history
//router.get("/:id", async (req, res) => {
//  try {
//    const { id } = req.params;
//    const { me } = req.query;

//    const messages = await Chat.find({
//      $or: [
//        { sender: me, receiver: id },
//        { sender: id, receiver: me }
//      ],
//    }).sort({ createdAt: 1 });

//    res.json(messages);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// SEND text message
//router.post("/", async (req, res) => {
//  try {
//    const msg = await Chat.create(req.body);
//    res.json(msg);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// SEND file message
//router.post("/file", upload.single("file"), async (req, res) => {
//  try {
//    if (!req.file) return res.status(400).json({ error: "File required" });

//    const { sender, receiver, type } = req.body;

//    const msg = await Chat.create({
//      sender,
//      receiver,
//      fileUrl: `/uploads/${req.file.filename}`, // frontendga static URL jo'natiladi
//      fileType: type,
//      text: "",
//      reactions: [],
//      seen: false
//    });

//    res.json(msg);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// EDIT message
//router.put("/:id", async (req, res) => {
//  try {
//    const { text } = req.body;
//    const msg = await Chat.findByIdAndUpdate(req.params.id, { text }, { new: true });
//    res.json(msg);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// DELETE message
//router.delete("/:id", async (req, res) => {
//  try {
//    await Chat.findByIdAndDelete(req.params.id);
//    res.json({ success: true });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// ADD reaction
//router.put("/react/:id", async (req, res) => {
//  try {
//    const { userId, emoji } = req.body;
//    const msg = await Chat.findById(req.params.id);
//    if (!msg) return res.status(404).json({ error: "Message not found" });

//    const existing = msg.reactions.find(r => r.user.toString() === userId);
//    if (existing) existing.emoji = emoji;
//    else msg.reactions.push({ user: userId, emoji });

//    await msg.save();
//    res.json(msg);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// MARK as seen
//router.put("/seen/:id", async (req, res) => {
//  try {
//    const { me } = req.query;
//    const messages = await Chat.updateMany(
//      { sender: req.params.id, receiver: me, seen: false },
//      { $set: { seen: true } }
//    );
//    res.json({ updated: messages.modifiedCount });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//// GET chat list
//router.get("/list", async (req, res) => {
//  try {
//    const { me } = req.query;

//    const chats = await Chat.find({
//      participants: me
//    })
//      .populate("participants", "name avatar")
//      .sort({ updatedAt: -1 });

//    const formatted = chats.map(chat => {
//      const lastMessage = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
//      const unreadCount = chat.unreadCount || {};
//      return {
//        _id: chat._id,
//        participants: chat.participants,
//        lastMessage: lastMessage?.text || "",
//        unreadCount
//      };
//    });

//    res.json(formatted);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});

//module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Chat = require("../models/Chat");
const router = express.Router();

// ================= UPLOAD PAPKA =================
const uploadFolder = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// ================= MULTER STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// ================= ROUTES =================

// GET chat history
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

// SEND text message
router.post("/", async (req, res) => {
  try {
    const msg = await Chat.create(req.body);
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// SEND file message
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });

    const { sender, receiver, type } = req.body;

    const msg = await Chat.create({
      sender,
      receiver,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: type || "file",
      text: "",
      reactions: [],
      seen: false
    });

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// EDIT message
router.put("/:id", async (req, res) => {
  try {
    const { text } = req.body;
    const msg = await Chat.findByIdAndUpdate(req.params.id, { text }, { new: true });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE message
router.delete("/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD reaction
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

// MARK as seen
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

// GET chat list
router.get("/list", async (req, res) => {
  try {
    const { me } = req.query;
    if (!me) return res.status(400).json({ error: "me query required" });

    const chats = await Chat.find({
      participants: me
    })
      .populate("participants", "name avatar")
      .sort({ updatedAt: -1 });

    const formatted = chats.map(chat => {
      const lastMessage = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
      const unreadCount = chat.unreadCount || {};
      return {
        _id: chat._id,
        participants: chat.participants,
        lastMessage: lastMessage?.text || "",
        unreadCount
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
