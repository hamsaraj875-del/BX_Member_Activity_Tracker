exports.createMember = async (req, res) => {
  try {
    const { name, department, year, bxPosition, socials } = req.body;
    const member = new Member({ name, department, year, bxPosition, socials });
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};