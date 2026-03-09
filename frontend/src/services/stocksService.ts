import API, { getErrorMessage } from "../api/api";
import useAuthStore from "../stores/useAuthStore";


export interface Stock {
  _id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCostPerShare: number;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string | null;
  createdAt: string;

  // Virtuals
  dayChange: number;
  dayChangePercent: number;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface StockPortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  updated: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  currency: string;
  matchScore: number;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  eps: number;
  beta: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface AddStockData {
  symbol: string;
  name?: string;
  shares: number;
  avgCostPerShare: number;
}

export interface UpdateStockData {
  shares?: number;
  avgCostPerShare?: number;
}

class StocksService {
  // Get all stocks for the current user
  async getStocks(): Promise<{ stocks: Stock[]; summary: StockPortfolioSummary }> {
    const userId = this.getUserId();

    try {
      const response = await API.get(`/stocks/${userId}`);
      return {
        stocks: response.data.stocks || [],
        summary: response.data.summary || this.emptyPortfolioSummary(),
      };
    } catch (error) {
      console.error("Error fetching stocks:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Add a new stock
  async addStock(data: AddStockData): Promise<Stock> {
    const userId = this.getUserId();

    try {
      const response = await API.post("/stocks", {
        userId,
        ...data,
      });
      return response.data.stock;
    } catch (error) {
      console.error("Error adding stock:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  //Update an existing stock
  async updateStock(stockId: string, data: UpdateStockData): Promise<Stock> {
    const userId = this.getUserId();

    try {
      const response = await API.put(`/stocks/${stockId}`, {
        userId,
        ...data,
      });
      return response.data.stock;
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Delete a stock
  async deleteStock(stockId: string): Promise<void> {
    const userId = this.getUserId();

    try {
      await API.delete(`/stocks/${stockId}`, {
        data: { userId },
      });
    } catch (error) {
      console.error("Error deleting stock:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Refresh prices for all stocks
  async refreshPrices(): Promise<{ stocks: Stock[]; summary: StockPortfolioSummary }> {
    const userId = this.getUserId();

    try {
      const response = await API.post(`/stocks/${userId}/refresh`);
      return {
        stocks: response.data.stocks || [],
        summary: response.data.summary || this.emptyPortfolioSummary(),
      };
    } catch (error) {
      console.error("Error refreshing prices:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Search for stocks
  async searchStocks(query: string, limit = 10): Promise<StockSearchResult[]> {
    try {
      const response = await API.get("/stocks/search/stocks", {
        params: { query, limit },
      });
      return response.data.results || [];
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Get stock quote
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await API.get(`/stocks/quote/${symbol}`);
      return response.data.quote;
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Get price history for a stock
  async getPriceHistory(
    symbol: string,
    range: "1W" | "1M" | "3M" | "6M" | "1Y" | "2Y" = "1M"
  ): Promise<PricePoint[]> {
    try {
      const response = await API.get(`/stocks/history/${symbol}`, {
        params: { range },
      });
      return response.data.history || [];
    } catch (error) {
      console.error("Error fetching price history:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Get company overview
  async getCompanyOverview(symbol: string): Promise<CompanyOverview> {
    try {
      const response = await API.get(`/stocks/overview/${symbol}`);
      return response.data.overview;
    } catch (error) {
      console.error("Error fetching company overview:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  // Calculate portfolio allocation percentages
  calculateAllocation(stocks: Stock[]): Array<{
    symbol: string;
    name: string;
    value: number;
    percentage: number;
    color: string;
  }> {
    const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0);

    if (totalValue === 0) return [];

    const colors = [
      "#03BF62", // Primary green
      "#3B82F6", // Blue
      "#F59E0B", // Amber
      "#8B5CF6", // Purple
      "#EF4444", // Red
      "#10B981", // Emerald
      "#EC4899", // Pink
      "#6366F1", // Indigo
      "#14B8A6", // Teal
      "#F97316", // Orange
    ];

    return stocks
      .map((stock, index) => ({
        symbol: stock.symbol,
        name: stock.name,
        value: stock.totalValue,
        percentage: (stock.totalValue / totalValue) * 100,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        notation: "compact",
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format percentage for display
  formatPercent(percent: number): string {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  }

  // Helper: Get user ID from auth store
  private getUserId(): string {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) {
      throw new Error("User must be logged in");
    }
    return userId;
  }

  //Helper: Empty portfolio summary
  private emptyPortfolioSummary(): StockPortfolioSummary {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
    };
  }
}

// Export singleton instance
export const stocksService = new StocksService();
export default stocksService;
