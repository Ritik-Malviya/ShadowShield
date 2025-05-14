const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const SecurityEvent = require('../models/SecurityEvent');
const Activity = require('../models/Activity');

// @desc    Get security logs
// @route   GET /api/security
// @access  Private/Admin
exports.getSecurityEvents = asyncHandler(async (req, res, next) => {
  let query;
  
  // Regular users can only see events related to them
  if (req.user.role === 'admin') {
    query = SecurityEvent.find().populate('user', 'name email');
  } else {
    query = SecurityEvent.find({ user: req.user.id });
  }
  
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await SecurityEvent.countDocuments(query);
  
  // Sort by timestamp descending (newest first)
  query = query.sort('-createdAt').skip(startIndex).limit(limit);
  
  const events = await query;
  
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
  
  // Create activity record
  await Activity.create({
    type: 'security',
    title: 'Security Logs Accessed',
    description: `User viewed security logs`,
    user: req.user.id,
    importance: 'medium'
  });

  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events
  });
});

// @desc    Get security statistics
// @route   GET /api/security/stats
// @access  Private/Admin
exports.getSecurityStats = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access security statistics', 403));
  }
  
  // Get counts for different types of events
  const criticalCount = await SecurityEvent.countDocuments({ type: 'critical' });
  const warningCount = await SecurityEvent.countDocuments({ type: 'warning' });
  const infoCount = await SecurityEvent.countDocuments({ type: 'info' });
  
  // Get most recent critical events
  const recentCritical = await SecurityEvent.find({ type: 'critical' })
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name email');
  
  // Calculate threat level based on critical and warning counts
  let threatLevel = 'low';
  if (criticalCount > 5) {
    threatLevel = 'high';
  } else if (criticalCount > 0 || warningCount > 10) {
    threatLevel = 'medium';
  }
  
  res.status(200).json({
    success: true,
    data: {
      counts: {
        critical: criticalCount,
        warning: warningCount,
        info: infoCount,
        total: criticalCount + warningCount + infoCount
      },
      threatLevel,
      recentCritical
    }
  });
});

// @desc    Generate demo security events
// @route   POST /api/security/generate-demo
// @access  Private/Admin
exports.generateDemoEvents = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to generate demo data', 403));
  }
  
  const eventTypes = ['info', 'warning', 'critical'];
  const messages = [
    'Failed login attempt',
    'Unauthorized file access',
    'Possible brute force attack',
    'Suspicious IP detected',
    'Malware signature detected',
    'Encryption key compromised',
    'Data exfiltration attempt',
    'Unusual file access pattern',
    'Login from unrecognized location',
    'Multiple file deletions'
  ];
  
  const locations = [
    'New York, USA',
    'Moscow, Russia',
    'Beijing, China',
    'Tehran, Iran',
    'Pyongyang, North Korea',
    'Unknown Location'
  ];
  
  const events = [];
  
  // Generate 10 random events
  for (let i = 0; i < 10; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const event = {
      type,
      message,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      aiConfidence: Math.floor(Math.random() * 30) + 70,
      resourceType: Math.random() > 0.5 ? 'file' : 'user'
    };
    
    // For critical events, add mitigation
    if (type === 'critical') {
      event.mitigationApplied = true;
      event.mitigationType = ['block', 'alert', 'self-destruct'][Math.floor(Math.random() * 3)];
    }
    
    events.push(event);
  }
  
  await SecurityEvent.create(events);
  
  // Create activity record
  await Activity.create({
    type: 'security',
    title: 'Demo Data Generated',
    description: `Admin generated ${events.length} demo security events`,
    user: req.user.id,
    importance: 'low'
  });
  
  res.status(201).json({
    success: true,
    count: events.length,
    data: events
  });
});