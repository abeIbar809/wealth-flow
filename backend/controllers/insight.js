import Transaction from "../models/transaction.js";
import { generateFinancialInsights } from "../lib/gemini.js";

// Controller to get AI-generated financial insights
export const getInsights = async (req, res) => {
  try {
    // Get userId from query params
    const userId = req.query.userId; 

    // If no userId provided, return error
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Fetch latest 100 transactions for this user (most recent first)
    const transactions = await Transaction.find({ owner: userId })
      .sort({ date: -1 })
      .limit(100);

    // If no transactions exist, return default empty insights
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

    // Calculate total amount spent
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Group spending by category
    const categoryMap = {};
    transactions.forEach((t) => {
      const cat = t.category?.[0] || "Other"; // fallback if no category
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    // Calculate average transaction amount
    const avgTransaction = totalSpent / (transactions.length || 1);

    // Prepare data to send to AI
    const enrichedData = {
      totalSpent,
      avgTransaction,
      transactionCount: transactions.length,
      categories: categoryMap,
      recentTransactions: transactions.slice(0, 20), // only send recent 20
    };

    // Generate insights using Gemini (AI)
    const insights = await generateFinancialInsights(enrichedData);

    // Send insights back to client
    res.json({ insights });

  } catch (err) {
    // Handle errors
    console.error("Insight error:", err);
    res.status(500).json({ error: err.message });
  }
};