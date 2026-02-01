import express from "express";
import plaidAct from "./../controllers/plaid.js";

const router = express.Router();

// Plaid link
router.post("/link-token", plaidAct.getLinkToken);
router.post("/token-exchange", plaidAct.exchangePublicToken);

// Accounts
router.get("/accounts/:userId", plaidAct.getAccounts);
router.post("/accounts/:userId/sync", plaidAct.syncAccounts);

export default router;
