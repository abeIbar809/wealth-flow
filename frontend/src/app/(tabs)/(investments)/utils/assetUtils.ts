import { Account } from "../types/Account";

// Turn the raw account list into grouped data the chart can render.
export const calculateAssets = (accounts: Account[]) => {

  // Start each asset type at 0 so we can add balances into the right bucket.
  const totals: Record<string, number> = {
    checking: 0,
    savings: 0,
    depository: 0,
    investment: 0,
    brokerage: 0,
  };

  accounts.forEach((acc) => {
    const balance = acc.balance_current || 0;

    // Only add balances for the asset types this screen knows how to display.
    if (totals.hasOwnProperty(acc.type)) {
      totals[acc.type] += balance;
    }
  });

  // Convert the grouped totals into the shape expected by the chart UI.
  const chart = [
    { name: "Checking", population: totals.checking, color: "#7ef714", type: "checking" },
    { name: "Savings", population: totals.savings, color: "#f7c914", type: "savings" },
    { name: "Depository", population: totals.depository, color: "#14b8f7", type: "depository" },
    { name: "Investment", population: totals.investment, color: "#f7147e", type: "investment" },
    { name: "Brokerage", population: totals.brokerage, color: "#a14ef7", type: "brokerage" },
  ];

  // Show the biggest asset types first.
  return chart.sort((a, b) => b.population - a.population);
};