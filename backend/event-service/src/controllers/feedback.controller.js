const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const QRCode = require("qrcode");


exports.submitFeedback = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const userId = req.user.id;
    const { rating, comments } = req.body;

    const feedback = new Feedback({
      event: event._id,
      userId,
      rating,
      comments,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });

  } catch (err) {

    // ✅ Handle duplicate feedback (unique index error)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback for this event",
      });
    }

    next(err);
  }
};

// Get all feedback for an event (Organizer/Admin only)
exports.getEventFeedback = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    console.log('getEventFeedback called with eventId:', eventId);

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 🔐 Authorization
    if (
      event.createdBy.toString() !== req.user.id &&
      !["admin", "organizer"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view feedback",
      });
    }

    // ✅ FIXED HERE
    const feedbacks = await Feedback.find({ event: eventId })
      .populate("userId", "name email studentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });

  } catch (error) {
    next(error);
  }
};


exports.generateFeedbackQR = async (req, res, next) => {
  try {
    console.log("generateFeedbackQR called with eventId:", req.params.eventId);

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Only organizer or admin can generate QR
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Add redirectTo param so users are sent to login first if needed
    const feedbackUrl = `${process.env.CLIENT_URL}/register?redirectTo=/feedback/${event._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(feedbackUrl);

    res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl,
      url: feedbackUrl, // send full link for reference or copying
    });
  } catch (err) {
    next(err);
  }
};