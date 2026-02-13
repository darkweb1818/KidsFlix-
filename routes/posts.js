const router = require("express").Router();
const { getPostsByUser, createPost } = require("../controllers/postsController");

router.get("/:userId", getPostsByUser);  // <-- shu yer xato bo‘lishi mumkin
router.post("/", createPost);

module.exports = router;
