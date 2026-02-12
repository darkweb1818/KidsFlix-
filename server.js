const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

/* ================= ROUTES ================= */
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const authRoutes = require("./routes/authRoutes");
const historyRoutes = require("./routes/historyRoutes");
const chatRoutes = require("./routes/chatRoutes");

/* ================= MODELS ================= */
const User = require("./models/User");
const Chat = require("./models/Chat"); // ✅ FAQT SHU YETADI (Message kerak emas)

/* ================= MIDDLEWARE ================= */
const activity = require("./middleware/activityMiddleware");

const app = express();

/* =================================================
   SERVER + SOCKET SETUP
================================================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

/* =================================================
   ONLINE USERS LOGIC
================================================= */
const getOnlineUsers = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  return await User.find({
    lastActive: { $gte: fiveMinutesAgo },
  }).select("name avatar");
};

/* =================================================
   SOCKET LOGIC
================================================= */

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Yangi xabar
  socket.on("sendMessage", async (data) => {
    try {
      const msgData = {
        sender: data.sender,
        receiver: data.receiver,
        text: data.text || "",
        reactions: [],
        seen: false,
              fileUrl: data.fileUrl || "",
        fileType: data.fileType || "image",
        unreadCount: { [data.receiver]: 1 }, // 🔹 count faqat receiver uchun

      };

      const msg = await Chat.create(msgData);

      io.to(data.receiver).emit("receiveMessage", msg);
      io.to(data.sender).emit("receiveMessage", msg);

      // Live update chat list uchun
      io.to(data.receiver).emit("chatUpdated");
      io.to(data.sender).emit("chatUpdated");

    } catch (err) {
      console.error(err);
    }
  });

  // Typing
  socket.on("typing", ({ receiver }) => io.to(receiver).emit("userTyping"));
  socket.on("stopTyping", ({ receiver }) => io.to(receiver).emit("userStopTyping"));

  // Reaction
  socket.on("reactMessage", async ({ msgId, userId, emoji }) => {
    const msg = await Chat.findById(msgId);
    if (!msg) return;

    const existing = msg.reactions.find((r) => r.user.toString() === userId);
    if (existing) existing.emoji = emoji;
    else msg.reactions.push({ user: userId, emoji });

    await msg.save();

    io.to(msg.sender.toString()).emit("messageReacted", msg);
    io.to(msg.receiver.toString()).emit("messageReacted", msg);
  });

  // Seen messages
  socket.on("seenMessages", async ({ chatId, me }) => {
    await Chat.updateMany(
      { sender: chatId, receiver: me, seen: false },
      { $set: { seen: true } }
    );
    io.to(chatId).emit("messagesSeen", { chatId, me });
  });

  socket.on("disconnect", () => {});
});

/* =================================================
   EXPRESS MIDDLEWARE
================================================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(activity);

/* =================================================
   ROUTES
================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/chats", chatRoutes);

/* =================================================
   DATABASE + START
================================================= */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected");

    server.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
  });
