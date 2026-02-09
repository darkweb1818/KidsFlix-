//const express = require("express");
//const mongoose = require("mongoose");
//const cors = require("cors");
//const path = require("path");
//const fileUpload = require("express-fileupload");
//require("dotenv").config();

//const http = require("http");
//const { Server } = require("socket.io");

//const userRoutes = require("./routes/userRoutes");
//const videoRoutes = require("./routes/videoRoutes");
//const authRoutes = require("./routes/authRoutes");
//const historyRoutes = require("./routes/historyRoutes");
//const activity = require("./middleware/activityMiddleware");
//const User = require("./models/User");

//const app = express();

///* ================= SERVER + SOCKET ================= */

//const server = http.createServer(app);

//const io = new Server(server, {
//  cors: { origin: "*" }
//});

//global.io = io;

///* ================= SOCKET LOGIC ================= */

//const getOnlineUsers = async () => {
//  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//  return await User.find({
//    lastActive: { $gte: fiveMinutesAgo }
//  }).select("name avatar");
//};

////io.on("connection", (socket) => {
////  console.log("Socket connected:", socket.id);

////  socket.on("join", async (userId) => {
////    if (!userId) return;

////    await User.findByIdAndUpdate(userId, {
////      lastActive: new Date()
////    });

////    const users = await getOnlineUsers();
////    io.emit("online-users", users);
////  });

////  socket.on("disconnect", async () => {
////    const users = await getOnlineUsers();
////    io.emit("online-users", users);
////  });
////});


//// server.js
//io.on("connection", (socket) => {
//  console.log("New client connected", socket.id);

//  socket.on("followChanged", (data) => {
//    // data = { userId, followerId, type: 'follow'|'unfollow' }
//    io.emit("followUpdated", data); // hamma clientga yuboradi
//  });

//  socket.on("disconnect", () => {
//    console.log("Client disconnected", socket.id);
//  });
//});

//server.listen(5000, () => console.log("Server running on port 5000"));

///* ================= MIDDLEWARE ================= */

//app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

//app.use(
//  fileUpload({
//    useTempFiles: true,
//    tempFileDir: "/tmp/"
//  })
//);

//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

///* ================= ROUTES ================= */

//app.use(activity);

//app.use("/api/auth", authRoutes);
//app.use("/api/videos", videoRoutes);
//app.use("/api/users", userRoutes);
//app.use("/api/history", historyRoutes);

///* ================= START ================= */

//const PORT = process.env.PORT || 5000;
//const MONGO_URI = process.env.MONGO_URI;

//mongoose
//  .connect(MONGO_URI)
//  .then(() => {
//    console.log("MongoDB connected");

//    server.listen(PORT, () => {
//      console.log(`Server running on http://localhost:${PORT}`);
//    });
//  })
//  .catch(console.error);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const authRoutes = require("./routes/authRoutes");
const historyRoutes = require("./routes/historyRoutes");
const activity = require("./middleware/activityMiddleware");

const User = require("./models/User");

const app = express();

/* ================= SERVER + SOCKET ================= */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
global.io = io;

/* ================= SOCKET LOGIC ================= */
const getOnlineUsers = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return await User.find({ lastActive: { $gte: fiveMinutesAgo } }).select(
    "name avatar"
  );
};

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join", async (userId) => {
    if (!userId) return;
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });

    const users = await getOnlineUsers();
    io.emit("online-users", users);
  });

  socket.on("followChanged", (data) => {
    // data = { userId, followerId, type: 'follow'|'unfollow' }
    io.emit("followUpdated", data);
  });

  socket.on("disconnect", async () => {
    const users = await getOnlineUsers();
    io.emit("online-users", users);
    console.log("Client disconnected", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */
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

/* ================= ROUTES ================= */
app.use(activity);

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
