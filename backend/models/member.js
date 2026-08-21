const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String },
  year: { type: Number },
  bxPosition: { type: String, default: "Member" },
  socials: [ // NEW: array for github, leetcode etc
    {
      platform: { type: String }, // Ex: GitHub
      url: { type: String } // Ex: https://github.com/username
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);