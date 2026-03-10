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

//Manual Transaction
router.post("/transactions/:userId/manual", plaidAct.createManualTransaction);

//Manual Bank add
router.post("/banks/:userId/manual", plaidAct.createManualBank);

// Bank management
router.delete("/banks/:bankId", plaidAct.removeBank);

export default router;