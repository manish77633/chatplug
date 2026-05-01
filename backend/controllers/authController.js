const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    user.applyPlanLimits();
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, plan: user.plan, role: user.role } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, plan: user.plan, role: user.role } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
