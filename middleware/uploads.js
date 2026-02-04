const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/raw",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".mp4");
  }
});

module.exports = multer({ storage });
