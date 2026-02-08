const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { addHistory, getHistory } = require("../controllers/historyController");

router.post("/:id", auth, addHistory);
router.get("/", auth, getHistory);

module.exports = router;
