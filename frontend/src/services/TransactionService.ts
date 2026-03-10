import { API } from "../api/api";
import useAuthStore from "../stores/useAuthStore";

export type ManualTransactionPayload = {
  accountId: string;
  name: string;
  amount: number;
  date: string; // ISO string (or "YYYY-MM-DD" if your backend accepts it)
  transaction_type?: "income" | "expense" | "transfer" | "other";
  merchant_name?: string | null;
  category?: string[];
  payment_channel?: "online" | "in_store" | "other";
  currency?: string;
};

class TransactionService {
  async syncTransactions(): Promise<void> {
    const userId = this.getUserId();
    await API.post(`/plaid/transactions/${userId}/sync`);
  }

  async createManualTransaction(payload: ManualTransactionPayload) {
    const userId = this.getUserId();
    const res = await API.post(`/plaid/transactions/${userId}/manual`, payload);
    return res.data.transaction; // backend should return { transaction }
  }

  private getUserId(): string {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) throw new Error("User must be logged in");
    return userId;
  }
}

export const transactionService = new TransactionService();
export default transactionService;