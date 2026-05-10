import express from "express";
import realEstateController from "../controllers/realEstate.js";

const router = express.Router();

// Get all properties for a user
router.get("/:userId", realEstateController.getProperties);

// Get portfolio analytics
router.get("/:userId/analytics", realEstateController.getPortfolioAnalytics);

// Add a new property
router.post("/", realEstateController.addProperty);

// Update a property
router.put("/:propertyId", realEstateController.updateProperty);

// Delete a property
router.delete("/:propertyId", realEstateController.deleteProperty);

// Get property value history
router.get("/:propertyId/history", realEstateController.getValueHistory);

// Add value history entry
router.post("/:propertyId/history", realEstateController.addValueHistory);

export default router;
