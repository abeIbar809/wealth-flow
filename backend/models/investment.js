import mongoose from "mongoose";

// Investment Types
const INVESTMENT_TYPES = ["stock", "real_estate", "bond", "retirement", "mutual_fund", "crypto", "other"];

const investmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Common fields for investments
  investmentType: {
    type: String,
    enum: INVESTMENT_TYPES,
    required: true,
    default: "stock",
  },
  name: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  purchaseDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  //------- Stock Fields ---------//
  symbol: {
    type: String,
    uppercase: true,
    trim: true,
    default: null,
  },
  shares: {
    type: Number,
    min: 0,
    default: null,
  },
  avgCostPerShare: {
    type: Number,
    min: 0,
    default: null,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  previousClose: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: null,
  },
  
});

const Investment = mongoose.model("Investment", investmentSchema);
export default Investment;
