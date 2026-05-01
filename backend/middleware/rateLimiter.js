const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false,
    message: { success: false, message } });

exports.authLimiter   = make(15 * 60 * 1000, 10,  'Too many auth attempts. Try again in 15 minutes.');
exports.chatLimiter   = make(60 * 1000,       60,  'Chat rate limit exceeded. Max 60 messages/min.');
exports.uploadLimiter = make(60 * 60 * 1000,  20,  'Upload limit exceeded. Max 20 uploads/hour.');
exports.apiLimiter    = make(60 * 1000,        100, 'API rate limit exceeded.');
