

const BASE_URL = "https://www.alphavantage.co/query";

/**
 * Alpha Vantage API Client for Live Stock Market Data
 * Docs: https://www.alphavantage.co/documentation/
 */

class AlphaVantageClient {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!this.apiKey) {
      console.warn("ALPHA_VANTAGE_API_KEY not set in environment variables");
    }
  }

  //Make request to Alpha Vantage API
  async request(params) {
    const url = new URL(BASE_URL);
    url.searchParams.append("apikey", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API error messages
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    if (data["Note"]) {
      // Rate limit warning
      console.warn("Alpha Vantage rate limit:", data["Note"]);
    }

    if (data["Information"]) {
      throw new Error(data["Information"]);
    }

    return data;
  }

  //Get stock quote with current price, previous close, change
  async getQuote(symbol) {
    const data = await this.request({
      function: "GLOBAL_QUOTE",
      symbol: symbol.toUpperCase(),
    });

    const quote = data["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No quote data found for ${symbol}`);
    }

    return {
      symbol: quote["01. symbol"],
      name: symbol.toUpperCase(), // Alpha Vantage doesn't return company name in quote
      price: parseFloat(quote["05. price"]) || 0,
      previousClose: parseFloat(quote["08. previous close"]) || 0,
      open: parseFloat(quote["02. open"]) || 0,
      high: parseFloat(quote["03. high"]) || 0,
      low: parseFloat(quote["04. low"]) || 0,
      volume: parseInt(quote["06. volume"]) || 0,
      change: parseFloat(quote["09. change"]) || 0,
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")) || 0,
      latestTradingDay: quote["07. latest trading day"],
    };
  }

  // Get historical daily OHLCV data for a stock
  async getDailyTimeSeries(symbol, outputSize = "compact") {
    const data = await this.request({
      function: "TIME_SERIES_DAILY",
      symbol: symbol.toUpperCase(),
      outputsize: outputSize,
    });

    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries) {
      throw new Error(`No time series data found for ${symbol}`);
    }

    // Convert to array and sort by date ascending
    const history = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date: new Date(date).toISOString(),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return history;
  }

  // Search for stocks by name or symbol
  async searchSymbols(keywords) {
    const data = await this.request({
      function: "SYMBOL_SEARCH",
      keywords: keywords,
    });

    const matches = data["bestMatches"];
    if (!matches) {
      return [];
    }

    return matches.map((match) => ({
      symbol: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
      marketOpen: match["5. marketOpen"],
      marketClose: match["6. marketClose"],
      timezone: match["7. timezone"],
      currency: match["8. currency"],
      matchScore: parseFloat(match["9. matchScore"]),
    }));
  }

  // Get company overview/details
  async getCompanyOverview(symbol) {
    const data = await this.request({
      function: "OVERVIEW",
      symbol: symbol.toUpperCase(),
    });

    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No company overview found for ${symbol}`);
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      currency: data.Currency,
      country: data.Country,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseInt(data.MarketCapitalization) || 0,
      peRatio: parseFloat(data.PERatio) || 0,
      dividendYield: parseFloat(data.DividendYield) || 0,
      eps: parseFloat(data.EPS) || 0,
      high52Week: parseFloat(data["52WeekHigh"]) || 0,
      low52Week: parseFloat(data["52WeekLow"]) || 0,
    };
  }
}

// Export singleton instance
export const alphaVantageClient = new AlphaVantageClient();
export default alphaVantageClient;
