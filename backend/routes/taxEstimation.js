import express from 'express';
import taxEstimation_Act from './../controllers/taxEstimation.js';

const router = express.Router();

//calculate tax estimate for a user
router.post('/calculate', taxEstimation_Act.getTaxEstimate);

export default router;
