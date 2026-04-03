import Transaction from "../models/transaction.js";
import { generateFinancialInsights } from "../lib/gemini.js";

export const getInsights = async (req, res) => {
  try {
    const userId = req.query.userId; 

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 1. Get transactions
    const transactions = await Transaction.find({ owner: userId })
      .sort({ date: -1 })
      .limit(100);

    if (!transactions.length) {
      return res.json({
        insights: {
          trends: "No transactions found",
          risks: "",
          savings_opportunities: "",
          recommendations: [],
        },
      });
    }

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = {};
    transactions.forEach((t) => {
      const cat = t.category?.[0] || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    const avgTransaction = totalSpent / (transactions.length || 1);

    const enrichedData = {
      totalSpent,
      avgTransaction,
      transactionCount: transactions.length,
      categories: categoryMap,
      recentTransactions: transactions.slice(0, 20),
    };

    const insights = await generateFinancialInsights(enrichedData);

    // 4. Send response
    res.json({ insights });

  } catch (err) {
    console.error("Insight error:", err);
    res.status(500).json({ error: err.message });
  }
};