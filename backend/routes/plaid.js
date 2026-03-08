import express from "express";
import plaidAct from "./../controllers/plaid.js";

const router = express.Router();

// Plaid link
router.post("/link-token", plaidAct.getLinkToken);
router.post("/token-exchange", plaidAct.exchangePublicToken);

// Accounts
router.get("/accounts/:userId", plaidAct.getAccounts);
router.post("/accounts/:userId/sync", plaidAct.syncAccounts);

// Transactions
router.get("/transactions/:userId", plaidAct.getTransactions);
router.post("/transactions/:userId/sync", plaidAct.syncTransactions);

export default router;
