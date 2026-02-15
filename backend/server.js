import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import userrouter from "./routes/users.js";
import plaidRoutes from "./routes/plaid.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI);
const con = mongoose.connection;

try {
  con.on("open", () => {
    console.log("Connected to the database");
  });
} catch (error) {
  console.log("Error: " + error);
}

// Post Schema + Model
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Post = mongoose.model("Post", PostSchema);

// Routes
// Create post
app.post("/api/posts", async (req, res) => {
  try {
    console.log("Creating post:", req.body);
    const post = new Post(req.body);
    await post.save();
    console.log("Post saved:", post);
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    console.log("Fetching posts...");
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    console.log("Deleting post:", req.params.id);
    await Post.findByIdAndDelete(req.params.id);
    console.log("Post deleted");
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add reply to post
app.post("/api/posts/:id/replies", async (req, res) => {
  try {
    console.log("Adding reply to post:", req.params.id);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.replies.push({
      content: req.body.content,
      createdAt: new Date(),
    });

    await post.save();
    console.log("Reply added");
    res.status(201).json(post);
  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete reply from post
app.delete("/api/posts/:postId/replies/:replyId", async (req, res) => {
  try {
    console.log("Deleting reply:", req.params.replyId);
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.replies = post.replies.filter((reply) => reply._id.toString() !== req.params.replyId);
    await post.save();

    console.log("Reply deleted");
    res.json(post);
  } catch (err) {
    console.error("Error deleting reply:", err);
    res.status(500).json({ error: err.message });
  }
});

//Server demo
app.get("/backend-test", async (req, res) => {
  try {
    // 1. SIMPLE SERVER CHECK
    console.log("Backend test started.");

    // 2. TEMP TEST MODEL (not part of your real schema)
    const TestModel = mongoose.model("TestBackend", new mongoose.Schema({ message: String }), "test_backend_collection");

    // 3. WRITE SAMPLE DATA
    const created = await TestModel.create({
      message: "Hello from backend test!",
    });

    // 4. READ EVERYTHING BACK
    const allDocs = await TestModel.find();

    // 5. RETURN SUMMARY
    return res.json({
      server: "OK",
      dbWrite: created,
      dbRead: allDocs,
    });
  } catch (err) {
    console.error("Backend test error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.use("/api/plaid", plaidRoutes);
app.use("/users", userrouter);

// Start Server
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log("Listening on Port: " + port);
});
