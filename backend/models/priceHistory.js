import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  open: {
    type: Number,
    required: true,
  },
  high: {
    type: Number,
    required: true,
  },
  low: {
    type: Number,
    required: true,
  },
  close: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// unique index to prevent duplicate entries
priceHistorySchema.index({ symbol: 1, date: 1 }, { unique: true });

// index for querying by symbol and date 
priceHistorySchema.index({ symbol: 1, date: -1 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
export default PriceHistory;
