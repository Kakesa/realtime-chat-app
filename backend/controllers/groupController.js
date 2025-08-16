const Group = require('../models/groupModel');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body; // members: [userId...]
    const group = await Group.create({ name, members });
    res.status(201).json(group);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.myGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).sort('-updatedAt');
    res.json(groups);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    res.json(group);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
