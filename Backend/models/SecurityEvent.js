const mongoose = require('mongoose');

const SecurityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ip: {
    type: String
  },
  location: {
    type: String
  },
  userAgent: {
    type: String
  },
  action: {
    type: String
  },
  resource: {
    type: String
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  resourceType: {
    type: String,
    enum: ['file', 'message', 'user', 'system']
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 100
  },
  mitigationApplied: {
    type: Boolean,
    default: false
  },
  mitigationType: {
    type: String,
    enum: ['none', 'block', 'fake-data', 'self-destruct', 'alert']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SecurityEvent', SecurityEventSchema);