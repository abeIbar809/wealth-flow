import express from "express";
import { getInsights } from "../controllers/insight.js";

// 👇 ADD IT RIGHT HERE
console.log("Insight route loaded");

const router = express.Router();

router.get("/", getInsights);

export default router;