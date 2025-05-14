const mongoose = require('mongoose');
const crypto = require('crypto');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    select: false // Don't return content by default for security
  },
  encryptionKey: {
    type: String,
    required: true,
    select: false
  },
  readReceipt: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date
    },
    ip: String
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  selfDestruct: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  classification: {
    type: String,
    enum: ['public', 'confidential', 'secret', 'top-secret'],
    default: 'confidential'
  },
  attachments: [{
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    },
    name: String
  }],
  isEncrypted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate encryption key before saving if not present
MessageSchema.pre('save', async function(next) {
  if (!this.encryptionKey) {
    this.encryptionKey = crypto.randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);