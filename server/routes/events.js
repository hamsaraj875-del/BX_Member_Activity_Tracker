const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// ── GET /api/events ──────────────────────────────────────────────────────────
// Returns all events sorted by date ascending
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    const mapped = events.map(transformEvent);
    res.json(mapped);
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ── GET /api/events/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id }).lean();
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(transformEvent(event));
  } catch (err) {
    console.error(`GET /api/events/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// ── POST /api/events ─────────────────────────────────────────────────────────
// Creates a new event. Auto-generates eventId if not provided.
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (!data.eventId && !data.id) {
      data.eventId = `evt-${Date.now()}`;
    } else if (!data.eventId && data.id) {
      data.eventId = data.id;
    }

    const event = new Event(data);
    await event.save();
    res.status(201).json(transformEvent(event.toObject()));
  } catch (err) {
    console.error("POST /api/events error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "An event with that ID already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /api/events/:id ──────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    delete updates.eventId;
    delete updates.id;

    const event = await Event.findOneAndUpdate(
      { eventId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(transformEvent(event.toObject()));
  } catch (err) {
    console.error(`PUT /api/events/${req.params.id} error:`, err);
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/events/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const result = await Event.findOneAndDelete({ eventId: req.params.id });
    if (!result) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted", id: req.params.id });
  } catch (err) {
    console.error(`DELETE /api/events/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ── PATCH /api/events/:id/lock ────────────────────────────────────────────────
router.patch("/:id/lock", async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    // Toggle the locked status
    event.locked = !event.locked;
    await event.save();
    
    res.json(transformEvent(event.toObject()));
  } catch (err) {
    console.error(`PATCH /api/events/${req.params.id}/lock error:`, err);
    res.status(500).json({ error: "Failed to toggle lock on event" });
  }
});

// ── Helper ────────────────────────────────────────────────────────────────────
function transformEvent(doc) {
  const obj = { ...doc };
  obj.id = obj.eventId;
  delete obj._id;
  delete obj.__v;
  return obj;
}

module.exports = router;
