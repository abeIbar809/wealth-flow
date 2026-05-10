import mongoose from "mongoose";

/**
 * Property Value History Model
 * Tracks historical property values for appreciation tracking
 */
const propertyValueHistorySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RealEstate",
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ["manual", "zillow", "redfin", "appraisal", "other"],
    default: "manual",
  },
  notes: {
    type: String,
  },
});

// Indexes
propertyValueHistorySchema.index({ property: 1, date: -1 });

const PropertyValueHistory = mongoose.model("PropertyValueHistory", propertyValueHistorySchema);
export default PropertyValueHistory;
