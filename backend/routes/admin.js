const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User       = require('../models/User');
const Chatbot    = require('../models/Chatbot');
const ChatSession = require('../models/ChatSession');

router.use(protect, adminOnly);

// Global stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, chatbots, sessions] = await Promise.all([
      User.countDocuments(),
      Chatbot.countDocuments(),
      ChatSession.countDocuments(),
    ]);
    const tokenUsage = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$usage.totalTokens' } } }
    ]);
    res.json({ success: true, stats: { users, chatbots, sessions, totalTokens: tokenUsage[0]?.total || 0 } });
  } catch (err) { next(err); }
});

// All users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: /search/i }, { email: /search/i }] } : {};
    const users = await User.find(query).sort('-createdAt')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Update user plan
router.patch('/users/:id/plan', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { 'plan.type': req.body.plan }, { new: true });
    user.applyPlanLimits();
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
