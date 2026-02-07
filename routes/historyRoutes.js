const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  addHistory,
  getHistory,
} = require("../controllers/historyController");

router.post("/:videoId", auth, addHistory);
router.get("/", auth, getHistory);

module.exports = router;
