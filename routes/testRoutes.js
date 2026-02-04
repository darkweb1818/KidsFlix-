const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// hamma login qilgan user
router.get("/profile", auth, (req, res) => {
  res.json({ message: "Profilga kirdingiz", user: req.user });
});

// faqat admin
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({ message: "Admin panelga xush kelibsiz" });
});

module.exports = router;
