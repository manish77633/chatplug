const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

exports.checkPlanLimit = (resource) => async (req, res, next) => {
  const user = req.user;
  const limits = {
    chatbots:  user.limits.maxChatbots,
    documents: user.limits.maxDocuments,
    tokens:    user.limits.maxTokens,
  };
  const usage = {
    chatbots:  user.usage.totalDocuments,
    documents: user.usage.totalDocuments,
    tokens:    user.usage.currentMonth.tokens,
  };
  if (usage[resource] >= limits[resource]) {
    return res.status(403).json({
      success: false,
      message: `Plan limit reached for ${resource}. Please upgrade.`,
    });
  }
  next();
};
