const Event = require("../models/Event");

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Organizers and Admins only)
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, capacity, tags, image } =
      req.body;

    const userId = req.user.id;

    let organizerName = "Event Organizer";
    if (req.body.organizerName) {
      organizerName = req.body.organizerName;
    } else if (req.user.firstName && req.user.lastName) {
      organizerName = `${req.user.firstName} ${req.user.lastName}`;
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity: parseInt(capacity, 10),
      tags: tags || [],
      createdBy: userId,
      organizerName,
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.tags) {
      const tags = req.query.tags.split(",");
      query.tags = { $in: tags };
    }

    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    if (req.query.organizer) {
      query.createdBy = req.query.organizer;
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.createdBy.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.createdBy.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot register for past events",
      });
    }

    if (event.participants.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event is at full capacity",
      });
    }

    if (event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    const { specialRequirements, name, email } = req.body;

    event.participants.push({
      userId: req.user.id,
      name:
        name ||
        `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() ||
        "Participant",
      email: email || req.user.email || "No email provided",
      college: req.user.college || "No college",
      specialRequirements: specialRequirements || "",
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for event",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are not registered for this event",
      });
    }

    event.participants = event.participants.filter(
      (participant) => participant.userId.toString() !== req.user.id.toString(),
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isAuthorized =
      event.createdBy.toString() === req.user.id.toString() ||
      req.user.role === "admin" ||
      req.user.role === "organizer" ||
      event.isUserRegistered(req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view participants",
      });
    }

    res.status(200).json({
      success: true,
      count: event.participants.length,
      data: event.participants,
    });
  } catch (error) {
    next(error);
  }
};
