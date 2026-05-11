import { create } from "zustand";

//shape of the tax calculation result returned from the backend
interface TaxResult {
  yearlyIncome: number;
  deductions: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
}

interface TaxState {
  taxResult: TaxResult | null;
  isLoading: boolean;
  error: string | null;
  calculateTax: (
    userId: string,
    filingStatus: string,
    yearlyIncome: number
  ) => Promise<void>;
  clearError: () => void;
  clearResult: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const useTaxStore = create<TaxState>((set) => ({
  taxResult: null,
  isLoading: false,
  error: null,

  //clear error state
  clearError: () => set({ error: null }),

  //clear previous result when starting a new calculation
  clearResult: () => set({ taxResult: null }),

  //sends user-entered income and filing status to the backend
  //backend applies the standard deduction and 2024 federal brackets
  calculateTax: async (userId, filingStatus, yearlyIncome) => {
    set({ isLoading: true, error: null, taxResult: null });
    try {
      const response = await fetch(`${API_BASE_URL}/taxestimation/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, filingStatus, yearlyIncome }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to calculate tax estimate");
      }
      const data = await response.json();
      set({ taxResult: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useTaxStore;
