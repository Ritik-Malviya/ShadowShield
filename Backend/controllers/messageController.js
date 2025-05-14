const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Message = require('../models/Message');
const User = require('../models/User');
const Activity = require('../models/Activity');
const SecurityEvent = require('../models/SecurityEvent');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { recipients, subject, content, classification, selfDestruct, priority } = req.body;

  // Validate recipients
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return next(new ErrorResponse('Please include at least one recipient', 400));
  }

  // Check if recipients exist
  const recipientUsers = await User.find({ _id: { $in: recipients } });
  if (recipientUsers.length !== recipients.length) {
    return next(new ErrorResponse('One or more recipients do not exist', 404));
  }

  // Create the message
  const message = await Message.create({
    sender: req.user.id,
    recipients,
    subject,
    content,
    classification: classification || 'confidential',
    selfDestruct: selfDestruct === 'true',
    priority: priority || 'medium'
  });

  // Create activity record
  await Activity.create({
    type: 'security',
    title: 'Message Sent',
    description: `User sent a new message: ${subject}`,
    user: req.user.id,
    resource: message._id,
    resourceModel: 'Message',
    importance: classification === 'top-secret' ? 'high' : 'medium'
  });

  // Log security event for high classification messages
  if (classification === 'secret' || classification === 'top-secret') {
    await SecurityEvent.create({
      type: 'info',
      message: `High classification message sent: ${subject}`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'message',
      resourceId: message._id,
      aiConfidence: 100
    });
  }

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get all messages for a user
// @route   GET /api/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { type = 'inbox' } = req.query;
  let query;

  if (type === 'inbox') {
    // Get messages where the user is a recipient
    query = Message.find({ recipients: req.user.id })
      .populate('sender', 'name email')
      .sort('-createdAt');
  } else if (type === 'sent') {
    // Get messages sent by the user
    query = Message.find({ sender: req.user.id })
      .populate('recipients', 'name email')
      .sort('-createdAt');
  } else {
    return next(new ErrorResponse(`Invalid message type: ${type}`, 400));
  }

  const messages = await query;

  // Create activity record
  await Activity.create({
    type: 'access',
    title: 'Messages Accessed',
    description: `User viewed their ${type} messages`,
    user: req.user.id,
    importance: 'low'
  });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Get a single message
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'name email')
    .populate('recipients', 'name email')
    .select('+content');

  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  // Check if user is allowed to read this message
  const isRecipient = message.recipients.some(r => r._id.toString() === req.user.id);
  const isSender = message.sender._id.toString() === req.user.id;

  if (!isRecipient && !isSender && req.user.role !== 'admin') {
    // Log security event for unauthorized message access
    await SecurityEvent.create({
      type: 'warning',
      message: `Unauthorized message access attempt`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'message',
      resourceId: message._id,
      aiConfidence: 95
    });

    return next(new ErrorResponse('Not authorized to access this message', 401));
  }

  // If user is a recipient, update read receipt
  if (isRecipient) {
    // Check if user has already read the message
    const hasRead = message.readReceipt.some(r => r.user.toString() === req.user.id);
    
    if (!hasRead) {
      message.readReceipt.push({
        user: req.user.id,
        readAt: Date.now(),
        ip: req.ip
      });
      
      await message.save();

      // Create activity record
      await Activity.create({
        type: 'access',
        title: 'Message Read',
        description: `User read message from ${message.sender.name}`,
        user: req.user.id,
        resource: message._id,
        resourceModel: 'Message',
        importance: message.classification === 'top-secret' ? 'high' : 'low'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  // Check if user is allowed to delete this message
  const isRecipient = message.recipients.includes(req.user.id);
  const isSender = message.sender.toString() === req.user.id;

  if (!isRecipient && !isSender && req.user.role !== 'admin') {
    // Log security event for unauthorized deletion attempt
    await SecurityEvent.create({
      type: 'warning',
      message: `Unauthorized message deletion attempt`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'message',
      resourceId: message._id,
      aiConfidence: 95
    });

    return next(new ErrorResponse('Not authorized to delete this message', 401));
  }

  await message.remove();

  // Create activity record
  await Activity.create({
    type: 'destruction',
    title: 'Message Deleted',
    description: `User deleted a message`,
    user: req.user.id,
    importance: 'low'
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});