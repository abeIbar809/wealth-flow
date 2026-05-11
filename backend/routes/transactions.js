import express from 'express'
import transactionAct from './../controllers/transactions.js'

const router = express.Router();

//all filter params are optional except userId
router.get('/search', transactionAct.searchTransactions);

export default router;
