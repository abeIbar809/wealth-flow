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
  username: {
    type: String,
    required: true,
    default: "Anonymous",
  },
  category: {
    type: String,
    enum: ["financial", "app", "social", "other"],
    default: "other",
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
    default: "",
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

// Flag a post
app.patch("/api/posts/:id/flag", async (req, res) => {
  try {
    const { flagReason } = req.body;
    console.log("Flagging post:", req.params.id, "Reason:", flagReason);

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        flagged: true,
        flagReason: flagReason || "",
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("Post flagged");
    res.json(post);
  } catch (err) {
    console.error("Error flagging post:", err);
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


//Debt Schema and models
const DebtSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  paymentFrequency: {
    type: String,
    enum: ["weekly", "bi-weekly", "monthly"],
    default: "monthly",
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  extraPayments: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Debt = mongoose.model("Debt", DebtSchema);

// Get all debts for a user
app.get("/api/debts/:userId", async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.params.userId }).sort({ totalAmount: -1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a debt
app.post("/api/debts", async (req, res) => {
  try {
    const debt = new Debt(req.body);
    await debt.save();
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a debt
app.patch("/api/debts/:id", async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ error: "Debt not found" });

    // If totalAmount changed, adjust remainingAmount by the difference
    if (req.body.totalAmount !== undefined && req.body.totalAmount !== debt.totalAmount) {
      const difference = req.body.totalAmount - debt.totalAmount;
      req.body.remainingAmount = Math.max(0, debt.remainingAmount + difference);
    }

    const updated = await Debt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a debt
app.delete("/api/debts/:id", async (req, res) => {
  try {
    await Debt.findByIdAndDelete(req.params.id);
    res.json({ message: "Debt deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Make an extra payment towards a debt
app.post("/api/debts/:id/payment", async (req, res) => {
  try {
    const { amount } = req.body;
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ error: "Debt not found" });
    debt.remainingAmount = Math.max(0, debt.remainingAmount - amount);
    debt.extraPayments   = (debt.extraPayments || 0) + amount;
    await debt.save();
    res.json(debt);
  } catch (err) {
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
