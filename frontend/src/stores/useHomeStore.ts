import { create } from "zustand";
import accountsService from "../services/AccountService";
import { Account as ServiceAccount } from "@/src/services/AccountService";

export interface Account {
  _id: string;
  plaid_account_id?: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "loan" | "depository" | "brokerage" | "other";
  balance: number;
  balance_current?: number;
  balance_available?: number;
  balance_limit?: number;
  currency: string;
  institutionName?: string;
  institutionLogo?: string;
  mask?: string;
  isLinked: boolean;
  is_manual?: boolean;
  lastUpdated?: string;
  bank?: {
    _id: string;
    institution_name: string;
    status: string;
  };
}

export interface HomeState {
  // Data
  accounts: Account[];

  // Loading states
  isLoadingAccounts: boolean;
  isRefreshing: boolean;

  // Error states
  error: string | null;

  // Sync actions
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  addAccounts: (accounts: Account[]) => void;

  setLoading: (key: "accounts", loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions (API calls)
  fetchAccounts: () => Promise<void>;
  syncAccounts: () => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Reset
  resetHome: () => void;
}

const transformAccount = (serviceAccount: ServiceAccount): Account => ({
  _id: serviceAccount._id,
  plaid_account_id: serviceAccount.plaid_account_id,
  name: serviceAccount.name,
  type: serviceAccount.type as Account["type"],
  balance: serviceAccount.balance ?? serviceAccount.balance_current,
  balance_current: serviceAccount.balance_current,
  balance_available: serviceAccount.balance_available,
  balance_limit: serviceAccount.balance_limit,
  currency: serviceAccount.currency,
  institutionName: serviceAccount.institution_name,
  mask: serviceAccount.mask,
  isLinked: serviceAccount.isLinked,
  is_manual: serviceAccount.is_manual,
  lastUpdated: serviceAccount.lastUpdated,
  bank: serviceAccount.bank,
});

const initialState = {
  accounts: [],
  isLoadingAccounts: false,
  isRefreshing: false,
  error: null,
};

export const useHomeStore = create<HomeState>()((set, get) => ({
  ...initialState,

  // Sync setters
  setAccounts: (accounts) => set({ accounts }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),

  addAccounts: (accounts) =>
    set((state) => ({
      accounts: [...state.accounts, ...accounts],
    })),

  setLoading: (key, loading) => {
    switch (key) {
      case "accounts":
        set({ isLoadingAccounts: loading });
        break;
    }
  },

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  setError: (error) => set({ error }),

  // Fetch accounts from API
  fetchAccounts: async () => {
    const { setLoading, setError, setAccounts } = get();

    setLoading("accounts", true);
    setError(null);

    try {
      const serviceAccounts = await accountsService.getAccounts();
      const accounts = serviceAccounts.map(transformAccount);

      setAccounts(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch accounts");
    } finally {
      setLoading("accounts", false);
    }
  },

  // Sync accounts refresh balances from api
  syncAccounts: async () => {
    const { setLoading, setError, setAccounts } = get();

    setLoading("accounts", true);
    setError(null);

    try {
      const serviceAccounts = await accountsService.syncAccounts();
      const accounts = serviceAccounts.map(transformAccount);

      setAccounts(accounts);
    } catch (error) {
      console.error("Error syncing accounts:", error);
      setError(error instanceof Error ? error.message : "Failed to sync accounts");
    } finally {
      setLoading("accounts", false);
    }
  },

  // Refresh all data
  refreshAllData: async () => {
    const { setRefreshing, syncAccounts } = get();

    setRefreshing(true);

    try {
      // Sync accounts and others sync functions in parallel
      await Promise.all([syncAccounts()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  },

  resetHome: () => set(initialState),
}));

// Selectors

export const selectAccountsByType = (state: HomeState, type: Account["type"]): Account[] => {
  return state.accounts.filter((a) => a.type === type);
};

export const selectLinkedAccounts = (state: HomeState): Account[] => {
  return state.accounts.filter((a) => a.isLinked);
};
