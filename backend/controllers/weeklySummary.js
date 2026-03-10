import Transaction from './../models/transaction.js';

const getWeeklySummary = async (req, res) => {
    const { userId } = req.params;
    
    try {
        //get current week dates
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        //get previous week dates
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
        
        //fetch this week's transactions
        const thisWeekTransactions = await Transaction.find({
            owner: userId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });
        
        //fetch last week's transactions
        const lastWeekTransactions = await Transaction.find({
            owner: userId,
            date: { $gte: startOfPrevWeek, $lt: startOfWeek }
        });
        
        //calculate this week's totals
        const thisWeekIncome = thisWeekTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const thisWeekExpenses = thisWeekTransactions
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        //calculate last week's totals
        const lastWeekIncome = lastWeekTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
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
            weekOf: startOfWeek,
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