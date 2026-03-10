// Represents an asset category used for charts and asset summaries
export type Asset = {
  name: string;       // Display name of the asset category (Checking, Savings, etc.)
  population: number; // Total value of assets in this category
  color: string;      // Color used for charts and UI elements
  type: string;       // Internal asset type identifier
};