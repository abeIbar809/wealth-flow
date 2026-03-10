import Bank from "../models/bank.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";
import { PlaidClient } from "../lib/plaidClient.js";
import { CountryCode, Products } from "plaid";
import crypto from 'crypto';

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

// Sync accounts refresh balances from the plaid client.
const syncAccounts = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const banks = await Bank.find({ owner: userId, status: "active" });

    if (banks.length === 0) {
      return res.status(200).json({ message: "No linked banks found", accounts: [] });
    }

    const updatedAccounts = [];

    for (const bank of banks) {
      if (bank.is_manual) continue;

      try {
        const response = await PlaidClient.accountsGet({
          access_token: bank.plaid_access_token,
        });

        for (const plaidAccount of response.data.accounts) {
          const account = await Account.findOneAndUpdate(
            { plaid_account_id: plaidAccount.account_id },
            {
              balance_available: plaidAccount.balances.available,
              balance_current: plaidAccount.balances.current,
              balance_limit: plaidAccount.balances.limit,
              lastUpdated: new Date(),
            },
            { new: true },
          );

          if (account) {
            updatedAccounts.push(account);
          }
        }

        bank.lastSynced = new Date();
        await bank.save();
      } catch (bankError) {
        console.error(`Error syncing bank ${bank._id}:`, bankError);
        // Handle error
        if (bankError.response?.data?.error_code === "ITEM_LOGIN_REQUIRED") {
          bank.status = "pending_reauth";
          await bank.save();
        }
      }
    }

    return res.status(200).json({
      message: "Accounts synced successfully",
      accounts: updatedAccounts,
    });
  } catch (error) {
    console.error("Error syncing accounts:", error);
    return res.status(500).json({ message: error.message });
  }
};

function mapPlaidAccountType(plaidType) {
  const typeMap = {
    depository: "checking",
    credit: "credit",
    loan: "loan",
    investment: "investment",
    brokerage: "investment",
    other: "other",
  };
  return typeMap[plaidType] || "other";
}

// Sync transactions for the user
const syncTransactions = async (req, res) => {
  const { userId } = req.params;

  // check user id.
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // find user bank
    const banks = await Bank.find({ owner: userId, status: "active" });

    if (banks.length === 0) {
      return res.status(200).json({ message: "No linked banks found", transactions: [] });
    }

    let allTransactions = [];

    for (const bank of banks) {
      if (bank.is_manual) {
        console.log(`Skipping manual bank ${bank._id}`);
        continue;
      }
      
      try {
        let hasMore = true;
        let cursor = bank.cursor;

        while (hasMore) {
          // plaid client transaction sync
          const payload = { access_token: bank.plaid_access_token };
          if (cursor) payload.cursor = cursor; // don't send null on first sync
          const response = await PlaidClient.transactionsSync(payload);

          const { added, modified, removed, next_cursor, has_more } = response.data;

          // Process added transactions to existing linked bank.
          for (const txn of added) {
            const account = await Account.findOne({
              plaid_account_id: txn.account_id,
            });
            if (!account) continue;

            // get type
            const transactionType = determineTransactionType(txn);

            // Update the api txn response to our database
            await Transaction.findOneAndUpdate(
              { plaid_transaction_id: txn.transaction_id },
              {
                plaid_transaction_id: txn.transaction_id,
                account: account._id,
                owner: userId,
                name: txn.name,
                merchant_name: txn.merchant_name,
                amount: txn.amount,
                date: new Date(txn.date),
                authorized_date: txn.authorized_date ? new Date(txn.authorized_date) : null,
                category: txn.category || [],
                category_id: txn.category_id,
                personal_finance_category: txn.personal_finance_category,
                pending: txn.pending,
                payment_channel: txn.payment_channel || "other",
                transaction_type: transactionType,
                logo_url: txn.logo_url,
                website: txn.website,
                currency: txn.iso_currency_code || "USD",
              },
              { upsert: true, new: true },
            );
          }

          // Process modified transactions
          for (const txn of modified) {
            await Transaction.findOneAndUpdate(
              { plaid_transaction_id: txn.transaction_id },
              {
                name: txn.name,
                merchant_name: txn.merchant_name,
                amount: txn.amount,
                date: new Date(txn.date),
                category: txn.category || [],
                pending: txn.pending,
              },
            );
          }

          // Process removed transactions
          for (const txn of removed) {
            await Transaction.deleteOne({
              plaid_transaction_id: txn.transaction_id,
            });
          }

          cursor = next_cursor;
          hasMore = has_more;
        }

        // Update the cursor for next sync
        bank.cursor = cursor;
        bank.lastSynced = new Date();
        await bank.save();
      } catch (bankError) {
        console.error(`Error syncing transactions for bank ${bank._id}:`, bankError?.response?.data || bankError);
      }
    }

    // Fetch recent transactions
    const transactions = await Transaction.find({ owner: userId }).populate("account", "name institution_name mask").sort({ date: -1 }).limit(100);

    return res.status(200).json({
      message: "Transactions synced successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error syncing transactions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get transactions for the user
const getTransactions = async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0, accountId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const query = { owner: userId };
    if (accountId) {
      query.account = accountId;
    }

    const transactions = await Transaction.find(query)
      .populate("account", "name institution_name mask type")
      .sort({ date: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    return res.status(200).json({
      transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: error.message });
  }
};

const createManualBank = async (req, res) => {
  const { userId } = req.params;

  const { institution_name, accounts = [] } = req.body;

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  if (!institution_name?.trim()) {
    return res.status(400).json({ message: "institution_name is required" });
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return res.status(400).json({ message: "At least one account is required" });
  }

  try {
    // Generate required Bank fields your schema requires but user won't know
    const institution_id = `manual_${crypto.randomUUID()}`;
    const plaid_access_token = `manual_access_${crypto.randomUUID()}`;
    const plaid_item_id = `manual_item_${crypto.randomUUID()}`;

    const bank = new Bank({
      institution_id,
      institution_name: institution_name.trim(),
      plaid_access_token,
      plaid_item_id,
      owner: userId,
      cursor: null,
      lastSynced: null,
      status: "active",
      is_manual: true,
    });

    await bank.save();

    // Create accounts tied to this bank
    for (const a of accounts) {
      if (!a?.name?.trim() || !a?.type) {
        return res.status(400).json({ message: "Each account requires name and type" });
      }

      const balance_current = Number(a.balance_current);
      if (Number.isNaN(balance_current)) {
        return res.status(400).json({ message: "balance_current must be a number" });
      }

      const account = new Account({
        plaid_account_id: null,
        bank: bank._id,
        owner: userId,

        name: a.name.trim(),
        official_name: null,
        type: a.type,
        subtype: a.subtype ?? null,
        mask: null, // removed from user form

        balance_available: null,
        balance_current,
        balance_limit: null,
        currency: (a.currency ?? "USD").trim(),

        institution_name: bank.institution_name,
        institution_id: bank.institution_id,

        isLinked: true,
        is_manual: true,
      });

      await account.save();
    }

    const populatedAccounts = await Account.find({ bank: bank._id })
      .populate("bank", "institution_name status")
      .sort({ createdAt: -1 });

    return res.status(201).json({
      message: "Manual bank + accounts created successfully",
      bankId: bank._id,
      accounts: populatedAccounts,
    });
  } catch (error) {
    console.error("Error creating manual bank:", error);
    return res.status(500).json({ message: error.message });
  }
};

const createManualTransaction = async (req, res) => {
  const { userId } = req.params;
  const {
    accountId,
    name,
    amount,
    date,
    transaction_type = "expense", // "income" | "expense" | "transfer" | "other"
    merchant_name = null,
    category = [],
    payment_channel = "other",
    currency = "USD",
    personal_finance_category = null,
  } = req.body;

  if (!userId) return res.status(400).json({ message: "User ID is required" });
  if (!accountId) return res.status(400).json({ message: "accountId is required" });
  if (!name?.trim()) return res.status(400).json({ message: "name is required" });
  if (amount === undefined || amount === null) {
    return res.status(400).json({ message: "amount is required" });
  }
  if (!date) return res.status(400).json({ message: "date is required" });

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount)) {
    return res.status(400).json({ message: "amount must be a number" });
  }

  // Make sure the account belongs to this user
  const account = await Account.findOne({ _id: accountId, owner: userId });
  if (!account) return res.status(404).json({ message: "Account not found" });

  // Keep behavior consistent: your sync logic treats negative as income.
  // If user picks income and enters a positive number, store it negative.
  let finalAmount = parsedAmount;
  if (transaction_type === "income" && parsedAmount > 0) finalAmount = -parsedAmount;

  const plaid_transaction_id = `manual_txn_${crypto.randomUUID()}`;

  const txn = await Transaction.create({
    plaid_transaction_id,
    account: account._id,
    owner: userId,
    name: name.trim(),
    merchant_name,
    amount: finalAmount,
    date: new Date(date),
    authorized_date: null,
    category: Array.isArray(category) ? category : [],
    category_id: null,
    personal_finance_category: personal_finance_category ?? null,
    pending: false,
    payment_channel,
    transaction_type,
    logo_url: null,
    website: null,
    currency,
  });

  const populated = await Transaction.findById(txn._id).populate(
    "account",
    "name institution_name mask type"
  );

  return res.status(201).json({ message: "Transaction added", transaction: populated });
};

// Determine the transaction type based on amount and category
function determineTransactionType(txn) {
  // plaid amounts: positive = money out, negative = money in
  if (txn.amount < 0) {
    return "income";
  }

  const category = txn.category?.[0]?.toLowerCase() || "";
  if (category.includes("transfer") || category.includes("payment")) {
    return "transfer";
  }

  return "expense";
}

export default {
  getLinkToken,
  getAccounts,
  exchangePublicToken,
  getAccounts,
  syncAccounts,
  getTransactions,
  syncTransactions,
  createManualBank,
  createManualTransaction
};
