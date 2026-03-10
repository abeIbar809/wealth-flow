import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/transaction.js";

const router = express.Router();

/**
 * GET /api/expenses/categories/:userId
 * Uses ALL stored transactions for that user (no date filtering).
 */
router.get("/categories/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const txns = await Transaction.find({
      owner: userId,
      amount: { $gt: 0 }, // expenses only
    })
      .select("amount category personal_finance_category")
      .lean();

    const totals = {};
    for (const t of txns) {
      const label =
        (t.personal_finance_category &&
          (t.personal_finance_category.primary || t.personal_finance_category.detailed)) ||
        (Array.isArray(t.category) && t.category[0]) ||
        "Other";

      totals[label] = (totals[label] || 0) + Math.abs(t.amount || 0);
    }

    const aggregated = Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Optional: top N + Other
    const TOP_N = 8;
    const top = aggregated.slice(0, TOP_N);
    const other = aggregated.slice(TOP_N).reduce((s, c) => s + c.amount, 0);
    if (other > 0) top.push({ name: "Other", amount: other });

    return res.status(200).json({ categories: top });
  } catch (error) {
    console.error("Error building categories:", error);
    return res.status(500).json({ message: "Failed to build categories" });
  }
});

export default router;