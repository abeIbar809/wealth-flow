import { create } from "zustand";
import {
  realEstateService,
  Property,
  PortfolioSummary,
  PortfolioAnalytics,
  PropertyValueHistory,
  AddPropertyData,
  UpdatePropertyData,
} from "@/src/services/realEstateService";

export interface RealEstateState {
  // Data
  properties: Property[];
  portfolioSummary: PortfolioSummary | null;
  portfolioAnalytics: PortfolioAnalytics | null;
  valueHistory: Record<string, PropertyValueHistory[]>;
  selectedProperty: Property | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingHistory: boolean;
  isLoadingAnalytics: boolean;

  // Error state
  error: string | null;

  // Actions
  setProperties: (properties: Property[]) => void;
  setPortfolioSummary: (summary: PortfolioSummary) => void;
  setSelectedProperty: (property: Property | null) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchProperties: () => Promise<void>;
  addProperty: (data: AddPropertyData) => Promise<Property>;
  updateProperty: (propertyId: string, data: UpdatePropertyData) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  fetchValueHistory: (propertyId: string) => Promise<void>;
  addValueHistory: (
    propertyId: string,
    value: number,
    source?: PropertyValueHistory["source"],
    notes?: string
  ) => Promise<void>;
  fetchPortfolioAnalytics: () => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Reset
  resetRealEstate: () => void;
}

const initialState = {
  properties: [],
  portfolioSummary: null,
  portfolioAnalytics: null,
  valueHistory: {},
  selectedProperty: null,
  isLoading: false,
  isRefreshing: false,
  isLoadingHistory: false,
  isLoadingAnalytics: false,
  error: null,
};

export const useRealEstateStore = create<RealEstateState>()((set, get) => ({
  ...initialState,

  // Sync setters
  setProperties: (properties) => set({ properties }),

  setPortfolioSummary: (portfolioSummary) => set({ portfolioSummary }),

  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),

  setError: (error) => set({ error }),

  // Async: Fetch properties
  fetchProperties: async () => {
    set({ isLoading: true, error: null });

    try {
      const { properties, summary } = await realEstateService.getProperties();
      set({ properties, portfolioSummary: summary, isLoading: false });
    } catch (error) {
      console.error("Error fetching properties:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch properties",
        isLoading: false,
      });
    }
  },

  // Async: Add property
  addProperty: async (data: AddPropertyData) => {
    const { properties } = get();

    set({ isLoading: true, error: null });

    try {
      const newProperty = await realEstateService.addProperty(data);
      const updatedProperties = [...properties, newProperty];
      const summary = calculateLocalSummary(updatedProperties);

      set({
        properties: updatedProperties,
        portfolioSummary: summary,
        isLoading: false,
      });

      return newProperty;
    } catch (error) {
      console.error("Error adding property:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add property",
        isLoading: false,
      });
      throw error;
    }
  },

  // Async: Update property
  updateProperty: async (propertyId: string, data: UpdatePropertyData) => {
    const { properties } = get();

    set({ error: null });

    try {
      const updatedProperty = await realEstateService.updateProperty(propertyId, data);
      const updatedProperties = properties.map((property) =>
        property._id === propertyId ? updatedProperty : property
      );
      const summary = calculateLocalSummary(updatedProperties);

      set({ properties: updatedProperties, portfolioSummary: summary });
    } catch (error) {
      console.error("Error updating property:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update property" });
      throw error;
    }
  },

  // Async: Delete property
  deleteProperty: async (propertyId: string) => {
    const { properties } = get();

    set({ error: null });

    try {
      await realEstateService.deleteProperty(propertyId);
      const updatedProperties = properties.filter((property) => property._id !== propertyId);
      const summary = calculateLocalSummary(updatedProperties);

      set({ properties: updatedProperties, portfolioSummary: summary });
    } catch (error) {
      console.error("Error deleting property:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete property" });
      throw error;
    }
  },

  // Async: Fetch value history
  fetchValueHistory: async (propertyId: string) => {
    const { valueHistory } = get();

    set({ isLoadingHistory: true, error: null });

    try {
      const history = await realEstateService.getValueHistory(propertyId);
      set({
        valueHistory: {
          ...valueHistory,
          [propertyId]: history,
        },
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error("Error fetching value history:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch value history",
        isLoadingHistory: false,
      });
    }
  },

  // Async: Add value history
  addValueHistory: async (propertyId, value, source, notes) => {
    const { properties, valueHistory } = get();

    set({ error: null });

    try {
      const result = await realEstateService.addValueHistory(propertyId, value, source, notes);

      // Update property with new current value
      const updatedProperties = properties.map((property) =>
        property._id === propertyId ? result.property : property
      );

      // Update history cache
      const existingHistory = valueHistory[propertyId] || [];
      const updatedHistory = [result.history, ...existingHistory];

      const summary = calculateLocalSummary(updatedProperties);

      set({
        properties: updatedProperties,
        portfolioSummary: summary,
        valueHistory: {
          ...valueHistory,
          [propertyId]: updatedHistory,
        },
      });
    } catch (error) {
      console.error("Error adding value history:", error);
      set({ error: error instanceof Error ? error.message : "Failed to add value history" });
      throw error;
    }
  },

  // Async: Fetch portfolio analytics
  fetchPortfolioAnalytics: async () => {
    set({ isLoadingAnalytics: true, error: null });

    try {
      const analytics = await realEstateService.getPortfolioAnalytics();
      set({ portfolioAnalytics: analytics, isLoadingAnalytics: false });
    } catch (error) {
      console.error("Error fetching portfolio analytics:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
        isLoadingAnalytics: false,
      });
    }
  },

  // Async: Refresh all data
  refreshAllData: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const [propertiesResult, analytics] = await Promise.all([
        realEstateService.getProperties(),
        realEstateService.getPortfolioAnalytics(),
      ]);

      set({
        properties: propertiesResult.properties,
        portfolioSummary: propertiesResult.summary,
        portfolioAnalytics: analytics,
        isRefreshing: false,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to refresh data",
        isRefreshing: false,
      });
    }
  },

  // Reset
  resetRealEstate: () => set(initialState),
}));

// Helper: Calculate portfolio summary locally
function calculateLocalSummary(properties: Property[]): PortfolioSummary {
  let totalValue = 0;
  let totalEquity = 0;
  let totalDebt = 0;
  let totalMonthlyIncome = 0;
  let totalMonthlyExpenses = 0;
  let totalAppreciation = 0;

  for (const property of properties) {
    const value = property.currentValue || property.purchasePrice;
    totalValue += value;
    totalEquity += value - (property.mortgageBalance || 0);
    totalDebt += property.mortgageBalance || 0;
    totalAppreciation += value - property.purchasePrice;

    if (property.isRental) {
      totalMonthlyIncome += property.monthlyRent || 0;
    }
    totalMonthlyExpenses += property.totalMonthlyExpenses || 0;
  }

  const netMonthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const appreciationPercent =
    totalValue > totalAppreciation && properties.length > 0
      ? (totalAppreciation / (totalValue - totalAppreciation)) * 100
      : 0;

  return {
    totalProperties: properties.length,
    totalValue,
    totalEquity,
    totalDebt,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    netMonthlyCashFlow,
    annualCashFlow: netMonthlyCashFlow * 12,
    totalAppreciation,
    appreciationPercent: Math.round(appreciationPercent * 100) / 100,
  };
}

// Selectors
export const selectRentalProperties = (state: RealEstateState): Property[] => {
  return state.properties.filter((p) => p.isRental);
};

export const selectNonRentalProperties = (state: RealEstateState): Property[] => {
  return state.properties.filter((p) => !p.isRental);
};

export const selectPropertyCount = (state: RealEstateState): number => {
  return state.properties.length;
};

export const selectTotalPortfolioValue = (state: RealEstateState): number => {
  return state.portfolioSummary?.totalValue || 0;
};

export const selectTotalEquity = (state: RealEstateState): number => {
  return state.portfolioSummary?.totalEquity || 0;
};

export const selectMonthlyCashFlow = (state: RealEstateState): number => {
  return state.portfolioSummary?.netMonthlyCashFlow || 0;
};

export const selectPortfolioAllocationByType = (state: RealEstateState) => {
  return realEstateService.calculateAllocationByType(state.properties);
};

export const selectPortfolioAllocationByProperty = (state: RealEstateState) => {
  return realEstateService.calculateAllocationByProperty(state.properties);
};

export const selectTopPerformingProperties = (state: RealEstateState): Property[] => {
  return [...state.properties]
    .filter((p) => p.appreciationPercent > 0)
    .sort((a, b) => b.appreciationPercent - a.appreciationPercent)
    .slice(0, 3);
};

export const selectPropertiesByType = (
  state: RealEstateState,
  type: Property["propertyType"]
): Property[] => {
  return state.properties.filter((p) => p.propertyType === type);
};
