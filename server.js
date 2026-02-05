const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const authRoutes = require("./routes/authRoutes");


const app = express();

// 2. Middleware (O'rtadagi bog'lovchilar)
app.use(cors()); // Frontenddan keladigan so'rovlarga ruxsat berish
app.use(express.json()); // JSON ma'lumotlarni o'qish uchun
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. API Yo'nalishlari (Endpoints)
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
if (userRoutes) app.use("/api/users", userRoutes);

// 5. Global xatoliklarni ushlash (Server to'xtab qolmasligi uchun)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Serverda ichki xatolik yuz berdi!" });
});

// 6. MongoDB ulanishi va Serverni ishga tushirish
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("XATO: .env faylida MONGO_URI topilmadi!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB ulanishi muvaffaqiyatli amalga oshdi");
    app.listen(PORT, () => {
      console.log(` Server http://localhost:${PORT} portida ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB ulanishida xato:", err.message);
  });