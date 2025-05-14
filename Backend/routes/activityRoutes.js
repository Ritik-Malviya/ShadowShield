const express = require('express');
const {
  getActivities,
  getRecentActivities,
  getActivitySummary
} = require('../controllers/activityController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getActivities);

router.get('/recent', getRecentActivities);
router.get('/summary', getActivitySummary);

module.exports = router;