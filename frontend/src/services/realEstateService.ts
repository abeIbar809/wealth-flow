import api, { getErrorMessage } from "../api/api";
import useAuthStore from "../stores/useAuthStore";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface MonthlyExpenses {
  propertyTax?: number;
  insurance?: number;
  hoa?: number;
  maintenance?: number;
  utilities?: number;
  propertyManagement?: number;
  other?: number;
}

export interface Property {
  _id: string;
  owner: string;
  name: string;
  propertyType: "single_family" | "multi_family" | "condo" | "townhouse" | "apartment" | "commercial" | "land" | "other";
  address: Address;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice: number;
  purchaseDate?: string;
  currentValue: number;
  hasMortgage: boolean;
  mortgageBalance: number;
  mortgagePayment: number;
  interestRate: number;
  loanTerm?: number;
  isRental: boolean;
  monthlyRent: number;
  occupancyStatus: "occupied" | "vacant" | "owner_occupied" | "partially_occupied";
  leaseEndDate?: string;
  monthlyExpenses: MonthlyExpenses;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;

  // Virtuals
  totalMonthlyExpenses: number;
  netMonthlyCashFlow: number;
  annualCashFlow: number;
  equity: number;
  appreciation: number;
  appreciationPercent: number;
  capRate: number;
  cashOnCashReturn: number;
  ltvRatio: number;
}

export interface PropertyValueHistory {
  _id: string;
  property: string;
  value: number;
  date: string;
  source: "manual" | "zillow" | "redfin" | "appraisal" | "other";
  notes?: string;
}

export interface PortfolioSummary {
  totalProperties: number;
  totalValue: number;
  totalEquity: number;
  totalDebt: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  netMonthlyCashFlow: number;
  annualCashFlow: number;
  totalAppreciation: number;
  appreciationPercent: number;
}

export interface PortfolioAnalytics {
  overview: {
    totalProperties: number;
    totalRentalProperties: number;
    totalValue: number;
    totalEquity: number;
    totalDebt: number;
    portfolioLTV: number;
  };
  cashFlow: {
    monthlyRent: number;
    monthlyExpenses: number;
    monthlyMortgage: number;
    netMonthlyCashFlow: number;
    annualCashFlow: number;
  };
  metrics: {
    occupancyRate: number;
    avgPropertyValue: number;
    avgEquityPerProperty: number;
    avgRentPerProperty: number;
    portfolioCapRate: number;
  };
  typeBreakdown: Record<string, number>;
}

export interface AddPropertyData {
  name: string;
  propertyType: Property["propertyType"];
  address?: Address;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice: number;
  purchaseDate?: string;
  currentValue?: number;
  hasMortgage?: boolean;
  mortgageBalance?: number;
  mortgagePayment?: number;
  interestRate?: number;
  loanTerm?: number;
  isRental?: boolean;
  monthlyRent?: number;
  occupancyStatus?: Property["occupancyStatus"];
  leaseEndDate?: string;
  monthlyExpenses?: MonthlyExpenses;
  imageUrl?: string;
  notes?: string;
}

export interface UpdatePropertyData extends Partial<AddPropertyData> {}

class RealEstateService {
  /**
   * Get all properties for the current user
   */
  async getProperties(): Promise<{ properties: Property[]; summary: PortfolioSummary }> {
    const userId = this.getUserId();

    try {
      const response = await api.get(`/real-estate/${userId}`);
      return {
        properties: response.data.properties || [],
        summary: response.data.summary || this.emptyPortfolioSummary(),
      };
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Add a new property
   */
  async addProperty(data: AddPropertyData): Promise<Property> {
    const userId = this.getUserId();

    try {
      const response = await api.post("/real-estate", {
        userId,
        ...data,
      });
      return response.data.property;
    } catch (error) {
      console.error("Error adding property:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update an existing property
   */
  async updateProperty(propertyId: string, data: UpdatePropertyData): Promise<Property> {
    const userId = this.getUserId();

    try {
      const response = await api.put(`/real-estate/${propertyId}`, {
        userId,
        ...data,
      });
      return response.data.property;
    } catch (error) {
      console.error("Error updating property:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete a property
   */
  async deleteProperty(propertyId: string): Promise<void> {
    const userId = this.getUserId();

    try {
      await api.delete(`/real-estate/${propertyId}`, {
        data: { userId },
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get property value history
   */
  async getValueHistory(propertyId: string): Promise<PropertyValueHistory[]> {
    const userId = this.getUserId();

    try {
      const response = await api.get(`/real-estate/${propertyId}/history`, {
        params: { userId },
      });
      return response.data.history || [];
    } catch (error) {
      console.error("Error fetching value history:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Add value history entry
   */
  async addValueHistory(
    propertyId: string,
    value: number,
    source?: PropertyValueHistory["source"],
    notes?: string
  ): Promise<{ history: PropertyValueHistory; property: Property }> {
    const userId = this.getUserId();

    try {
      const response = await api.post(`/real-estate/${propertyId}/history`, {
        userId,
        value,
        source,
        notes,
      });
      return {
        history: response.data.history,
        property: response.data.property,
      };
    } catch (error) {
      console.error("Error adding value history:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(): Promise<PortfolioAnalytics> {
    const userId = this.getUserId();

    try {
      const response = await api.get(`/real-estate/${userId}/analytics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio analytics:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Calculate portfolio allocation by property type
   */
  calculateAllocationByType(properties: Property[]): Array<{
    type: string;
    label: string;
    value: number;
    percentage: number;
    color: string;
  }> {
    const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice), 0);

    if (totalValue === 0) return [];

    const typeLabels: Record<string, string> = {
      single_family: "Single Family",
      multi_family: "Multi Family",
      condo: "Condo",
      townhouse: "Townhouse",
      apartment: "Apartment",
      commercial: "Commercial",
      land: "Land",
      other: "Other",
    };

    const colors: Record<string, string> = {
      single_family: "#03BF62",
      multi_family: "#3B82F6",
      condo: "#F59E0B",
      townhouse: "#8B5CF6",
      apartment: "#EF4444",
      commercial: "#10B981",
      land: "#6366F1",
      other: "#9CA3AF",
    };

    const grouped = properties.reduce((acc, property) => {
      const type = property.propertyType;
      const value = property.currentValue || property.purchasePrice;
      acc[type] = (acc[type] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([type, value]) => ({
        type,
        label: typeLabels[type] || type,
        value,
        percentage: (value / totalValue) * 100,
        color: colors[type] || "#9CA3AF",
      }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Calculate portfolio allocation by property
   */
  calculateAllocationByProperty(properties: Property[]): Array<{
    id: string;
    name: string;
    value: number;
    percentage: number;
    color: string;
  }> {
    const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice), 0);

    if (totalValue === 0) return [];

    const colors = [
      "#03BF62",
      "#3B82F6",
      "#F59E0B",
      "#8B5CF6",
      "#EF4444",
      "#10B981",
      "#EC4899",
      "#6366F1",
      "#14B8A6",
      "#F97316",
    ];

    return properties
      .map((property, index) => {
        const value = property.currentValue || property.purchasePrice;
        return {
          id: property._id,
          name: property.name,
          value,
          percentage: (value / totalValue) * 100,
          color: colors[index % colors.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        notation: "compact",
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercent(percent: number): string {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  }

  /**
   * Get property type label
   */
  getPropertyTypeLabel(type: Property["propertyType"]): string {
    const labels: Record<string, string> = {
      single_family: "Single Family",
      multi_family: "Multi Family",
      condo: "Condo",
      townhouse: "Townhouse",
      apartment: "Apartment",
      commercial: "Commercial",
      land: "Land",
      other: "Other",
    };
    return labels[type] || type;
  }

  /**
   * Get occupancy status label
   */
  getOccupancyLabel(status: Property["occupancyStatus"]): string {
    const labels: Record<string, string> = {
      occupied: "Occupied",
      vacant: "Vacant",
      owner_occupied: "Owner Occupied",
      partially_occupied: "Partially Occupied",
    };
    return labels[status] || status;
  }

  /**
   * Format address for display
   */
  formatAddress(address: Address): string {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    return parts.join(", ") || "No address";
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

  /**
   * Helper: Empty portfolio summary
   */
  private emptyPortfolioSummary(): PortfolioSummary {
    return {
      totalProperties: 0,
      totalValue: 0,
      totalEquity: 0,
      totalDebt: 0,
      totalMonthlyIncome: 0,
      totalMonthlyExpenses: 0,
      netMonthlyCashFlow: 0,
      annualCashFlow: 0,
      totalAppreciation: 0,
      appreciationPercent: 0,
    };
  }
}

// Export singleton instance
export const realEstateService = new RealEstateService();
export default realEstateService;
