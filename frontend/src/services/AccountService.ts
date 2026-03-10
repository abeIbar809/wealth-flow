import { API } from "../api/api";
import useAuthStore from "../stores/useAuthStore";

// Types
export interface Account {
  _id: string;
  plaid_account_id?: string;
  name: string;
  official_name?: string;
  type: "checking" | "savings" | "credit" | "investment" | "loan" | "depository" | "brokerage" | "other";
  subtype?: string;
  mask?: string;
  balance_available?: number;
  balance_current: number;
  balance_limit?: number;
  balance?: number; // Virtual field
  currency: string;
  institution_name?: string;
  institution_id?: string;
  isLinked: boolean;
  is_manual?: boolean;
  lastUpdated: string;
  bank?: {
    _id: string;
    institution_name: string;
    status: string;
  };
}

// frontend/src/services/AccountService.ts

export interface ManualBankPayload {
  institution_id: string;
  institution_name: string;
  plaid_access_token: string;
  plaid_item_id: string;
  cursor?: string | null;
  lastSynced?: string | null; // ISO string
  status?: "active" | "error" | "pending_reauth";
  accounts: Array<{
    name: string;
    official_name?: string;
    type: Account["type"];
    subtype?: string;
    mask?: string;
    balance_current: number;
    balance_available?: number;
    balance_limit?: number;
    currency?: string;
  }>;
}

class AccountsService {
  // fetch accounts from api
  async getAccounts(): Promise<Account[]> {
    const userId = this.getUserId();

    try {
      const response = await API.get(`/plaid/accounts/${userId}`);
      return response.data.accounts || [];
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  }

  // sync accounts from api
  async syncAccounts(): Promise<Account[]> {
    const userId = this.getUserId();

    try {
      const response = await API.post(`/plaid/accounts/${userId}/sync`);
      return response.data.accounts || [];
    } catch (error) {
      console.error("Error syncing accounts:", error);
      throw error;
    }
  }

  async removeBank(bankId: string): Promise<void> {
    const userId = this.getUserId();

    try {
      await API.delete(`/plaid/banks/${bankId}`, {
        data: { userId },
      });
    } catch (error) {
      console.error("Error removing bank:", error);
      throw new Error("Error removing bank");
    }
  }

  // calculate networth from bank accounts
  calculateNetWorth(accounts: Account[]): {
    assets: number;
    liabilities: number;
    networth: number;
  } {
    let assets = 0;
    let liabilities = 0;

    for (const account of accounts) {
      if (account.type === "loan" || account.type === "credit") {
        liabilities += account.balance_current;
      } else {
        assets += account.balance_current;
      }
    }

    return {
      assets: assets,
      liabilities: liabilities,
      networth: assets - liabilities,
    };
  }

  async createManualBank(payload: ManualBankPayload): Promise<Account[]> {
    const userId = this.getUserId();
    const response = await API.post(`/plaid/banks/${userId}/manual`, payload);
    return response.data.accounts || [];
  }

  // get user id from auth store
  private getUserId(): string {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) {
      throw new Error("User must be logged in");
    }
    return userId;
  }
}

export const accountsService = new AccountsService();

export default accountsService;