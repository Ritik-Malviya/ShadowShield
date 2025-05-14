const express = require('express');
const {
  getSecurityEvents,
  getSecurityStats,
  generateDemoEvents
} = require('../controllers/securityController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSecurityEvents);

router.get('/stats', authorize('admin'), getSecurityStats);

router.post('/generate-demo', authorize('admin'), generateDemoEvents);

module.exports = router;