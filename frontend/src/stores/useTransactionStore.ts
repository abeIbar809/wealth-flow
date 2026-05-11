import { create } from "zustand";

interface TransactionAccount {
  _id: string;
  name: string;
  type: string;
  institution_name?: string;
}

interface Transaction {
  _id: string;
  merchant_name?: string;
  name: string;
  amount: number;
  date: string;
  personal_finance_category?: { primary: string; detailed: string };
  transaction_type: string;
  account?: TransactionAccount;
}

interface Account {
  _id: string;
  name: string;
  type: string;
  institution_name?: string;
}

interface TransactionFilters {
  accountId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  merchantName?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface TransactionState {
  transactions: Transaction[];
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  searchTransactions: (userId: string, filters: TransactionFilters) => Promise<void>;
  fetchUserAccounts: (userId: string) => Promise<void>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  accounts: [],
  isLoading: false,
  error: null,

  //builds query string from only the filters that were set and fetches matching transactions
  searchTransactions: async (userId: string, filters: TransactionFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({ userId });
      if (filters.accountId) params.append("accountId", filters.accountId);
      if (filters.category) params.append("category", filters.category);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.merchantName) params.append("merchantName", filters.merchantName);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);

      const response = await fetch(`${API_BASE_URL}/transactions/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      set({ transactions: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUserAccounts: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plaid/accounts/${userId}`);
      if (!response.ok) return;
      const data = await response.json();
      //endpoint returns { accounts: [...] } so unwrap if needed
      set({ accounts: Array.isArray(data) ? data : data.accounts ?? [] });
    } catch {
      //silently fail - dropdown will show only "All Accounts"
    }
  },
}));

export default useTransactionStore;
