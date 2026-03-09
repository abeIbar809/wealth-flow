import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  avgCostPerShare: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  previousClose: {
    type: Number,
    default: 0,
  },
  open: {
    type: Number,
    default: 0,
  },
  high: {
    type: Number,
    default: 0,
  },
  low: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for day change
stockSchema.virtual("dayChange").get(function () {
  return this.currentPrice - this.previousClose;
});

// Virtual for day change percentage
stockSchema.virtual("dayChangePercent").get(function () {
  if (this.previousClose === 0) return 0;
  return ((this.currentPrice - this.previousClose) / this.previousClose) * 100;
});

// Virtual for total value
stockSchema.virtual("totalValue").get(function () {
  return this.shares * this.currentPrice;
});

// Virtual for total cost basis
stockSchema.virtual("totalCost").get(function () {
  return this.shares * this.avgCostPerShare;
});

// Virtual for total gain/loss
stockSchema.virtual("totalGainLoss").get(function () {
  return this.totalValue - this.totalCost;
});

// Virtual for total gain/loss percentage
stockSchema.virtual("totalGainLossPercent").get(function () {
  const totalCost = this.shares * this.avgCostPerShare;
  if (totalCost === 0) return 0;
  return ((this.totalValue - totalCost) / totalCost) * 100;
});

// Have Virtuals be included in JSON
stockSchema.set("toJSON", { virtuals: true });
stockSchema.set("toObject", { virtuals: true });

// Compound index for user's stocks 
stockSchema.index({ owner: 1, symbol: 1 }, { unique: true });
stockSchema.index({ owner: 1, createdAt: -1 });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
