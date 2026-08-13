const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    // Custom string ID (e.g. "evt-1") — used by the frontend
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" string to match the frontend format
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Workshop", "Contest", "Hackathon", "Meeting"],
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
