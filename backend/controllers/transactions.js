import Transaction from './../models/transaction.js'

const searchTransactions = async (req, res) => {
    const { userId, accountId, category, startDate, endDate, merchantName, minAmount, maxAmount } = req.query;

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const query = { owner: userId };

        if (accountId) query.account = accountId;
        if (category) query['personal_finance_category.primary'] = category;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        //search both merchant_name and name so results show regardless of which field plaid populated
        if (merchantName) {
            query.$or = [
                { merchant_name: { $regex: merchantName, $options: 'i' } },
                { name: { $regex: merchantName, $options: 'i' } },
            ];
        }

        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = Number(minAmount);
            if (maxAmount) query.amount.$lte = Number(maxAmount);
        }

        //populate account so the frontend gets the account name in one request
        const transactions = await Transaction.find(query)
            .populate('account', 'name type institution_name')
            .sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { searchTransactions };
