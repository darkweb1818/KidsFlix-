const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload"); // 🎯 qo‘shildi
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Yo'nalishlari
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
if (userRoutes) app.use("/api/users", userRoutes);

// Global xatoliklarni ushlash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Serverda ichki xatolik yuz berdi!" });
});

// MongoDB va Server ishga tushirish
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("XATO: .env faylida MONGO_URI topilmadi!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB ulanishi muvaffaqiyatli amalga oshdi");
    app.listen(PORT, () => {
      console.log(`Server http://localhost:${PORT} portida ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error("MongoDB ulanishida xato:", err.message);
  });
