//2024 federal tax brackets by filing status
//each bracket defines the upper income limit and the marginal rate for that range
const TAX_BRACKETS = {
    single: [
        { upTo: 11600, rate: 0.10 },
        { upTo: 47150, rate: 0.12 },
        { upTo: 100525, rate: 0.22 },
        { upTo: 191950, rate: 0.24 },
        { upTo: Infinity, rate: 0.32 },
    ],
    married: [
        { upTo: 23200, rate: 0.10 },
        { upTo: 94300, rate: 0.12 },
        { upTo: 201050, rate: 0.22 },
        { upTo: 383900, rate: 0.24 },
        { upTo: Infinity, rate: 0.32 },
    ],
    head_of_household: [
        { upTo: 16550, rate: 0.10 },
        { upTo: 63100, rate: 0.12 },
        { upTo: 100500, rate: 0.22 },
        { upTo: 191950, rate: 0.24 },
        { upTo: Infinity, rate: 0.32 },
    ],
};

//2024 standard deductions by filing status
const STANDARD_DEDUCTIONS = {
    single: 14600,
    married: 29200,
    head_of_household: 21900,
};

//applies progressive tax brackets to taxable income
//only the portion of income within each bracket is taxed at that bracket's rate
const calculateProgressiveTax = (taxableIncome, brackets) => {
    let tax = 0;
    let previousLimit = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= previousLimit) break;
        const taxableInBracket = Math.min(taxableIncome, bracket.upTo) - previousLimit;
        tax += taxableInBracket * bracket.rate;
        previousLimit = bracket.upTo;
    }
    return tax;
};

//calculates federal tax estimate from user-entered income and filing status
//applies standard deduction, then runs income through progressive brackets
const getTaxEstimate = async (req, res) => {
    const { filingStatus, yearlyIncome } = req.body;

    try {
        const income = Number(yearlyIncome);

        if (!income || income <= 0) {
            return res.status(400).json({ message: 'Please enter a valid yearly income.' });
        }

        //map filing status string to bracket key
        const statusKey = filingStatus === 'Married Filing Jointly' ? 'married'
            : filingStatus === 'Head of Household' ? 'head_of_household'
            : 'single';

        //apply standard deduction before calculating tax
        const deductions = STANDARD_DEDUCTIONS[statusKey];
        const taxableIncome = Math.max(0, income - deductions);
        const brackets = TAX_BRACKETS[statusKey];
        const estimatedTax = calculateProgressiveTax(taxableIncome, brackets);

        //effective rate is tax as a percentage of gross income (not taxable income)
        const effectiveRate = income > 0 ? (estimatedTax / income) * 100 : 0;

        res.status(200).json({
            yearlyIncome: income,
            deductions,
            taxableIncome,
            estimatedTax,
            effectiveRate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { getTaxEstimate };
