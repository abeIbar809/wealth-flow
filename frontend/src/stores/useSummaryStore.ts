import { create } from "zustand";

interface WeeklySummaryData {
  weekOf: string;
  thisWeek: {
    income: number;
    expenses: number;
    netCashFlow: number;
    byCategory: { [key: string]: number };
  };
  lastWeek: {
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  comparison: {
    incomeChange: string;
    expenseChange: string;
  };
}

interface SummaryState {
  summary: WeeklySummaryData | null;
  isLoading: boolean;
  error: string | null;
  fetchWeeklySummary: (userId: string) => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const useSummaryStore = create<SummaryState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  //clear error state
  clearError: () => set({ error: null }),

  //fetch weekly summary from backend
  fetchWeeklySummary: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/weeklysummary/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      set({ summary: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useSummaryStore;