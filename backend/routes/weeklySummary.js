import express from 'express';
import weeklySummary_Act from './../controllers/weeklySummary.js';

const router = express.Router();

//get weekly summary for a user
router.get('/:userId', weeklySummary_Act.getWeeklySummary);

export default router;