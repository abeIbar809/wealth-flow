import Stock from "../models/stock.js";
import PriceHistory from "../models/priceHistory.js";
import { alphaVantageClient } from "../lib/alphaVantageClient.js";

//Get all stocks for a user
const getStocks = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const stocks = await Stock.find({ owner: userId }).sort({ createdAt: -1 });
    const summary = calculatePortfolioSummary(stocks);

    return res.status(200).json({
      stocks,
      summary,
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Add a new stock
const addStock = async (req, res) => {
  const { userId, symbol, name, shares, avgCostPerShare } = req.body;

  if (!userId || !symbol || shares === undefined || avgCostPerShare === undefined) {
    return res.status(400).json({
      message: "userId, symbol, shares, and avgCostPerShare are required",
    });
  }

  if (shares <= 0 || avgCostPerShare < 0) {
    return res.status(400).json({
      message: "Shares must be positive and avgCostPerShare must be non-negative",
    });
  }

  try {
    // Check if user already has this stock
    const existing = await Stock.findOne({
      owner: userId,
      symbol: symbol.toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({
        message: `You already have ${symbol.toUpperCase()} in your portfolio. Update it instead.`,
      });
    }

    // Get stock details and current price from Alpha Vantage API
    let stockName = name;
    let currentPrice = 0;
    let previousClose = 0;
    let open = 0;
    let high = 0;
    let low = 0;
    let volume = 0;

    try {
      const quote = await alphaVantageClient.getQuote(symbol);
      currentPrice = quote.price;
      previousClose = quote.previousClose;
      open = quote.open;
      high = quote.high;
      low = quote.low;
      volume = quote.volume;

      // Try to get company name from search if not provided
      if (!stockName) {
        try {
          const searchResults = await alphaVantageClient.searchSymbols(symbol);
          const match = searchResults.find((r) => r.symbol === symbol.toUpperCase());
          stockName = match?.name || symbol.toUpperCase();
        } catch {
          stockName = symbol.toUpperCase();
        }
      }
    } catch (apiError) {
      console.warn(`Could not fetch stock data for ${symbol}:`, apiError.message);
      stockName = stockName || symbol.toUpperCase();
    }

    const stock = new Stock({
      owner: userId,
      symbol: symbol.toUpperCase(),
      name: stockName,
      shares,
      avgCostPerShare,
      currentPrice,
      previousClose,
      open,
      high,
      low,
      volume,
      lastUpdated: currentPrice > 0 ? new Date() : null,
    });

    await stock.save();
    console.log("Stock created:", stock._id);

    return res.status(201).json({
      message: "Stock added successfully",
      stock,
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: `${symbol.toUpperCase()} is already in your portfolio`,
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing stock
const updateStock = async (req, res) => {
  const { stockId } = req.params;
  const { userId, shares, avgCostPerShare } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const stock = await Stock.findOne({
      _id: stockId,
      owner: userId,
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    if (shares !== undefined) {
      if (shares <= 0) {
        return res.status(400).json({ message: "Shares must be positive" });
      }
      stock.shares = shares;
    }

    if (avgCostPerShare !== undefined) {
      if (avgCostPerShare < 0) {
        return res.status(400).json({
          message: "Average cost per share must be non-negative",
        });
      }
      stock.avgCostPerShare = avgCostPerShare;
    }

    await stock.save();

    return res.status(200).json({
      message: "Stock updated successfully",
      stock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a stock
const deleteStock = async (req, res) => {
  const { stockId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const stock = await Stock.findOneAndDelete({
      _id: stockId,
      owner: userId,
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    return res.status(200).json({
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Refresh prices for all user stocks
const refreshPrices = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const stocks = await Stock.find({ owner: userId });

    if (stocks.length === 0) {
      return res.status(200).json({
        message: "No stocks to refresh",
        stocks: [],
        summary: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
        },
      });
    }

    const updatedStocks = [];
    const errors = [];

    // Fetch prices for each stock
    for (const stock of stocks) {
      try {
        const quote = await alphaVantageClient.getQuote(stock.symbol);

        stock.currentPrice = quote.price;
        stock.previousClose = quote.previousClose;
        stock.open = quote.open;
        stock.high = quote.high;
        stock.low = quote.low;
        stock.volume = quote.volume;
        stock.lastUpdated = new Date();

        await stock.save();
        updatedStocks.push(stock);
      } catch (apiError) {
        console.error(`Failed to refresh ${stock.symbol}:`, apiError.message);
        errors.push({ symbol: stock.symbol, error: apiError.message });
        updatedStocks.push(stock);
      }
    }

    const summary = calculatePortfolioSummary(updatedStocks);

    return res.status(200).json({
      message: errors.length > 0 ? "Prices partially refreshed" : "Prices refreshed successfully",
      stocks: updatedStocks,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error refreshing prices:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Get stock quote
const getStockQuote = async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  try {
    const quote = await alphaVantageClient.getQuote(symbol);

    return res.status(200).json({ quote });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Search for stocks

const searchStocks = async (req, res) => {
  const { query, limit = 10 } = req.query;

  if (!query || query.length < 1) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const allResults = await alphaVantageClient.searchSymbols(query);

    const results = allResults.slice(0, parseInt(limit)).map((r) => ({
      symbol: r.symbol,
      name: r.name,
      exchange: r.region,
      type: r.type,
      currency: r.currency,
      matchScore: r.matchScore,
    }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get price history for a stock
const getPriceHistory = async (req, res) => {
  const { symbol } = req.params;
  const { range = "1M" } = req.query;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  try {
    const to = new Date();
    const from = new Date();

    switch (range.toUpperCase()) {
      case "1W":
        from.setDate(from.getDate() - 7);
        break;
      case "1M":
        from.setMonth(from.getMonth() - 1);
        break;
      case "3M":
        from.setMonth(from.getMonth() - 3);
        break;
      case "6M":
        from.setMonth(from.getMonth() - 6);
        break;
      case "1Y":
        from.setFullYear(from.getFullYear() - 1);
        break;
      case "2Y":
        from.setFullYear(from.getFullYear() - 2);
        break;
      default:
        from.setMonth(from.getMonth() - 1);
    }

    // Check cache first
    const cachedData = await PriceHistory.find({
      symbol: symbol.toUpperCase(),
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });

    const lastCached = cachedData.length > 0 ? cachedData[cachedData.length - 1] : null;
    const cacheIsStale =
      !lastCached || new Date() - new Date(lastCached.createdAt) > 24 * 60 * 60 * 1000;

    let history;

    if (cacheIsStale || cachedData.length === 0) {
      const needsFullData = ["6M", "1Y", "2Y"].includes(range.toUpperCase());
      const outputSize = needsFullData ? "full" : "compact";

      const apiData = await alphaVantageClient.getDailyTimeSeries(symbol, outputSize);

      const filteredData = apiData.filter((bar) => {
        const barDate = new Date(bar.date);
        return barDate >= from && barDate <= to;
      });

      // Cache the data
      for (const bar of filteredData) {
        await PriceHistory.findOneAndUpdate(
          {
            symbol: symbol.toUpperCase(),
            date: new Date(bar.date),
          },
          {
            symbol: symbol.toUpperCase(),
            date: new Date(bar.date),
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          },
          { upsert: true }
        );
      }

      history = filteredData;
    } else {
      history = cachedData.map((item) => ({
        date: item.date.toISOString(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    }

    return res.status(200).json({
      symbol: symbol.toUpperCase(),
      range,
      history,
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Get company overview
const getCompanyOverview = async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  try {
    const overview = await alphaVantageClient.getCompanyOverview(symbol);

    return res.status(200).json({ overview });
  } catch (error) {
    console.error("Error fetching company overview:", error);
    return res.status(500).json({ message: error.message });
  }
};

//Helper: Calculate portfolio summary from stocks
function calculatePortfolioSummary(stocks) {
  let totalValue = 0;
  let totalCost = 0;
  let dayChange = 0;

  for (const stock of stocks) {
    const value = stock.shares * stock.currentPrice;
    const cost = stock.shares * stock.avgCostPerShare;
    const prevValue = stock.shares * stock.previousClose;

    totalValue += value;
    totalCost += cost;
    dayChange += value - prevValue;
  }

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const prevTotalValue = stocks.reduce(
    (sum, stock) => sum + stock.shares * stock.previousClose,
    0
  );
  const dayChangePercent = prevTotalValue > 0 ? (dayChange / prevTotalValue) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dayChange,
    dayChangePercent,
  };
}

export default {
  getStocks,
  addStock,
  updateStock,
  deleteStock,
  refreshPrices,
  getStockQuote,
  searchStocks,
  getPriceHistory,
  getCompanyOverview,
};
