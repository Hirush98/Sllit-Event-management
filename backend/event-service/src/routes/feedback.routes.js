const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  submitFeedback,
  getEventFeedback,
  generateFeedbackQR,
} = require("../controllers/feedback.controller");

// Submit feedback (logged-in users only)
router.post("/:eventId", protect, submitFeedback);

// Get all feedback for an event (organizer/admin only)
router.get("/:eventId", protect, getEventFeedback);

// Generate QR for an event (organizer/admin only)
router.get("/qr/:eventId", protect, authorize('organizer'), generateFeedbackQR);

module.exports = router;