const Post = require("../models/Post");

// Get posts by user
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load posts" });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create({ ...req.body, author: req.user.id });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Like post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to like post" });
  }
};

// Comment post
exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to comment post" });
  }
};
