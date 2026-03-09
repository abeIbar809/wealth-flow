import { Account } from "../types/Account";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Request Plaid-linked accounts for the current user and return a typed list.
export const fetchAccounts = async (userId: string): Promise<Account[]> => {
  try {
    // Backend fetches data from Plaid for the app
    const res = await fetch(`${BACKEND_URL}/api/plaid/accounts/${userId}`);
    const data = await res.json();
    return data.accounts;
  } catch (err) {
    console.log("Error fetching accounts:", err);
    // Fall back to an empty array so the UI can render a safe empty state.
    return [];
  }
};