import express from 'express'
import weeklyGoal_Act from './../controllers/weeklyGoals.js'

const router = express.Router();

//must be before /:userId to avoid express matching 'sync-spending' as a userId
router.get('/sync-spending/:userId', weeklyGoal_Act.syncSpendingFromPlaid);
router.get('/:userId', weeklyGoal_Act.getWeeklyGoals);
router.get('/current/:userId', weeklyGoal_Act.getCurrentWeekGoals);
router.post('/', weeklyGoal_Act.createWeeklyGoal);
router.patch('/:id', weeklyGoal_Act.updateWeeklyGoal);
router.delete('/:id', weeklyGoal_Act.deleteWeeklyGoal);

export default router;