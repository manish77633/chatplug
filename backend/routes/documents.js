const router = require('express').Router();
const ctrl = require('../controllers/documentController');
const { protect, checkPlanLimit } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/:chatbotId',             ctrl.getDocuments);
router.post('/:chatbotId/upload',     uploadLimiter, checkPlanLimit('documents'), ctrl.uploadMiddleware, ctrl.uploadDocument);
router.delete('/:id',                 ctrl.deleteDocument);
router.get('/doc/:id/status',         ctrl.getDocumentStatus);

module.exports = router;
