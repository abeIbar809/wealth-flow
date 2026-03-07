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

export interface NetWorthData {
  assets: number;
  liabilities: number;
  networth: number;
  currency: string;
  changeAmount: number;
  changePercentage: number;
  changeDirection: "up" | "down" | "neutral";
}

export interface HomeState {
  // Data
  accounts: Account[];
  netWorthData: NetWorthData | null;
  // Loading states
  isLoadingAccounts: boolean;
  isRefreshing: boolean;
  isNetworthLoading: boolean;

  // Error states
  error: string | null;

  // Sync actions
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  addAccounts: (accounts: Account[]) => void;
  setNetWorthData: (data: NetWorthData) => void;

  setLoading: (key: "accounts" | "netWorth", loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions (API calls)
  fetchAccounts: () => Promise<void>;
  syncAccounts: () => Promise<void>;
  refreshAllData: () => Promise<void>;

  // bank management
  removeBank: (bankId: string) => Promise<void>;

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
  netWorthData: null,
  isLoadingAccounts: false,
  isNetworthLoading: false,
  isRefreshing: false,
  error: null,
};

const calculateNetWorthData = (accounts: Account[], previousNetWorth?: number): NetWorthData => {
  const { networth, liabilities, assets } = accountsService.calculateNetWorth(accounts as ServiceAccount[]);

  // Calculate change (mock for now - would need historical data)
  const changeAmount = previousNetWorth ? networth - previousNetWorth : 0;
  const changePercentage = previousNetWorth && previousNetWorth !== 0 ? (changeAmount / previousNetWorth) * 100 : 0;

  return {
    assets,
    liabilities,
    networth,
    currency: "USD",
    changeAmount: Math.abs(changeAmount),
    changePercentage: Math.abs(changePercentage),
    changeDirection: changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "neutral",
  };
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
      case "netWorth":
        set({ isNetworthLoading: loading });
        break;
    }
  },

  setNetWorthData: (netWorthData) => set({ netWorthData }),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  setError: (error) => set({ error }),

  // Fetch accounts from API
  fetchAccounts: async () => {
    const { setLoading, setError, setAccounts, setNetWorthData } = get();

    setLoading("accounts", true);
    setLoading("netWorth", true);
    setError(null);

    try {
      // Fetch accounts from service
      const serviceAccounts = await accountsService.getAccounts();
      const accounts = serviceAccounts.map(transformAccount);

      setAccounts(accounts);
      // update the networth data
      const newNetWorthData = calculateNetWorthData(accounts);
      setNetWorthData(newNetWorthData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch accounts");
    } finally {
      setLoading("accounts", false);
      setLoading("netWorth", false);
    }
  },

  // Sync accounts refresh balances from api
  syncAccounts: async () => {
    const { setLoading, setError, setAccounts, setNetWorthData } = get();

    setLoading("accounts", true);
    setLoading("netWorth", true);
    setError(null);

    try {
      const serviceAccounts = await accountsService.syncAccounts();
      const accounts = serviceAccounts.map(transformAccount);

      setAccounts(accounts);

      // update the networth data
      const newNetWorthData = calculateNetWorthData(accounts);
      setNetWorthData(newNetWorthData);
    } catch (error) {
      console.error("Error syncing accounts:", error);
      setError(error instanceof Error ? error.message : "Failed to sync accounts");
    } finally {
      setLoading("accounts", false);
      setLoading("netWorth", false);
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

  removeBank: async (bankId: string) => {
    const { setError, syncAccounts } = get();
    try {
      // remove bank
      await accountsService.removeBank(bankId);
      // sync accounts for updating
      await syncAccounts();
    } catch (error) {
      console.error("Error removing bank:", error);
      setError(error instanceof Error ? error.message : "Failed to remove bank");
    }
  },
}));

// Selectors

export const selectAccountsByType = (state: HomeState, type: Account["type"]): Account[] => {
  return state.accounts.filter((a) => a.type === type);
};

export const selectLinkedAccounts = (state: HomeState): Account[] => {
  return state.accounts.filter((a) => a.isLinked);
};