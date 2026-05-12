import Transaction from './../models/transaction.js';

const getWeeklySummary = async (req, res) => {
    const { userId } = req.params;
    
    try {
        //use rolling 7-day windows so recent synced transactions always appear
        const now = new Date();

        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - 6);
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfPrevWeek = new Date(startOfThisWeek);
        startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);

        //fetch this week's transactions (last 7 days)
        const thisWeekTransactions = await Transaction.find({
            owner: userId,
            date: { $gte: startOfThisWeek, $lte: now }
        });

        //fetch previous 7-day window for comparison
        const lastWeekTransactions = await Transaction.find({
            owner: userId,
            date: { $gte: startOfPrevWeek, $lt: startOfThisWeek }
        });
        
        //calculate this week's totals
        const thisWeekIncome = thisWeekTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const thisWeekExpenses = thisWeekTransactions
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        //calculate last week's totals
        const lastWeekIncome = lastWeekTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const lastWeekExpenses = lastWeekTransactions
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        //group by category
        const categoryBreakdown = {};
        thisWeekTransactions
            .filter(t => t.transaction_type === 'expense')
            .forEach(t => {
                const category = t.personal_finance_category?.primary || 'Other';
                if (!categoryBreakdown[category]) {
                    categoryBreakdown[category] = 0;
                }
                categoryBreakdown[category] += Math.abs(t.amount);
            });
        
        const summary = {
            weekOf: startOfThisWeek,
            thisWeek: {
                income: thisWeekIncome,
                expenses: thisWeekExpenses,
                netCashFlow: thisWeekIncome - thisWeekExpenses,
                byCategory: categoryBreakdown
            },
            lastWeek: {
                income: lastWeekIncome,
                expenses: lastWeekExpenses,
                netCashFlow: lastWeekIncome - lastWeekExpenses
            },
            comparison: {
                incomeChange: lastWeekIncome > 0 
                    ? ((thisWeekIncome - lastWeekIncome) / lastWeekIncome * 100).toFixed(1) + '%'
                    : 'N/A',
                expenseChange: lastWeekExpenses > 0
                    ? ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses * 100).toFixed(1) + '%'
                    : 'N/A'
            }
        };
        
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { getWeeklySummary };