const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Access History Schema
 * Tracks all access attempts for a file with IP, location and result
 */
const accessHistorySchema = new mongoose.Schema({
  ip: {
    type: String,
    default: 'unknown'
  },
  location: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  action: {
    type: String,
    enum: ['upload', 'view', 'download', 'info', 'destroyed'],
    default: 'view'
  },
  accessedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  email: {
    type: String
  },
  notes: {
    type: String
  }
});

/**
 * File Schema
 * Main schema for uploaded files with security features
 */
const FileSchema = new mongoose.Schema({
  // Basic file info
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required'],
    select: true, // Needed for actual file retrieval but not exposed in normal queries
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  type: {
    type: String,
    required: [true, 'File type is required']
  },
  
  // Security features
  encryptionKey: {
    type: String,
    required: true,
    select: false // Never expose in normal queries
  },
  encryptionAlgorithm: {
    type: String,
    default: 'aes-256-cbc',
    select: false
  },
  integrityHash: {
    type: String, // SHA-256 hash of the file content for integrity verification
    select: false
  },
  
  // Access control
  accessCode: {
    type: String,
    unique: true,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiration: 24 hours from now
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  accessCount: {
    type: Number,
    default: 0
  },
  maxAccess: {
    type: Number,
    default: 1, // Default to one-time access
    min: 1,
    max: 100
  },
  
  // Self-destruct options
  selfDestruct: {
    type: Boolean,
    default: true
  },
  destructionReason: {
    type: String,
    enum: ['expiry', 'max_access', 'manual', 'security_breach', null],
    default: null
  },
  destructionDate: {
    type: Date,
    default: null
  },
  
  // Security classification
  classification: {
    type: String,
    enum: ['public', 'confidential', 'secret', 'top-secret'],
    default: 'confidential'
  },
  
  // Authorized access
  authorizedEmails: {
    type: [String],
    validate: {
      validator: function(emails) {
        // Simple email validation for each email in the array
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for(let email of emails) {
          if(!emailRegex.test(email)) {
            return false;
          }
        }
        return true;
      },
      message: 'One or more emails are invalid'
    }
  },
  
  // Blockchain verification (for enhanced security display)
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  blockchainTransactionId: {
    type: String,
    default: null
  },
  blockchainTimestamp: {
    type: Date,
    default: null
  },
  
  // Ownership and access history
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: function() { return this.owner != null; },
    default: function() { return this.owner; }
  },
  accessHistory: [accessHistorySchema],
  lastAccessed: {
    type: Date,
    default: null
  },
  
  // Additional security features
  passwordProtected: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    select: false
  },
  accessRestrictions: {
    ipWhitelist: [String],
    countriesBlocked: [String],
    timeRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: String, // "HH:MM" format
        default: "09:00" 
      },
      endTime: {
        type: String, // "HH:MM" format
        default: "17:00"
      },
      timezone: {
        type: String,
        default: "UTC"
      }
    }
  },
  
  // Alert notifications
  alertOnAccess: {
    type: Boolean,
    default: false
  },
  alertEmails: [String],
  
  // Tracking & tags
  tags: [String],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Generate a secure access code before saving if one doesn't exist
FileSchema.pre('save', async function(next) {
  if (!this.accessCode) {
    // Generate a cryptographically secure random code
    this.accessCode = crypto.randomBytes(12).toString('hex');
  }
  
  // Set createdBy to owner if not set
  if (!this.createdBy) {
    this.createdBy = this.owner;
  }
  
  // Generate file integrity hash if not exists
  if (!this.integrityHash && this.path) {
    try {
      // This would normally calculate a hash of the file content
      // In a production environment, you'd read the file and create a real hash
      this.integrityHash = crypto.createHash('sha256')
        .update(this.path + this.originalName + Date.now())
        .digest('hex');
    } catch (err) {
      console.error('Error generating file integrity hash:', err);
    }
  }
  
  next();
});

// Virtual for remaining access count
FileSchema.virtual('remainingAccess').get(function() {
  return Math.max(0, this.maxAccess - this.accessCount);
});

// Virtual for expiration status
FileSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for secure link
FileSchema.virtual('secureLink').get(function() {
  return `/api/files/access/${this.accessCode}`;
});

// Method to check if file should self-destruct
FileSchema.methods.shouldSelfDestruct = function() {
  if (!this.selfDestruct) return false;
  
  // Check if expired
  if (new Date() > this.expiresAt) return true;
  
  // Check if max access count reached
  if (this.accessCount >= this.maxAccess) return true;
  
  return false;
};

// Method to mark file for destruction
FileSchema.methods.markForDestruction = async function(reason = 'manual') {
  this.destructionReason = reason;
  this.destructionDate = new Date();
  return this.save();
};

// Add text index for search functionality
FileSchema.index({ 
  originalName: 'text', 
  tags: 'text', 
  notes: 'text',
  classification: 'text' 
});

// Add compound index for expiry cleanup jobs
FileSchema.index({ expiresAt: 1, selfDestruct: 1 });

// Add index for owner lookup
FileSchema.index({ owner: 1 });

// Add index for access code lookup
FileSchema.index({ accessCode: 1 });

module.exports = mongoose.model('File', FileSchema);