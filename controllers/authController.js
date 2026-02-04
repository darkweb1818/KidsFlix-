const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Barcha maydonlar majburiy"
      });
    }

    // email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: "Email allaqachon mavjud"
      });
    }

    // hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // ❗ role FRONTENDDAN KELMAYDI
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student" // default
    });

    // passwordni olib tashlaymiz
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.status(201).json({
      message: "Ro‘yxatdan o‘tildi",
      user: safeUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server xatolik"
    });
  }
};



// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email va parol kiriting"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Login yoki parol noto‘g‘ri"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Login yoki parol noto‘g‘ri"
      });
    }

    // token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.json({
      token,
      user: safeUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server xatolik"
    });
  }
};
