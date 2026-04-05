import { create } from "zustand";

interface Goal {
  category: string;
  limit: number;
  spent: number;
}

interface WeeklyGoal {
  _id?: string;
  userId: string;
  weekStartDate: string;
  goals: Goal[];
  totalLimit: number;
  totalSpent: number;
}

interface GoalsState {
  weeklyGoal: WeeklyGoal | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentGoals: (userId: string) => Promise<void>;
  createWeeklyGoal: (userId: string, goals: Goal[]) => Promise<boolean>;
  updateWeeklyGoal: (id: string, goals: Goal[]) => Promise<boolean>;
  syncFromPlaid: (userId: string) => Promise<boolean>;
  clearError: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const useGoalsStore = create<GoalsState>((set, get) => ({
  weeklyGoal: null,
  isLoading: false,
  error: null,

  //fetches this week's spending from plaid transactions and overwrites spent amounts on current goals
  syncFromPlaid: async (userId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/weeklygoals/sync-spending/${userId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to sync spending");
      }
      const { spending } = await response.json();

      const { weeklyGoal, updateWeeklyGoal } = get();
      if (!weeklyGoal?._id) {
        set({ error: "No active weekly goals to sync", isLoading: false });
        return false;
      }

      //overwrite each goal's spent amount with the plaid-derived total
      const updatedGoals = weeklyGoal.goals.map((g) => ({
        ...g,
        spent: spending[g.category] ?? g.spent,
      }));

      return await updateWeeklyGoal(weeklyGoal._id, updatedGoals);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  fetchCurrentGoals: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/weeklygoals/current/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      set({ weeklyGoal: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createWeeklyGoal: async (userId: string, goals: Goal[]): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const totalLimit = goals.reduce((sum, g) => sum + g.limit, 0);
      const response = await fetch(`${API_BASE_URL}/weeklygoals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          weekStartDate: new Date(),
          goals,
          totalLimit,
          totalSpent: 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create goals");
      const data = await response.json();
      set({ weeklyGoal: data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateWeeklyGoal: async (id: string, goals: Goal[]): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const totalSpent = goals.reduce((sum, g) => sum + g.spent, 0);
      const response = await fetch(`${API_BASE_URL}/weeklygoals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, totalSpent }),
      });
      if (!response.ok) throw new Error("Failed to update goals");
      const data = await response.json();
      set({ weeklyGoal: data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));

export default useGoalsStore;