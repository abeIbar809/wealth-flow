import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  plaid_account_id: {
    type: String,
    required: false,
    default: null,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
    required: false,
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
  official_name: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    enum: ["checking", "savings", "credit", "investment", "loan", "depository", "brokerage", "other"],
    required: true,
  },
  subtype: {
    type: String,
    default: null,
  },
  mask: {
    type: String,
    default: null,
  },
  balance_available: {
    type: Number,
    default: null,
  },
  balance_current: {
    type: Number,
    default: 0,
  },
  balance_limit: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: "USD",
  },
  institution_name: {
    type: String,
    default: null,
  },
  institution_id: {
    type: String,
    default: null,
  },
  isLinked: {
    type: Boolean,
    default: true,
  },
  is_manual: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.pre("save", function () {
  this.lastUpdated = Date.now();
});

// Virtual for balance (returns current balance, handling credit accounts)
accountSchema.virtual("balance").get(function () {
  // Credit accounts, balance is typically shown as negative
  if (this.type === "credit" || this.type === "loan") {
    return -Math.abs(this.balance_current);
  }
  return this.balance_current;
});

// Virtuals in JSON
accountSchema.set("toJSON", { virtuals: true });
accountSchema.set("toObject", { virtuals: true });

// Sparse unique index on plaid_account_id
accountSchema.index({ plaid_account_id: 1 }, { unique: true, sparse: true });

const Account = mongoose.model("Account", accountSchema);
export default Account;
