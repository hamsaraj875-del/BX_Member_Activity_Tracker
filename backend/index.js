const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // to read.env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB Connected to bx_analytics"))
.catch(err => console.error("❌ MongoDB Error:", err));

// Import Model
const Member = require('./models/Member');

// ROUTES

// GET all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new member
app.post('/api/members', async (req, res) => {
  try {
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));