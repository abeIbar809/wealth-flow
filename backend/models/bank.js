import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  institution_id: {
    type: String,
    required: true,
  },
  institution_name: {
    type: String,
    required: true,
  },
  plaid_access_token: {
    type: String,
    required: true,
  },
  plaid_item_id: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cursor: {
    type: String,
    default: null,
  },
  lastSynced: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'error', 'pending_reauth'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bankSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const Bank = mongoose.model("Bank", bankSchema);
export default Bank;
