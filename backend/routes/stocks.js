import express from "express";
import stocksController from "../controllers/stocks.js"

const router = express.Router();

// Get all stocks for a user
router.get("/:userId", stocksController.getStocks);

// Add a new stock
router.post("/", stocksController.addStock);

// Update a stock
router.put("/:stockId", stocksController.updateStock);

// Delete a stock
router.delete("/:stockId", stocksController.deleteStock);

// Refresh prices for all user stocks
router.post("/:userId/refresh", stocksController.refreshPrices);

// Get stock quote
router.get("/quote/:symbol", stocksController.getStockQuote);

// Search for stocks
router.get("/search/stocks", stocksController.searchStocks);

// Get price history for a stock
router.get("/history/:symbol", stocksController.getPriceHistory);

// Get company overview
router.get("/overview/:symbol", stocksController.getCompanyOverview);

export default router;
