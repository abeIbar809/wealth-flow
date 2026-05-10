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

// Get liabilities from Plaid 
const getLiabilities = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const banks = await Bank.find({ owner: userId, status: "active" });

    if (banks.length === 0) {
      return res.status(200).json({
        message: "No linked banks found",
        liabilities: { credit: [], student: [], mortgage: [] },
      });
    }
    // All array types
    const allLiabilities = {
      credit: [],
      student: [],
      mortgage: [],
    };

    for (const bank of banks) {
      try {
        const response = await PlaidClient.liabilitiesGet({
          access_token: bank.plaid_access_token,
        });

        const { liabilities } = response.data;

        // card liabilites
        if (liabilities.credit) {
          allLiabilities.credit.push(...liabilities.credit.map(card => ({
            ...card,
            institution: bank.institution_name,
          })));
        }

        // loan liabilites
        if (liabilities.student) {
          allLiabilities.student.push(...liabilities.student.map(loan => ({
            ...loan,
            institution: bank.institution_name,
          })));
        }

        // Mortage liabilites
        if (liabilities.mortgage) {
          allLiabilities.mortgage.push(...liabilities.mortgage.map(mortgage => ({
            ...mortgage,
            institution: bank.institution_name,
          })));
        }
      } catch (bankError) {
        // Liabilities may not be available for all banks
        console.log(`Liabilities not available for bank ${bank._id}:`, bankError.response?.data?.error_code);
      }
    }

    return res.status(200).json({ liabilities: allLiabilities });
  } catch (error) {
    console.error("Error fetching liabilities:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get credit insights 
const getCreditInsights = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Get all credit accounts
    const creditAccounts = await Account.find({
      owner: userId,
      type: "credit",
    });

    // Get all loan accounts
    const loanAccounts = await Account.find({
      owner: userId,
      type: "loan",
    });

    // Calculate credit utilization
    let totalCreditLimit = 0;
    let totalCreditUsed = 0;
    const creditCards = [];

    for (const account of creditAccounts) {
      const limit = account.balance_limit || 0;
      const balance = account.balance_current || 0;
      const utilization = limit > 0 ? (balance / limit) * 100 : 0;

      totalCreditLimit += limit;
      totalCreditUsed += balance;

      creditCards.push({
        id: account._id,
        name: account.name,
        institution: account.institution_name,
        balance: balance,
        limit: limit,
        utilization: Math.round(utilization * 10) / 10,
        available: limit - balance,
        lastUpdated: account.lastUpdated,
      });
    }

    const overallUtilization = totalCreditLimit > 0
      ? Math.round((totalCreditUsed / totalCreditLimit) * 1000) / 10
      : 0;

    // Calculate credit score estimate based on utilization
    // A simplified estimate - not actually credit score
    let creditHealthScore = 100;
    if (overallUtilization > 90) creditHealthScore = 30;
    else if (overallUtilization > 75) creditHealthScore = 50;
    else if (overallUtilization > 50) creditHealthScore = 65;
    else if (overallUtilization > 30) creditHealthScore = 80;
    else if (overallUtilization > 10) creditHealthScore = 90;

    // Get credit health status
    let creditHealthStatus = "Excellent";
    let creditHealthColor = "#03BF62";
    if (creditHealthScore < 50) {
      creditHealthStatus = "Poor";
      creditHealthColor = "#EF4444";
    } else if (creditHealthScore < 70) {
      creditHealthStatus = "Fair";
      creditHealthColor = "#F59E0B";
    } else if (creditHealthScore < 85) {
      creditHealthStatus = "Good";
      creditHealthColor = "#3B82F6";
    }

    // Calculate total debt
    const totalDebt = totalCreditUsed + loanAccounts.reduce((sum, acc) => sum + (acc.balance_current || 0), 0);

    // Get recent credit transactions (payments and charges)
    const recentTransactions = await Transaction.find({
      owner: userId,
      account: { $in: creditAccounts.map(a => a._id) },
    })
      .sort({ date: -1 })
      .limit(10)
      .populate("account", "name");

    // Calculate monthly payment estimate 
    const estimatedMonthlyPayment = Math.round(totalCreditUsed * 0.02);

    return res.status(200).json({
      creditHealth: {
        score: creditHealthScore,
        status: creditHealthStatus,
        color: creditHealthColor,
      },
      utilization: {
        overall: overallUtilization,
        totalLimit: totalCreditLimit,
        totalUsed: totalCreditUsed,
        totalAvailable: totalCreditLimit - totalCreditUsed,
      },
      creditCards,
      loans: loanAccounts.map(loan => ({
        id: loan._id,
        name: loan.name,
        institution: loan.institution_name,
        balance: loan.balance_current || 0,
        type: loan.subtype || "loan",
      })),
      summary: {
        totalDebt,
        numberOfCreditCards: creditCards.length,
        numberOfLoans: loanAccounts.length,
        estimatedMonthlyPayment,
      },
      recentTransactions: recentTransactions.map(txn => ({
        id: txn._id,
        name: txn.name,
        amount: txn.amount,
        date: txn.date,
        type: txn.amount < 0 ? "payment" : "charge",
        accountName: txn.account?.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching credit insights:", error);
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
  createManualBank,
  createManualTransaction,
  removeBank,
  getCreditInsights,
  getLiabilities,
};