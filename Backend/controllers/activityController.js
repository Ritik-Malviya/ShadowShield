const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Activity = require('../models/Activity');

// @desc    Get user activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = asyncHandler(async (req, res, next) => {
  let query;
  
  // For admins, allow fetching any user's activities
  if (req.user.role === 'admin' && req.query.user) {
    query = Activity.find({ user: req.query.user });
  } else {
    // Regular users only see their own activities
    query = Activity.find({ user: req.user.id });
  }
  
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Activity.countDocuments(query);
  
  // Sort by timestamp descending (newest first)
  query = query.sort('-createdAt').skip(startIndex).limit(limit);
  
  const activities = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: activities.length,
    pagination,
    data: activities
  });
});

// @desc    Get recent activities (dashboard)
// @route   GET /api/activities/recent
// @access  Private
exports.getRecentActivities = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  
  // Get most recent activities for the user
  const activities = await Activity.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(limit);
  
  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

// @desc    Get activity summary by type
// @route   GET /api/activities/summary
// @access  Private
exports.getActivitySummary = asyncHandler(async (req, res, next) => {
  const summary = await Activity.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  res.status(200).json({
    success: true,
    data: summary
  });
});