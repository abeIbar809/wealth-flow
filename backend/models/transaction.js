import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  plaid_transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  merchant_name: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  authorized_date: {
    type: Date,
    default: null,
  },
  category: [
    {
      type: String,
    },
  ],
  category_id: {
    type: String,
    default: null,
  },
  personal_finance_category: {
    type: {
      primary: { type: String },
      detailed: { type: String },
    },
    default: null,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  payment_channel: {
    type: String,
    enum: ["online", "in_store", "other"],
    default: "other",
  },
  transaction_type: {
    type: String,
    enum: ["income", "expense", "transfer", "other"],
    default: "expense",
  },
  logo_url: {
    type: String,
    default: null,
  },
  website: {
    type: String,
    default: null,
  },
  currency: {
    type: String,
    default: "USD",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
transactionSchema.index({ owner: 1, date: -1 });
transactionSchema.index({ account: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
