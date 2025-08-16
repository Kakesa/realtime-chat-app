const Message = require('../models/messageModel');

exports.history = async (req, res) => {
  try {
    const { groupId, limit = 50, before } = req.query;
    const filter = { group: groupId };
    if (before) filter._id = { $lt: before };
    const messages = await Message.find(filter)
      .sort('-_id')
      .limit(Number(limit))
      .populate('sender', 'name');
    res.json(messages.reverse());
  } catch (e) { res.status(500).json({ error: e.message }); }
};