// Represents a financial account returned from the backend (via Plaid)
export type Account = {
  type: string;            // Type of account (checking, savings, investment, etc.)
  balance_current: number; // Current balance of the account
  name: string;            // Name of the account (ex: "Chase Checking")
};