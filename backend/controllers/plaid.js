import Bank from "../models/bank.js";
import Account from "../models/account.js";
import { PlaidClient } from "../lib/plaidClient.js";
import { CountryCode, Products } from "plaid";

// Create a link token for Plaid Link
const getLinkToken = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const response = await PlaidClient.linkTokenCreate({
      client_name: "WealthFlow",
      user: {
        client_user_id: userId,
      },
      language: "en",
      country_codes: [CountryCode.Us],
      products: [Products.Transactions],
    });

    const linkToken = response.data.link_token;
    console.log("Link token created for user:", userId);

    return res.status(200).json({
      linkToken,
      expiration: response.data.expiration,
      message: "Link token created successfully",
    });
  } catch (error) {
    console.error("Error creating link token:", error);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.error_message || error.message,
      code: error.response?.data?.error_code || "INTERNAL_ERROR",
    });
  }
};

// Exchange public token for access token and save bank/accounts
const exchangePublicToken = async (req, res) => {
  const { publicToken, userId, institution } = req.body;

  if (!publicToken || !userId) {
    return res.status(400).json({ message: "Public token and user ID are required" });
  }

  try {
    // Exchange public token for access token
    const exchangeResponse = await PlaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log("Token exchanged successfully for user:", userId);

    // Save the bank
    const bank = new Bank({
      institution_id: institution?.institution_id || "unknown",
      institution_name: institution?.name || "Unknown Institution",
      plaid_access_token: accessToken,
      plaid_item_id: itemId,
      owner: userId,
      status: "active",
    });

    await bank.save();
    console.log("Bank saved:", bank._id);

    // Fetch and save accounts
    const accountsResponse = await PlaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    const savedAccounts = [];

    for (const plaidAccount of accounts) {
      const accountType = mapPlaidAccountType(plaidAccount.type);

      const account = new Account({
        plaid_account_id: plaidAccount.account_id,
        bank: bank._id,
        owner: userId,
        name: plaidAccount.name,
        official_name: plaidAccount.official_name,
        type: accountType,
        subtype: plaidAccount.subtype,
        mask: plaidAccount.mask,
        balance_available: plaidAccount.balances.available,
        balance_current: plaidAccount.balances.current,
        balance_limit: plaidAccount.balances.limit,
        currency: plaidAccount.balances.iso_currency_code || "USD",
        institution_name: institution?.name || "Unknown Institution",
        institution_id: institution?.institution_id || "unknown",
        isLinked: true,
        is_manual: false,
      });

      await account.save();
      savedAccounts.push(account);
    }

    console.log(`Saved ${savedAccounts.length} accounts for bank:`, bank._id);

    return res.status(200).json({
      message: "Account linked successfully",
      bankId: bank._id,
      accounts: savedAccounts,
    });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.error_message || error.message,
      code: error.response?.data?.error_code || "INTERNAL_ERROR",
    });
  }
};

// Get all accounts for a user
const getAccounts = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const accounts = await Account.find({ owner: userId }).populate("bank", "institution_name status").sort({ createdAt: -1 });

    return res.status(200).json({ accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getLinkToken,
  getAccounts,
  exchangePublicToken,
  getAccounts,
};
