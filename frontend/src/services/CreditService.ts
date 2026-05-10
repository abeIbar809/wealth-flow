import API, { getErrorMessage } from "../api/api";
import useAuthStore from "../stores/useAuthStore";



export interface CreditHealth {
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Poor";
  color: string;
}

export interface CreditUtilization {
  overall: number;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
}

export interface CreditCard {
  id: string;
  name: string;
  institution: string;
  balance: number;
  limit: number;
  utilization: number;
  available: number;
  lastUpdated: string | null;
}

export interface Loan {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: string;
}

export interface CreditSummary {
  totalDebt: number;
  numberOfCreditCards: number;
  numberOfLoans: number;
  estimatedMonthlyPayment: number;
}

export interface CreditTransaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: "payment" | "charge";
  accountName: string;
}

export interface CreditInsights {
  creditHealth: CreditHealth;
  utilization: CreditUtilization;
  creditCards: CreditCard[];
  loans: Loan[];
  summary: CreditSummary;
  recentTransactions: CreditTransaction[];
}

class CreditService {
  /**
   * Get credit insights for the user
   */
  async getCreditInsights(): Promise<CreditInsights> {
    const userId = this.getUserId();

    try {
      const response = await API.get(`/plaid/credit/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching credit insights:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get credit utilization rating
   */
  getUtilizationRating(utilization: number): {
    rating: string;
    color: string;
    description: string;
  } {
    if (utilization <= 10) {
      return {
        rating: "Excellent",
        color: "#03BF62",
        description: "Your credit utilization is excellent! Keep it up.",
      };
    } else if (utilization <= 30) {
      return {
        rating: "Good",
        color: "#3B82F6",
        description: "Your credit utilization is in a healthy range.",
      };
    } else if (utilization <= 50) {
      return {
        rating: "Fair",
        color: "#F59E0B",
        description: "Consider paying down your balances to improve your score.",
      };
    } else if (utilization <= 75) {
      return {
        rating: "High",
        color: "#F97316",
        description: "Your utilization is high. Try to pay down balances.",
      };
    } else {
      return {
        rating: "Very High",
        color: "#EF4444",
        description: "Your credit utilization is very high. This may impact your score.",
      };
    }
  }

  /**
   * Get tips based on credit insights
   */
  getCreditTips(insights: CreditInsights): string[] {
    const tips: string[] = [];

    if (insights.utilization.overall > 30) {
      tips.push("Try to keep your credit utilization below 30% for a better score.");
    }

    if (insights.creditCards.some(card => card.utilization > 50)) {
      tips.push("Some of your cards have high utilization. Consider spreading balances.");
    }

    if (insights.summary.numberOfCreditCards === 0) {
      tips.push("Having a credit card and using it responsibly can help build credit.");
    }

    if (insights.summary.totalDebt > 0) {
      tips.push("Making payments on time is the most important factor for your credit.");
    }

    if (insights.utilization.totalAvailable > 0 && insights.utilization.overall < 10) {
      tips.push("Great job keeping your utilization low! This positively impacts your score.");
    }

    if (tips.length === 0) {
      tips.push("Keep monitoring your credit health regularly.");
    }

    return tips;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Helper: Get user ID from auth store
   */
  private getUserId(): string {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) {
      throw new Error("User must be logged in");
    }
    return userId;
  }
}

// Export singleton instance
export const creditService = new CreditService();
export default creditService;
