import mongoose from "mongoose";

/**
 * Real Estate Property Model
 * Tracks real estate investments including rental properties, primary residence, and land
 */
const realEstateSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Property Details
  name: {
    type: String,
    required: true,
    trim: true,
  },
  propertyType: {
    type: String,
    enum: ["single_family", "multi_family", "condo", "townhouse", "apartment", "commercial", "land", "other"],
    required: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: "USA" },
  },

  // Property Characteristics
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  squareFeet: { type: Number, min: 0 },
  lotSize: { type: Number, min: 0 }, // in sq ft or acres
  yearBuilt: { type: Number },

  // Financial Details
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
  },
  currentValue: {
    type: Number,
    min: 0,
  },

  // Mortgage/Loan Details
  hasMortgage: {
    type: Boolean,
    default: false,
  },
  mortgageBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  mortgagePayment: {
    type: Number,
    default: 0,
    min: 0,
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  loanTerm: {
    type: Number, // in years
  },

  // Rental Income 
  isRental: {
    type: Boolean,
    default: false,
  },
  monthlyRent: {
    type: Number,
    default: 0,
    min: 0,
  },
  occupancyStatus: {
    type: String,
    enum: ["occupied", "vacant", "owner_occupied", "partially_occupied"],
    default: "owner_occupied",
  },
  leaseEndDate: {
    type: Date,
  },

  // Expenses
  monthlyExpenses: {
    propertyTax: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    hoa: { type: Number, default: 0, min: 0 },
    maintenance: { type: Number, default: 0, min: 0 },
    utilities: { type: Number, default: 0, min: 0 },
    propertyManagement: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 },
  },

  // Images
  imageUrl: {
    type: String,
  },

  // Notes
  notes: {
    type: String,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Virtual: Total monthly expenses
realEstateSchema.virtual("totalMonthlyExpenses").get(function () {
  const exp = this.monthlyExpenses;
  return (
    (exp.propertyTax || 0) +
    (exp.insurance || 0) +
    (exp.hoa || 0) +
    (exp.maintenance || 0) +
    (exp.utilities || 0) +
    (exp.propertyManagement || 0) +
    (exp.other || 0) +
    (this.mortgagePayment || 0)
  );
});

// Virtual: Net monthly cash flow (for rentals)
realEstateSchema.virtual("netMonthlyCashFlow").get(function () {
  if (!this.isRental) return 0;
  return (this.monthlyRent || 0) - this.totalMonthlyExpenses;
});

// Virtual: Annual cash flow
realEstateSchema.virtual("annualCashFlow").get(function () {
  return this.netMonthlyCashFlow * 12;
});

// Virtual: Equity
realEstateSchema.virtual("equity").get(function () {
  const value = this.currentValue || this.purchasePrice;
  return value - (this.mortgageBalance || 0);
});

// Virtual: Total appreciation
realEstateSchema.virtual("appreciation").get(function () {
  const value = this.currentValue || this.purchasePrice;
  return value - this.purchasePrice;
});

// Virtual: Appreciation percentage
realEstateSchema.virtual("appreciationPercent").get(function () {
  if (this.purchasePrice === 0) return 0;
  const value = this.currentValue || this.purchasePrice;
  return ((value - this.purchasePrice) / this.purchasePrice) * 100;
});

// Virtual: Cap rate (for rentals)
realEstateSchema.virtual("capRate").get(function () {
  if (!this.isRental) return 0;
  const value = this.currentValue || this.purchasePrice;
  if (value === 0) return 0;

  const annualRent = (this.monthlyRent || 0) * 12;
  const annualExpenses = this.totalMonthlyExpenses * 12 - (this.mortgagePayment || 0) * 12; // Exclude mortgage for cap rate
  const noi = annualRent - annualExpenses;

  return (noi / value) * 100;
});

// Virtual: Cash on cash return
realEstateSchema.virtual("cashOnCashReturn").get(function () {
  if (!this.isRental) return 0;
  const downPayment = this.purchasePrice - (this.mortgageBalance || 0);
  if (downPayment === 0) return 0;

  return (this.annualCashFlow / downPayment) * 100;
});

// Virtual: Loan to value ratio
realEstateSchema.virtual("ltvRatio").get(function () {
  const value = this.currentValue || this.purchasePrice;
  if (value === 0) return 0;
  return ((this.mortgageBalance || 0) / value) * 100;
});

// Ensure virtuals are included in JSON
realEstateSchema.set("toJSON", { virtuals: true });
realEstateSchema.set("toObject", { virtuals: true });

// Indexes
realEstateSchema.index({ owner: 1, createdAt: -1 });
realEstateSchema.index({ owner: 1, propertyType: 1 });

const RealEstate = mongoose.model("RealEstate", realEstateSchema);
export default RealEstate;
