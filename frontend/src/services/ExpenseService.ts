import { API } from "../api/api";
import useAuthStore from "../stores/useAuthStore";

export type CategoryTotal = { name: string; amount: number };

class ExpenseService {
  async getCategoryTotals(): Promise<CategoryTotal[]> {
    const userId = this.getUserId();
    const res = await API.get(`/expenses/categories/${userId}`);
    return res.data.categories || [];
  }

  private getUserId(): string {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) throw new Error("User must be logged in");
    return userId;
  }
}

export default new ExpenseService();