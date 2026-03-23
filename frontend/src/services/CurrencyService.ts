const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "CHF"
  | "CNY"
  | "INR"
  | "MXN";

export interface ConversionResult {
  amount: number;
  from: string;
  to: string;
  convertedAmount: number;
  rate: number;
  date: string;
}

class CurrencyService {
  async convert(amount: number, from: string, to: string): Promise<ConversionResult> {
    if (!amount || Number.isNaN(amount)) {
      throw new Error("Invalid amount");
    }

    const normalizedFrom = from.trim().toUpperCase();
    const normalizedTo = to.trim().toUpperCase();

    if (normalizedFrom === normalizedTo) {
      return {
        amount,
        from: normalizedFrom,
        to: normalizedTo,
        convertedAmount: amount,
        rate: 1,
        date: new Date().toISOString().slice(0, 10),
      };
    }

    const url =
      `${FRANKFURTER_BASE_URL}/latest?amount=${encodeURIComponent(amount)}` +
      `&from=${encodeURIComponent(normalizedFrom)}` +
      `&to=${encodeURIComponent(normalizedTo)}`;

    console.log("Currency request URL:", url);

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.error("Currency fetch network error:", error);
      throw new Error("Network request failed while fetching exchange rate");
    }

    const rawText = await response.text();
    console.log("Currency response status:", response.status);
    console.log("Currency response body:", rawText);

    if (!response.ok) {
      throw new Error(`Exchange API error ${response.status}: ${rawText}`);
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error("Currency JSON parse error:", error);
      throw new Error("Exchange API returned invalid JSON");
    }

    const convertedAmount = data?.rates?.[normalizedTo];

    if (typeof convertedAmount !== "number") {
      throw new Error(`Invalid conversion response: ${rawText}`);
    }

    return {
      amount,
      from: normalizedFrom,
      to: normalizedTo,
      convertedAmount,
      rate: convertedAmount / amount,
      date: data.date,
    };
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status}`);
    }

    const data = await response.json();
    return Object.keys(data);
  }
}

export const currencyService = new CurrencyService();
export default currencyService;