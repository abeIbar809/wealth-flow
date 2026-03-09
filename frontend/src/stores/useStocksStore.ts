import { create } from "zustand";
import {
  stocksService,
  Stock,
  StockPortfolioSummary,
  StockSearchResult,
  PricePoint,
  AddStockData,
  UpdateStockData,
  CompanyOverview,
} from "@/src/services/stocksService";

export interface StocksState {
  // Data
  stocks: Stock[];
  portfolioSummary: StockPortfolioSummary | null;
  searchResults: StockSearchResult[];
  priceHistory: Record<string, PricePoint[]>;
  selectedStock: Stock | null;
  companyOverview: CompanyOverview | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  isLoadingHistory: boolean;
  isLoadingOverview: boolean;

  // Error state
  error: string | null;

  // Actions
  setStocks: (stocks: Stock[]) => void;
  setPortfolioSummary: (summary: StockPortfolioSummary) => void;
  setSearchResults: (results: StockSearchResult[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchStocks: () => Promise<void>;
  addStock: (data: AddStockData) => Promise<Stock>;
  updateStock: (stockId: string, data: UpdateStockData) => Promise<void>;
  deleteStock: (stockId: string) => Promise<void>;
  refreshPrices: () => Promise<void>;
  searchStocks: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  fetchPriceHistory: (symbol: string, range?: "1W" | "1M" | "3M" | "6M" | "1Y" | "2Y") => Promise<void>;
  fetchCompanyOverview: (symbol: string) => Promise<void>;

  // Reset
  resetStocks: () => void;
}

const initialState = {
  stocks: [],
  portfolioSummary: null,
  searchResults: [],
  priceHistory: {},
  selectedStock: null,
  companyOverview: null,
  isLoading: false,
  isRefreshing: false,
  isSearching: false,
  isLoadingHistory: false,
  isLoadingOverview: false,
  error: null,
};

export const useStocksStore = create<StocksState>()((set, get) => ({
  ...initialState,

  // Sync setters
  setStocks: (stocks) => set({ stocks }),

  setPortfolioSummary: (portfolioSummary) => set({ portfolioSummary }),

  setSearchResults: (searchResults) => set({ searchResults }),

  setSelectedStock: (selectedStock) => set({ selectedStock }),

  setError: (error) => set({ error }),

  // Async: Fetch stocks
  fetchStocks: async () => {
    set({ isLoading: true, error: null });

    try {
      const { stocks, summary } = await stocksService.getStocks();
      set({ stocks, portfolioSummary: summary, isLoading: false });
    } catch (error) {
      console.error("Error fetching stocks:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch stocks",
        isLoading: false,
      });
    }
  },

  // Async: Add stock
  addStock: async (data: AddStockData) => {
    const { stocks } = get();

    set({ isLoading: true, error: null });

    try {
      const newStock = await stocksService.addStock(data);
      const updatedStocks = [...stocks, newStock];
      const summary = calculateLocalSummary(updatedStocks);

      set({
        stocks: updatedStocks,
        portfolioSummary: summary,
        isLoading: false,
      });

      return newStock;
    } catch (error) {
      console.error("Error adding stock:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add stock",
        isLoading: false,
      });
      throw error;
    }
  },

  // Async: Update stock
  updateStock: async (stockId: string, data: UpdateStockData) => {
    const { stocks } = get();

    set({ error: null });

    try {
      const updatedStock = await stocksService.updateStock(stockId, data);
      const updatedStocks = stocks.map((stock) =>
        stock._id === stockId ? updatedStock : stock
      );
      const summary = calculateLocalSummary(updatedStocks);

      set({ stocks: updatedStocks, portfolioSummary: summary });
    } catch (error) {
      console.error("Error updating stock:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update stock" });
      throw error;
    }
  },

  // Async: Delete stock
  deleteStock: async (stockId: string) => {
    const { stocks } = get();

    set({ error: null });

    try {
      await stocksService.deleteStock(stockId);
      const updatedStocks = stocks.filter((stock) => stock._id !== stockId);
      const summary = calculateLocalSummary(updatedStocks);

      set({ stocks: updatedStocks, portfolioSummary: summary });
    } catch (error) {
      console.error("Error deleting stock:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete stock" });
      throw error;
    }
  },

  // Async: Refresh prices
  refreshPrices: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const { stocks, summary } = await stocksService.refreshPrices();
      set({ stocks, portfolioSummary: summary, isRefreshing: false });
    } catch (error) {
      console.error("Error refreshing prices:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to refresh prices",
        isRefreshing: false,
      });
    }
  },

  // Async: Search stocks
  searchStocks: async (query: string) => {
    if (query.length < 1) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });

    try {
      const results = await stocksService.searchStocks(query);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      console.error("Error searching stocks:", error);
      set({ searchResults: [], isSearching: false });
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // Async: Fetch price history
  fetchPriceHistory: async (symbol: string, range = "1M") => {
    const { priceHistory } = get();

    set({ isLoadingHistory: true, error: null });

    try {
      const history = await stocksService.getPriceHistory(symbol, range);
      set({
        priceHistory: {
          ...priceHistory,
          [`${symbol}_${range}`]: history,
        },
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error("Error fetching price history:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch price history",
        isLoadingHistory: false,
      });
    }
  },

  // Async: Fetch company overview
  fetchCompanyOverview: async (symbol: string) => {
    set({ isLoadingOverview: true, error: null });

    try {
      const overview = await stocksService.getCompanyOverview(symbol);
      set({ companyOverview: overview, isLoadingOverview: false });
    } catch (error) {
      console.error("Error fetching company overview:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch company overview",
        isLoadingOverview: false,
      });
    }
  },

  // Reset
  resetStocks: () => set(initialState),
}));

// Helper: Calculate portfolio summary locally
function calculateLocalSummary(stocks: Stock[]): StockPortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;
  let dayChange = 0;
  let prevTotalValue = 0;

  for (const stock of stocks) {
    const value = stock.shares * stock.currentPrice;
    const cost = stock.shares * stock.avgCostPerShare;
    const prevValue = stock.shares * stock.previousClose;

    totalValue += value;
    totalCost += cost;
    dayChange += value - prevValue;
    prevTotalValue += prevValue;
  }

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
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

// Selectors
export const selectTopGainers = (state: StocksState): Stock[] => {
  return [...state.stocks]
    .filter((stock) => stock.dayChangePercent > 0)
    .sort((a, b) => b.dayChangePercent - a.dayChangePercent)
    .slice(0, 3);
};

export const selectTopLosers = (state: StocksState): Stock[] => {
  return [...state.stocks]
    .filter((stock) => stock.dayChangePercent < 0)
    .sort((a, b) => a.dayChangePercent - b.dayChangePercent)
    .slice(0, 3);
};

export const selectPortfolioAllocation = (state: StocksState) => {
  return stocksService.calculateAllocation(state.stocks);
};

export const selectStockCount = (state: StocksState): number => {
  return state.stocks.length;
};

export const selectTotalPortfolioValue = (state: StocksState): number => {
  return state.portfolioSummary?.totalValue || 0;
};
