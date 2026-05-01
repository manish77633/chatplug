const router = require('express').Router();
const { chat } = require('../controllers/chatController');
const { chatLimiter } = require('../middleware/rateLimiter');

// Public - called from embedded widget on any site
router.post('/:embedId', chatLimiter, chat);

module.exports = router;
