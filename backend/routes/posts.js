const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post
router.post("/", async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      body: req.body.body
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;