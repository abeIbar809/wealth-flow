import express from 'express'
import weeklyGoal_Act from './../controllers/weeklyGoals.js'

const router = express.Router();

//static segments must be registered before /:userId or express swallows them as the param
router.get('/sync-spending/:userId', weeklyGoal_Act.syncSpendingFromPlaid);
router.get('/current/:userId', weeklyGoal_Act.getCurrentWeekGoals);
router.get('/:userId', weeklyGoal_Act.getWeeklyGoals);
router.post('/', weeklyGoal_Act.createWeeklyGoal);
router.patch('/:id', weeklyGoal_Act.updateWeeklyGoal);
router.delete('/:id', weeklyGoal_Act.deleteWeeklyGoal);

export default router;