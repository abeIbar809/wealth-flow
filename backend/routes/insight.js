import express from "express";
import { getInsights } from "../controllers/insight.js";

// Debug log to confirm this route file is loaded
console.log("Insight route loaded");

// Create a new Express router
const router = express.Router();

// Define GET route for "/" → calls getInsights controller
router.get("/", getInsights);

// Export router so it can be used in your main server file
export default router;