////const express = require("express");
////const mongoose = require("mongoose");
////const cors = require("cors");
////const path = require("path");
////const fileUpload = require("express-fileupload");
////require("dotenv").config();

////const http = require("http");
////const { Server } = require("socket.io");

////const userRoutes = require("./routes/userRoutes");
////const videoRoutes = require("./routes/videoRoutes");
////const authRoutes = require("./routes/authRoutes");
////const historyRoutes = require("./routes/historyRoutes");
////const activity = require("./middleware/activityMiddleware");
////const User = require("./models/User");
////const Message = require("./models/Message");
////const messageRoutes = require("./routes/messageRoutes");

////const app = express();

/////* ================= SERVER + SOCKET ================= */
////const server = http.createServer(app);
////const io = new Server(server, {
////  cors: { origin: "*" },
////});
////global.io = io;

/////* ================= SOCKET LOGIC ================= */
////const getOnlineUsers = async () => {
////  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
////  return await User.find({ lastActive: { $gte: fiveMinutesAgo } }).select(
////    "name avatar"
////  );
////};

////io.on("connection", (socket) => {
////  console.log("New client connected", socket.id);

////  socket.on("join", async (userId) => {
////    if (!userId) return;
////    await User.findByIdAndUpdate(userId, { lastActive: new Date() });

////    const users = await getOnlineUsers();
////    io.emit("online-users", users);
////  });

////  socket.on("followChanged", (data) => {
////    // data = { userId, followerId, type: 'follow'|'unfollow' }
////    io.emit("followUpdated", data);
////  });

////  socket.on("disconnect", async () => {
////    const users = await getOnlineUsers();
////    io.emit("online-users", users);
////    console.log("Client disconnected", socket.id);
////  });
////});

/////* ================= MIDDLEWARE ================= */
////app.use(cors());
////app.use(express.json());
////app.use(express.urlencoded({ extended: true }));

////app.use(
////  fileUpload({
////    useTempFiles: true,
////    tempFileDir: "/tmp/",
////  })
////);

////app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/////* ================= ROUTES ================= */
////app.use(activity);

////app.use("/api/auth", authRoutes);
////app.use("/api/videos", videoRoutes);
////app.use("/api/users", userRoutes);
////app.use("/api/history", historyRoutes);
////app.use("/api/messages", messageRoutes);

/////* ================= START SERVER ================= */
////const PORT = process.env.PORT || 5000;
////const MONGO_URI = process.env.MONGO_URI;

////mongoose
////  .connect(MONGO_URI)
////  .then(() => {
////    console.log("MongoDB connected");

////    server.listen(PORT, () => {
////      console.log(`Server running on http://localhost:${PORT}`);
////    });
////  })
////  .catch(console.error);
//const express = require("express");
//const mongoose = require("mongoose");
//const cors = require("cors");
//const path = require("path");
//const fileUpload = require("express-fileupload");
//require("dotenv").config();

//const http = require("http");
//const { Server } = require("socket.io");

///* ================= ROUTES ================= */
//const userRoutes = require("./routes/userRoutes");
//const videoRoutes = require("./routes/videoRoutes");
//const authRoutes = require("./routes/authRoutes");
//const historyRoutes = require("./routes/historyRoutes");
//const chatRoutes = require("./routes/chatRoutes");



///* ================= MODELS ================= */
//const User = require("./models/User");


///* ================= MIDDLEWARE ================= */
//const activity = require("./middleware/activityMiddleware");

//const app = express();

///* =================================================
//   SERVER + SOCKET SETUP
//================================================= */
//const server = http.createServer(app);

//const io = new Server(server, {
//  cors: {
//    origin: "*", // prod da frontend url qo'yasan
//  },
//});

//global.io = io;

///* =================================================
//   ONLINE USERS LOGIC
//================================================= */
//const getOnlineUsers = async () => {
//  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//  return await User.find({
//    lastActive: { $gte: fiveMinutesAgo },
//  }).select("name avatar");
//};

///* =================================================
//   SOCKET LOGIC
//================================================= */
//io.on("connection", (socket) => {
//  console.log("🟢 Connected:", socket.id);

//  /* ===== USER JOIN ===== */
//  socket.on("join", async (userId) => {
//    if (!userId) return;

//    try {
//      await User.findByIdAndUpdate(userId, { lastActive: new Date() });

//      socket.join(userId);

//      const users = await getOnlineUsers();
//      io.emit("online-users", users);
//    } catch (err) {
//      console.error("Join error:", err);
//    }
//  });

//  /* ===== FOLLOW REALTIME ===== */
//  socket.on("followChanged", (data) => {
//    io.emit("followUpdated", data);
//  });

//  /* =================================================
//     CHAT SYSTEM
//  ================================================= */

//  /* room join */
//  socket.on("join-room", (userId) => {
//    if (!userId) return;
//    socket.join(userId);
//  });

//  /* send message */
//  socket.on("sendMessage", async (data) => {
//    try {
//      if (!data?.sender || !data?.receiver || !data?.text?.trim()) return;

//      const msg = await Message.create({
//        sender: data.sender,
//        receiver: data.receiver,
//        text: data.text,
//      });

//      // both usersga yuboriladi
//      io.to(data.receiver).emit("receiveMessage", msg);
//      io.to(data.sender).emit("receiveMessage", msg);
//    } catch (err) {
//      console.error("Message error:", err);
//    }
//  });

//  /* ===== DISCONNECT ===== */
//  socket.on("disconnect", async () => {
//    console.log("🔴 Disconnected:", socket.id);

//    const users = await getOnlineUsers();
//    io.emit("online-users", users);
//  });
//});
////io.on("connection", (socket) => {
////  socket.on("joinChat", (chatId) => {
////    socket.join(chatId);
////  });
////});


///* =================================================
//   EXPRESS MIDDLEWARE
//================================================= */
//app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

//app.use(
//  fileUpload({
//    useTempFiles: true,
//    tempFileDir: "/tmp/",
//  })
//);

//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//app.use(activity);

///* =================================================
//   ROUTES
//================================================= */
//app.use("/api/auth", authRoutes);
//app.use("/api/videos", videoRoutes);
//app.use("/api/users", userRoutes);
//app.use("/api/history", historyRoutes);
//app.use("/api/chats", chatRoutes);


///* =================================================
//   DATABASE + START
//================================================= */
//const PORT = process.env.PORT || 5000;
//const MONGO_URI = process.env.MONGO_URI;

//mongoose
//  .connect(MONGO_URI)
//  .then(() => {
//    console.log("✅ MongoDB connected");

//    server.listen(PORT, () => {
//      console.log(`🚀 Server running on http://localhost:${PORT}`);
//    });
//  })
//  .catch((err) => {
//    console.error("Mongo error:", err);
//  });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
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
//io.on("connection", (socket) => {
//  console.log("🟢 Connected:", socket.id);

//  /* ================= JOIN ================= */
//  socket.on("join", async (userId) => {
//    if (!userId) return;

//    socket.join(userId);

//    await User.findByIdAndUpdate(userId, {
//      lastActive: new Date(),
//    });

//    const users = await getOnlineUsers();
//    io.emit("online-users", users);
//  });

//  /* ================= FOLLOW REALTIME ================= */
//  socket.on("followChanged", (data) => {
//    io.emit("followUpdated", data);
//  });

//  /* ================= CHAT ROOM ================= */
//  socket.on("join-room", (userId) => {
//    socket.join(userId);
//  });

//  /* ================= TYPING ================= */
//  socket.on("typing", ({ sender, receiver }) => {
//    io.to(receiver).emit("typing", { sender });
//  });

//  /* ================= STOP TYPING ================= */
//  socket.on("stopTyping", ({ sender, receiver }) => {
//    io.to(receiver).emit("stopTyping", { sender });
//  });

//  /* ================= SEND MESSAGE ================= */
//  socket.on("sendMessage", async (data) => {
//    try {
//      const { sender, receiver, text } = data;

//      if (!sender || !receiver || !text?.trim()) return;

//      let chat = await Chat.findOne({
//        participants: { $all: [sender, receiver] },
//      });

//      if (!chat) {
//        chat = await Chat.create({
//          participants: [sender, receiver],
//        });
//      }

//      const message = {
//        sender,
//        text,
//        seen: false,
//        createdAt: new Date(),
//      };

//      chat.messages.push(message);

//      /* last message */
//      chat.lastMessage = text;

//      /* unread count */
//      chat.unreadCount.set(
//        receiver.toString(),
//        (chat.unreadCount.get(receiver.toString()) || 0) + 1
//      );

//      await chat.save();

//      io.to(receiver).emit("receiveMessage", message);
//      io.to(sender).emit("receiveMessage", message);

//      /* chat list update */
//      io.to(receiver).emit("chatUpdated");
//      io.to(sender).emit("chatUpdated");
//    } catch (err) {
//      console.error(err);
//    }
//  });

//  /* ================= SEEN ================= */
//  socket.on("seenMessages", async ({ chatId, userId }) => {
//    const chat = await Chat.findById(chatId);

//    if (!chat) return;

//    chat.messages.forEach((m) => {
//      if (m.sender.toString() !== userId) m.seen = true;
//    });

//    chat.unreadCount.set(userId, 0);

//    await chat.save();

//    io.to(chat.participants[0].toString()).emit("messagesSeen");
//    io.to(chat.participants[1].toString()).emit("messagesSeen");
//  });

//  /* ================= DISCONNECT ================= */
//  socket.on("disconnect", async () => {
//    const users = await getOnlineUsers();
//    io.emit("online-users", users);
//  });
//});
io.on("connection", (socket) => {

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", async (data) => {
    const msg = await Chat.create(data);

    io.to(data.receiver).emit("receiveMessage", msg);
    io.to(data.sender).emit("receiveMessage", msg);
  });

  socket.on("typing", ({ receiver }) => {
    io.to(receiver).emit("userTyping");
  });

  socket.on("stopTyping", ({ receiver }) => {
    io.to(receiver).emit("userStopTyping");
  });
});


/* =================================================
   EXPRESS MIDDLEWARE
================================================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

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
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
  });
