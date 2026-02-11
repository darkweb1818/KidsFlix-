//const multer = require("multer");

//const storage = multer.diskStorage({
//  destination: "uploads/raw",
//  filename: (req, file, cb) => {
//    cb(null, Date.now() + ".mp4");
//  }
//});

//module.exports = multer({ storage });
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads papka borligini tekshirish
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});


module.exports = upload;
