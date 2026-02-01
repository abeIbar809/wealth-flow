import express from "express";
import plaidAct from "./../controllers/plaid.js";

const router = express.Router();

router.post("/link-token", plaidAct.getLinkToken);
router.post("/token-exchange", plaidAct.exchangePublicToken);
router.post("/accounts", plaidAct.getAccounts);

export default router;
