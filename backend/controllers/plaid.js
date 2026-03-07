import Bank from "../models/bank.js";
import Account from "../models/account.js";
import Transaction from "../models/transaction.js";
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
      try {
        let hasMore = true;
        let cursor = bank.cursor;

        while (hasMore) {
          // plaid client transaction sync
          const response = await PlaidClient.transactionsSync({
            access_token: bank.plaid_access_token,
            cursor: cursor,
          });

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
        console.error(`Error syncing transactions for bank ${bank._id}:`, bankError);
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

const removeBank = async (req, res) => {
  const { bankId } = req.params;
  const { userId } = req.body;

  if (!bankId || !userId) {
    return res.status(400).json({ message: "Bank ID and User ID are required" });
  }

  try {
    const bank = await Bank.findOne({ _id: bankId, owner: userId });

    if (!bank) {
      return res.status(404).json({ message: "404 Bank not found" });
    }

    // Remove item from Plaid using access_token
    try {
      await PlaidClient.itemRemove({
        access_token: bank.plaid_access_token,
      });
    } catch (plaidError) {
      console.error("Error removing item from Plaid:", plaidError);
      // Continue with local deletion even if Plaid removal fails
    }

    // Delete all related transactions
    const accounts = await Account.find({ bank: bank._id });
    const accountIds = accounts.map((a) => a._id);
    await Transaction.deleteMany({ account: { $in: accountIds } });

    // Delete all related accounts
    await Account.deleteMany({ bank: bank._id });

    // Delete the bank
    await Bank.deleteOne({ _id: bank._id });

    return res.status(200).json({ message: "Bank removed successfully" });
  } catch (error) {
    console.error("Error removing bank:", error);
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getLinkToken,
  getAccounts,
  exchangePublicToken,
  getAccounts,
  syncAccounts,
  getTransactions,
  syncTransactions,
  removeBank,
};