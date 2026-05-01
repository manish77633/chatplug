const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ChatSession = require('../models/ChatSession');
const Chatbot     = require('../models/Chatbot');

router.use(protect);

// Dashboard overview
router.get('/overview', async (req, res, next) => {
  try {
    const chatbots = await Chatbot.find({ owner: req.user._id }).select('name stats status');
    const totalMessages = chatbots.reduce((a, b) => a + b.stats.totalMessages, 0);
    const totalTokens   = chatbots.reduce((a, b) => a + b.stats.totalTokens,   0);
    res.json({ success: true, overview: { chatbots: chatbots.length, totalMessages, totalTokens, chatbotList: chatbots } });
  } catch (err) { next(err); }
});

// Chat history for a chatbot
router.get('/chatbot/:chatbotId/sessions', async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Not found' });
    const { page = 1, limit = 20 } = req.query;
    const sessions = await ChatSession.find({ chatbot: chatbot._id })
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await ChatSession.countDocuments({ chatbot: chatbot._id });
    res.json({ success: true, sessions, total });
  } catch (err) { next(err); }
});

// Messages in a session
router.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) { next(err); }
});

module.exports = router;
