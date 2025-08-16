const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const sign = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, deviceToken } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });
    const user = await User.create({ name, email, password, deviceTokens: deviceToken ? [deviceToken] : [] });
    res.status(201).json({ token: sign(user), user: { id: user._id, name, email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password, deviceToken } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    if (deviceToken && !user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
      await user.save();
    }
    res.json({ token: sign(user), user: { id: user._id, name: user.name, email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

