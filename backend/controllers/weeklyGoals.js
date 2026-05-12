import WeeklyGoal from './../models/weeklyGoal.js'
import Transaction from './../models/transaction.js'

//maps plaid personal_finance_category to goal category names
const mapToGoalCategory = (primary = '', detailed = '') => {
    const p = primary.toUpperCase();
    const d = detailed.toUpperCase();
    if (p === 'FOOD_AND_DRINK' && d.includes('GROCERIES')) return 'Groceries';
    if (p === 'FOOD_AND_DRINK') return 'Dining';
    if (p === 'TRANSPORTATION' || p === 'TRAVEL') return 'Transport';
    if (p === 'ENTERTAINMENT' || p === 'RECREATION') return 'Entertainment';
    if (p === 'GENERAL_MERCHANDISE' || p === 'CLOTHING_AND_ACCESSORIES') return 'Shopping';
    return 'Other';
};

const getWeeklyGoals = async (req, res) => {
    const { userId } = req.params;
    try {
        const goals = await WeeklyGoal.find({ userId });
        res.status(200).json(goals);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getCurrentWeekGoals = async (req, res) => {
    const { userId } = req.params;
    try {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const goals = await WeeklyGoal.findOne({ 
            userId, 
            weekStartDate: { $gte: startOfWeek } 
        });
        res.status(200).json(goals);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createWeeklyGoal = async (req, res) => {
    const weeklyGoal = new WeeklyGoal(req.body);
    try {
        await weeklyGoal.save();
        res.status(201).json(weeklyGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateWeeklyGoal = async (req, res) => {
    const { id } = req.params;
    try {
        const goal = await WeeklyGoal.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteWeeklyGoal = async (req, res) => {
    const { id } = req.params;
    try {
        await WeeklyGoal.findByIdAndDelete(id);
        res.status(204).json({ message: "Weekly goal deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//queries this week's expense transactions and returns spending totals per goal category
const syncSpendingFromPlaid = async (req, res) => {
    const { userId } = req.params;

    try {
        //rolling 7-day window matches the weeklySummary convention
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        //fetch last 7 days of expense transactions (includes manual and plaid)
        const transactions = await Transaction.find({
            owner: userId,
            transaction_type: 'expense',
            date: { $gte: startOfWeek, $lte: now },
        });

        //tally spending into goal categories
        const spending = { Groceries: 0, Dining: 0, Entertainment: 0, Transport: 0, Shopping: 0, Other: 0 };
        for (const txn of transactions) {
            const primary = txn.personal_finance_category?.primary || '';
            const detailed = txn.personal_finance_category?.detailed || '';
            const category = mapToGoalCategory(primary, detailed);
            spending[category] += Math.abs(txn.amount);
        }

        res.status(200).json({ spending, transactionCount: transactions.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { getWeeklyGoals, getCurrentWeekGoals, createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal, syncSpendingFromPlaid };