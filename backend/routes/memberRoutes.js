const express = require('express');
const Member = require('../models/Member');
router.post('/', createMember);
const router = express.Router();

router.post('/', async (req,res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/', async (req,res) => {
  const members = await Member.find().sort({createdAt: -1});
  res.json(members);
});

module.exports = router;