const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// ── GET /api/members ─────────────────────────────────────────────────────────
// Returns all members sorted by engagementPoints descending
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ engagementPoints: -1 }).lean();
    // Remap _id → id for frontend compatibility
    const mapped = members.map(transformMember);
    res.json(mapped);
  } catch (err) {
    console.error("GET /api/members error:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ── GET /api/members/:id ─────────────────────────────────────────────────────
// Returns a single member by their custom memberId string
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findOne({ memberId: req.params.id }).lean();
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(transformMember(member));
  } catch (err) {
    console.error(`GET /api/members/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

// ── POST /api/members ────────────────────────────────────────────────────────
// Creates a new member. Auto-generates memberId if not supplied.
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Auto-generate a memberId like "mem-<timestamp>" if not provided
    if (!data.memberId && !data.id) {
      data.memberId = `mem-${Date.now()}`;
    } else if (!data.memberId && data.id) {
      data.memberId = data.id;
    }

    const member = new Member(data);
    await member.save(); // pre-save hook computes engagementPoints
    res.status(201).json(transformMember(member.toObject()));
  } catch (err) {
    console.error("POST /api/members error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "A member with that email or ID already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /api/members/:id ─────────────────────────────────────────────────────
// Updates any fields of a member (attendance, metrics, status, etc.)
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    // Never allow overwriting the memberId via update
    delete updates.memberId;
    delete updates.id;

    const member = await Member.findOne({ memberId: req.params.id });
    if (!member) return res.status(404).json({ error: "Member not found" });

    // Deep-merge updates into the document
    Object.assign(member, updates);
    // Re-calc engagement points after any update
    member.engagementPoints = Member.calculateEngagementPoints(member);
    await member.save();

    res.json(transformMember(member.toObject()));
  } catch (err) {
    console.error(`PUT /api/members/${req.params.id} error:`, err);
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/members/:id ──────────────────────────────────────────────────
// Soft-deletes by setting status to "Inactive", or hard-deletes if ?hard=true
router.delete("/:id", async (req, res) => {
  try {
    const hard = req.query.hard === "true";
    if (hard) {
      const result = await Member.findOneAndDelete({ memberId: req.params.id });
      if (!result) return res.status(404).json({ error: "Member not found" });
      return res.json({ message: "Member permanently deleted", id: req.params.id });
    }
    // Default: soft-delete (mark inactive)
    const member = await Member.findOneAndUpdate(
      { memberId: req.params.id },
      { status: "Inactive" },
      { new: true }
    );
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(transformMember(member.toObject()));
  } catch (err) {
    console.error(`DELETE /api/members/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// ── PATCH /api/members/:id/attendance ────────────────────────────────────────
// Adds or removes a single event from a member's attendance array
// Body: { eventId: "evt-3", present: true | false }
router.patch("/:id/attendance", async (req, res) => {
  try {
    const { eventId, present } = req.body;
    if (!eventId) return res.status(400).json({ error: "eventId is required" });

    const member = await Member.findOne({ memberId: req.params.id });
    if (!member) return res.status(404).json({ error: "Member not found" });

    if (present && !member.attendance.includes(eventId)) {
      member.attendance.push(eventId);
    } else if (!present) {
      member.attendance = member.attendance.filter((e) => e !== eventId);
    }

    member.engagementPoints = Member.calculateEngagementPoints(member);
    await member.save();
    res.json(transformMember(member.toObject()));
  } catch (err) {
    console.error(`PATCH /api/members/${req.params.id}/attendance error:`, err);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

// ── Helper: normalise Mongoose doc → frontend-compatible object ──────────────
function transformMember(doc) {
  const obj = { ...doc };
  obj.id = obj.memberId; // frontend uses `.id`
  delete obj._id;
  delete obj.__v;
  return obj;
}

module.exports = router;
