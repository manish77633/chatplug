const router = require('express').Router();
const ctrl = require('../controllers/chatbotController');
const { protect, checkPlanLimit } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(protect, apiLimiter);

router.get('/',    ctrl.getAll);
router.post('/',   checkPlanLimit('chatbots'), ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

// Public - for embed widget
router.get('/public/:embedId', ctrl.getPublicConfig);

module.exports = router;
