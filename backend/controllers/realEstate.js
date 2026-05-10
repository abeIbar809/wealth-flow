import RealEstate from "../models/realEstate.js";
import PropertyValueHistory from "../models/propertyValueHistory.js";

//  Get all properties for a user with portfolio summary
const getProperties = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const properties = await RealEstate.find({ owner: userId }).sort({ createdAt: -1 });
    const summary = calculatePortfolioSummary(properties);

    return res.status(200).json({
      properties,
      summary,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Add a new property
 */
const addProperty = async (req, res) => {
  const {
    userId,
    name,
    propertyType,
    address,
    bedrooms,
    bathrooms,
    squareFeet,
    lotSize,
    yearBuilt,
    purchasePrice,
    purchaseDate,
    currentValue,
    hasMortgage,
    mortgageBalance,
    mortgagePayment,
    interestRate,
    loanTerm,
    isRental,
    monthlyRent,
    occupancyStatus,
    leaseEndDate,
    monthlyExpenses,
    imageUrl,
    notes,
  } = req.body;

  if (!userId || !name || !propertyType || purchasePrice === undefined) {
    return res.status(400).json({
      message: "userId, name, propertyType, and purchasePrice are required",
    });
  }

  try {
    const property = new RealEstate({
      owner: userId,
      name,
      propertyType,
      address: address || {},
      bedrooms,
      bathrooms,
      squareFeet,
      lotSize,
      yearBuilt,
      purchasePrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      currentValue: currentValue || purchasePrice,
      hasMortgage: hasMortgage || false,
      mortgageBalance: mortgageBalance || 0,
      mortgagePayment: mortgagePayment || 0,
      interestRate: interestRate || 0,
      loanTerm,
      isRental: isRental || false,
      monthlyRent: monthlyRent || 0,
      occupancyStatus: occupancyStatus || "owner_occupied",
      leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
      monthlyExpenses: monthlyExpenses || {},
      imageUrl,
      notes,
    });

    await property.save();
    console.log("Property created:", property._id);

    // Create initial value history entry
    const historyEntry = new PropertyValueHistory({
      property: property._id,
      value: currentValue || purchasePrice,
      source: "manual",
      notes: "Initial value at purchase",
    });
    await historyEntry.save();

    return res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    console.error("Error adding property:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update an existing property
 */
const updateProperty = async (req, res) => {
  const { propertyId } = req.params;
  const { userId, ...updates } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const property = await RealEstate.findOne({
      _id: propertyId,
      owner: userId,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Track if current value changed for history
    const oldValue = property.currentValue;
    const newValue = updates.currentValue;

    // Update allowed fields
    const allowedFields = [
      "name", "propertyType", "address", "bedrooms", "bathrooms",
      "squareFeet", "lotSize", "yearBuilt", "purchasePrice", "purchaseDate",
      "currentValue", "hasMortgage", "mortgageBalance", "mortgagePayment",
      "interestRate", "loanTerm", "isRental", "monthlyRent", "occupancyStatus",
      "leaseEndDate", "monthlyExpenses", "imageUrl", "notes"
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === "purchaseDate" || field === "leaseEndDate") {
          property[field] = updates[field] ? new Date(updates[field]) : null;
        } else {
          property[field] = updates[field];
        }
      }
    }

    property.lastUpdated = new Date();
    await property.save();

    // Add value history if current value changed significantly (more than $100)
    if (newValue !== undefined && Math.abs(newValue - oldValue) > 100) {
      const historyEntry = new PropertyValueHistory({
        property: property._id,
        value: newValue,
        source: "manual",
        notes: "Manual value update",
      });
      await historyEntry.save();
    }

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a property
 */
const deleteProperty = async (req, res) => {
  const { propertyId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const property = await RealEstate.findOneAndDelete({
      _id: propertyId,
      owner: userId,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Delete value history
    await PropertyValueHistory.deleteMany({ property: propertyId });

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get property value history
 */
const getValueHistory = async (req, res) => {
  const { propertyId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    // Verify ownership
    const property = await RealEstate.findOne({
      _id: propertyId,
      owner: userId,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const history = await PropertyValueHistory.find({ property: propertyId })
      .sort({ date: -1 })
      .limit(50);

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Error fetching value history:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Add a value history entry
 */
const addValueHistory = async (req, res) => {
  const { propertyId } = req.params;
  const { userId, value, source, notes } = req.body;

  if (!userId || value === undefined) {
    return res.status(400).json({ message: "userId and value are required" });
  }

  try {
    // Verify ownership and update current value
    const property = await RealEstate.findOne({
      _id: propertyId,
      owner: userId,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Update current value
    property.currentValue = value;
    property.lastUpdated = new Date();
    await property.save();

    // Add history entry
    const historyEntry = new PropertyValueHistory({
      property: propertyId,
      value,
      source: source || "manual",
      notes,
    });
    await historyEntry.save();

    return res.status(201).json({
      message: "Value history added successfully",
      history: historyEntry,
      property,
    });
  } catch (error) {
    console.error("Error adding value history:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get portfolio analytics
 */
const getPortfolioAnalytics = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const properties = await RealEstate.find({ owner: userId });

    // Calculate analytics
    const totalProperties = properties.length;
    const rentalProperties = properties.filter(p => p.isRental);
    const totalRentalProperties = rentalProperties.length;

    // Property type breakdown
    const typeBreakdown = {};
    properties.forEach(p => {
      typeBreakdown[p.propertyType] = (typeBreakdown[p.propertyType] || 0) + 1;
    });

    // Financial metrics
    let totalValue = 0;
    let totalEquity = 0;
    let totalDebt = 0;
    let totalMonthlyRent = 0;
    let totalMonthlyExpenses = 0;
    let totalMonthlyMortgage = 0;

    properties.forEach(p => {
      const value = p.currentValue || p.purchasePrice;
      totalValue += value;
      totalDebt += p.mortgageBalance || 0;
      totalEquity += value - (p.mortgageBalance || 0);
      totalMonthlyRent += p.isRental ? (p.monthlyRent || 0) : 0;
      totalMonthlyExpenses += p.totalMonthlyExpenses || 0;
      totalMonthlyMortgage += p.mortgagePayment || 0;
    });

    const totalMonthlyCashFlow = totalMonthlyRent - totalMonthlyExpenses;
    const annualCashFlow = totalMonthlyCashFlow * 12;

    // Occupancy rate
    const occupiedRentals = rentalProperties.filter(
      p => p.occupancyStatus === "occupied" || p.occupancyStatus === "partially_occupied"
    ).length;
    const occupancyRate = totalRentalProperties > 0
      ? (occupiedRentals / totalRentalProperties) * 100
      : 0;

    // Average metrics
    const avgPropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;
    const avgEquityPerProperty = totalProperties > 0 ? totalEquity / totalProperties : 0;
    const avgRentPerProperty = totalRentalProperties > 0
      ? totalMonthlyRent / totalRentalProperties
      : 0;

    // Portfolio cap rate
    const portfolioCapRate = totalValue > 0
      ? ((totalMonthlyRent * 12 - (totalMonthlyExpenses - totalMonthlyMortgage) * 12) / totalValue) * 100
      : 0;

    // LTV ratio
    const portfolioLTV = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;

    return res.status(200).json({
      overview: {
        totalProperties,
        totalRentalProperties,
        totalValue,
        totalEquity,
        totalDebt,
        portfolioLTV: Math.round(portfolioLTV * 10) / 10,
      },
      cashFlow: {
        monthlyRent: totalMonthlyRent,
        monthlyExpenses: totalMonthlyExpenses,
        monthlyMortgage: totalMonthlyMortgage,
        netMonthlyCashFlow: totalMonthlyCashFlow,
        annualCashFlow,
      },
      metrics: {
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        avgPropertyValue: Math.round(avgPropertyValue),
        avgEquityPerProperty: Math.round(avgEquityPerProperty),
        avgRentPerProperty: Math.round(avgRentPerProperty),
        portfolioCapRate: Math.round(portfolioCapRate * 100) / 100,
      },
      typeBreakdown,
    });
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Calculate portfolio summary
 */
function calculatePortfolioSummary(properties) {
  let totalValue = 0;
  let totalEquity = 0;
  let totalDebt = 0;
  let totalMonthlyIncome = 0;
  let totalMonthlyExpenses = 0;
  let totalAppreciation = 0;

  for (const property of properties) {
    const value = property.currentValue || property.purchasePrice;
    totalValue += value;
    totalEquity += value - (property.mortgageBalance || 0);
    totalDebt += property.mortgageBalance || 0;
    totalAppreciation += value - property.purchasePrice;

    if (property.isRental) {
      totalMonthlyIncome += property.monthlyRent || 0;
    }
    totalMonthlyExpenses += property.totalMonthlyExpenses || 0;
  }

  const netMonthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const appreciationPercent = totalValue > totalAppreciation && properties.length > 0
    ? (totalAppreciation / (totalValue - totalAppreciation)) * 100
    : 0;

  return {
    totalProperties: properties.length,
    totalValue,
    totalEquity,
    totalDebt,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    netMonthlyCashFlow,
    annualCashFlow: netMonthlyCashFlow * 12,
    totalAppreciation,
    appreciationPercent: Math.round(appreciationPercent * 100) / 100,
  };
}

export default {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  getValueHistory,
  addValueHistory,
  getPortfolioAnalytics,
};
