const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const videoRoutes = require("./routes/videoRoutes");
//const { likeComment, replyToComment } = require("./controllers/videoController");
const app = express();

// ===== Middleware =====
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
  })
);

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/videos", videoRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Kids Platform API ishlayapti");
});

// ===== MongoDB connect =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));
