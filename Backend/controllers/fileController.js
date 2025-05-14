const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const File = require('../models/File');
const Activity = require('../models/Activity');
const SecurityEvent = require('../models/SecurityEvent');
const crypto = require('crypto');
const encryption = require('../utils/encryption');

// @desc    Upload a file
// @route   POST /api/files
// @access  Private
exports.uploadFile = asyncHandler(async (req, res, next) => {
  console.log("Upload request received");
  console.log("Body keys:", Object.keys(req.body));
  console.log("Files:", req.files ? 'Present' : 'Missing');
  
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("No files found in request");
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Access the uploaded file
  const file = req.files.file;
  
  if (!file) {
    console.log("File key not found in req.files. Available keys:", Object.keys(req.files));
    return next(new ErrorResponse('No file found with key "file"', 400));
  }

  console.log("File received:", file.name, file.size, file.mimetype);

  // Make sure the file is a valid type
  if (!file.mimetype) {
    return next(new ErrorResponse('Please upload a valid file', 400));
  }

  // Generate encryption key
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  
  // Generate access code
  const accessCode = crypto.randomBytes(12).toString('hex');
  
  // Preserve original filename for display purposes
  const originalFileName = file.name;
  
  // Create custom filename to prevent conflicts and add security
  const fileExt = path.parse(file.name).ext;
  const secureFileName = `file_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${fileExt}`;
  
  // Update file name for storage
  file.name = secureFileName;

  // Create uploads directory if it doesn't exist
  const uploadPath = path.resolve(process.env.FILE_UPLOAD_PATH || path.join(__dirname, '..', 'public', 'uploads'));
  console.log(`Resolved upload path: ${uploadPath}`);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Created upload directory: ${uploadPath}`);
  }

  // Create user-specific directory for better organization
  const userDir = path.join(uploadPath, req.user.id.toString());
  console.log(`User directory: ${userDir}`);

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    console.log(`Created user directory: ${userDir}`);
  }

  const filePath = path.join(userDir, file.name);
  console.log(`Complete file path: ${filePath}`);

  // Original path (temporary)
  const tempFilePath = `${userDir}/temp_${file.name}`;
  const encryptedFilePath = filePath; // Your original file path

  // Move file to temp path first
  file.mv(tempFilePath, async err => {
    if (err) {
      console.error("File move error:", err);
      return next(new ErrorResponse(`Problem with file upload: ${err.message}`, 500));
    }

    try {
      console.log("File moved to temp location successfully");
      
      // Generate secure encryption key
      const encryptionKey = encryption.generateEncryptionKey();
      
      // Encrypt the file
      console.log("Encrypting file...");
      await encryption.encryptFile(tempFilePath, encryptedFilePath, encryptionKey);
      console.log("File encrypted successfully");
      
      // Delete the temporary file
      fs.unlinkSync(tempFilePath);
      console.log("Temporary file deleted");

      // Continue with the rest of your function
      console.log("Parsing security settings...");
      
      // Parse security settings from request
      const selfDestruct = req.body.selfDestruct === 'true';
      const maxAccess = parseInt(req.body.maxAccess) || 1;
      const classification = req.body.classification || 'confidential';
      
      // Parse expiration date or set default (24 hours)
      let expiresAt;
      if (req.body.expiresAt) {
        // Try to parse the provided date
        expiresAt = new Date(req.body.expiresAt);
        // Validate the date is in the future
        if (isNaN(expiresAt) || expiresAt <= new Date()) {
          expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 24 hours
        }
      } else {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 24 hours
      }
      
      // Parse authorized emails if provided
      let authorizedEmails = [];
      if (req.body.authorizedEmails) {
        authorizedEmails = req.body.authorizedEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
      }

      console.log("Creating file record in database...");
      
      // Create file record in database
      const uploadedFile = await File.create({
        name: file.name,
        originalName: originalFileName,
        path: filePath,
        size: file.size,
        type: file.mimetype,
        encryptionKey, // Store the encryption key
        encryptionAlgorithm: 'aes-256-cbc',
        accessCode,
        expiresAt,
        maxAccess,
        selfDestruct,
        classification,
        authorizedEmails,
        owner: req.user.id,
        createdBy: req.user.id, // Make sure this is set
        accessHistory: [{
          ip: req.ip,
          location: req.headers['x-forwarded-for'] || 'Unknown',
          timestamp: Date.now(),
          success: true,
          action: 'upload'
        }]
      });

      console.log("File record created:", uploadedFile._id);

      // Create activity record
      await Activity.create({
        type: 'upload',
        title: 'File Uploaded',
        description: `User uploaded file: ${originalFileName}`,
        user: req.user.id,
        resource: uploadedFile._id,
        resourceModel: 'File',
        importance: classification === 'top-secret' ? 'high' : 'medium',
        metadata: {
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          selfDestruct,
          maxAccess,
          expiresAt
        }
      });

      // Log security event
      await SecurityEvent.create({
        type: 'info',
        message: `File uploaded: ${originalFileName}`,
        user: req.user.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        resourceType: 'file',
        resourceId: uploadedFile._id,
        aiConfidence: 100
      });

      res.status(201).json({
        success: true,
        data: {
          _id: uploadedFile._id,
          name: uploadedFile.name,
          originalName: uploadedFile.originalName,
          size: uploadedFile.size,
          type: uploadedFile.type,
          accessCode: uploadedFile.accessCode,
          expiresAt: uploadedFile.expiresAt,
          classification: uploadedFile.classification,
          selfDestruct: uploadedFile.selfDestruct,
          maxAccess: uploadedFile.maxAccess,
          encryptionKey: uploadedFile.encryptionKey, // Add this line to expose the key
          encryptionAlgorithm: uploadedFile.encryptionAlgorithm // Optional: include algorithm info
        }
      });
    } catch (error) {
      console.error("Error during file upload processing:", error);
      
      // If database operation fails, clean up the uploaded file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up file after error: ${filePath}`);
        } catch (unlinkErr) {
          console.error(`Error cleaning up file: ${unlinkErr.message}`);
        }
      }
      
      // Re-throw to be caught by the error handler
      next(error);
    }
  });
});

// @desc    Get all files for a user
// @route   GET /api/files
// @access  Private
exports.getFiles = asyncHandler(async (req, res, next) => {
  let query;

  // For admins, get all files or filter by owner
  if (req.user.role === 'admin') {
    if (req.query.user) {
      query = File.find({ owner: req.query.user });
    } else {
      query = File.find();
    }
  } else {
    // For regular users, only get files they own
    query = File.find({ owner: req.user.id });
  }

  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await File.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Add sorting options
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort by newest
  }

  // Create activity record
  await Activity.create({
    type: 'access',
    title: 'Files Accessed',
    description: `User viewed their file list`,
    user: req.user.id,
    importance: 'low'
  });

  const files = await query;

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
    count: files.length,
    pagination,
    data: files
  });
});

// @desc    Get a single file
// @route   GET /api/files/:id
// @access  Private
exports.getFile = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is file owner or admin
  if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    // Check if user's email is in the authorized list
    const isAuthorized = file.authorizedEmails && 
                          file.authorizedEmails.includes(req.user.email);
    
    if (!isAuthorized) {
      // Log security event for unauthorized access attempt
      await SecurityEvent.create({
        type: 'warning',
        message: `Unauthorized file access attempt: ${file.originalName}`,
        user: req.user.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        resourceType: 'file',
        resourceId: file._id,
        aiConfidence: 95
      });

      return next(new ErrorResponse('Not authorized to access this file', 401));
    }
  }

  // Create a temporary decrypted file path
  const tempDecryptedFilePath = `${path.dirname(file.path)}/temp_decrypted_${Date.now()}_${file.originalName}`;
  
  try {
    // Get the file with encryption key
    const fileWithKey = await File.findById(req.params.id).select('+encryptionKey');
    
    if (!fileWithKey || !fileWithKey.encryptionKey) {
      return next(new ErrorResponse('File encryption information not found', 500));
    }
    
    // Decrypt the file
    console.log("Decrypting file...");
    await encryption.decryptFile(file.path, tempDecryptedFilePath, fileWithKey.encryptionKey);
    console.log("File decrypted successfully");
    
    // Set content disposition to force file download with the original filename
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    console.log("Sending decrypted file for download:", tempDecryptedFilePath);
    
    // Send the decrypted file as download attachment
    res.download(tempDecryptedFilePath, file.originalName, async (err) => {
      // Clean up the temporary decrypted file
      if (fs.existsSync(tempDecryptedFilePath)) {
        fs.unlinkSync(tempDecryptedFilePath);
        console.log("Temporary decrypted file deleted");
      }
      
      if (err) {
        console.error("Download error:", err);
        return next(new ErrorResponse('Error downloading file', 500));
      }
      
      console.log("File downloaded successfully");
      
      // Update access history
      file.accessHistory.push({
        ip: req.ip,
        location: req.headers['x-forwarded-for'] || 'Unknown',
        timestamp: Date.now(),
        success: true,
        action: 'download'
      });
      
      // Update last accessed
      file.lastAccessed = Date.now();
      
      await file.save();
    });
  } catch (decryptErr) {
    console.error("Decryption error:", decryptErr);
    
    // Clean up the temporary file if it exists
    if (fs.existsSync(tempDecryptedFilePath)) {
      fs.unlinkSync(tempDecryptedFilePath);
    }
    
    return next(new ErrorResponse('Error decrypting file. It may be corrupted.', 500));
  }
});

// @desc    Get file info by access code (without downloading)
// @route   GET /api/files/access/:code/info
// @access  Public
exports.getFileInfoByCode = asyncHandler(async (req, res, next) => {
  console.log("Getting file info by code:", req.params.code);
  
  const { code } = req.params;

  // Find the file by access code
  const file = await File.findOne({ accessCode: code });
  
  console.log("File found:", file ? "yes" : "no");

  if (!file) {
    // Log security event for invalid access code
    await SecurityEvent.create({
      type: 'warning',
      message: `Invalid access code attempt: ${code}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      aiConfidence: 85
    });

    return next(new ErrorResponse('Invalid access code', 404));
  }

  // Check if file has expired
  if (file.expiresAt < new Date()) {
    // Log security event for expired file access
    await SecurityEvent.create({
      type: 'info',
      message: `Attempt to access expired file: ${file.originalName}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      resourceId: file._id,
      aiConfidence: 90
    });

    return next(new ErrorResponse('This access code has expired', 410));
  }

  // Check if maximum access count has been reached
  if (file.accessCount >= file.maxAccess) {
    // Log security event for max access exceeded
    await SecurityEvent.create({
      type: 'info',
      message: `Access limit reached for file: ${file.originalName}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      resourceId: file._id,
      aiConfidence: 90
    });

    return next(new ErrorResponse('Maximum access count reached for this file', 410));
  }

  // Update access history for the info check
  file.accessHistory.push({
    ip: req.ip,
    location: req.headers['x-forwarded-for'] || 'Unknown',
    timestamp: Date.now(),
    success: true,
    action: 'info'
  });
  
  await file.save();

  // Determine if this file requires a key (e.g., for top-secret classification)
  const requiresKey = file.classification === 'top-secret';

  // Return basic file info without incrementing access count yet
  res.status(200).json({
    success: true,
    data: {
      originalName: file.originalName,
      size: file.size,
      type: file.type,
      expiresAt: file.expiresAt,
      selfDestruct: file.selfDestruct,
      classification: file.classification,
      maxAccess: file.maxAccess,
      accessCount: file.accessCount,
      requiresKey: file.classification === 'top-secret', // Explicitly set based on classification
      requiresKeyMessage: file.classification === 'top-secret' 
        ? 'This top-secret file requires an encryption key to download' 
        : null
    }
  });
});

// @desc    Access file with one-time code
// @route   GET /api/files/access/:code
// @access  Public
exports.accessFileWithCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;
  const { key } = req.query; // decryption key

  console.log(`File access requested with code: ${code} and key: ${key}`);
  
  const file = await File.findOne({ accessCode: code });
  if (!file) {
    console.log(`File not found with access code: ${code}`);
    return next(new ErrorResponse(`File not found with access code ${code}`, 404));
  }
  
  // (Optionally) verify decryption key before sending the file.
  
  // Set headers and send file data.
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.send(file.data); // Adjust according to how you store/send file data.
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is file owner or admin
  if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    // Log security event for unauthorized deletion attempt
    await SecurityEvent.create({
      type: 'critical',
      message: `Unauthorized file deletion attempt: ${file.originalName}`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      resourceId: file._id,
      aiConfidence: 95
    });

    return next(new ErrorResponse('Not authorized to delete this file', 401));
  }

  // Delete the file from the filesystem and database
  await handleFileDestruction(file, 'Manual deletion by user', req.user.id);

  // Create activity record
  await Activity.create({
    type: 'destruction',
    title: 'File Deleted',
    description: `User deleted file: ${file.originalName}`,
    user: req.user.id,
    importance: 'medium'
  });

  // Log security event
  await SecurityEvent.create({
    type: 'info',
    message: `File deleted: ${file.originalName}`,
    user: req.user.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    resourceType: 'file',
    aiConfidence: 100
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Regenerate access code for a file
// @route   PUT /api/files/:id/regenerate-code
// @access  Private
exports.regenerateAccessCode = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is file owner or admin
  if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    // Log security event for unauthorized access
    await SecurityEvent.create({
      type: 'warning',
      message: `Unauthorized attempt to regenerate access code: ${file.originalName}`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      resourceId: file._id,
      aiConfidence: 95
    });

    return next(new ErrorResponse('Not authorized to modify this file', 401));
  }

  // Generate new access code
  const newAccessCode = crypto.randomBytes(12).toString('hex');
  file.accessCode = newAccessCode;
  
  // Reset access count for new code
  file.accessCount = 0;
  
  // Update expiration date if requested
  if (req.body.expiresAt) {
    file.expiresAt = new Date(req.body.expiresAt);
  }
  
  // Update max access if requested
  if (req.body.maxAccess) {
    file.maxAccess = parseInt(req.body.maxAccess);
  }

  // Update authorized emails if provided
  if (req.body.authorizedEmails) {
    file.authorizedEmails = req.body.authorizedEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  // Save changes
  await file.save();

  // Create activity record
  await Activity.create({
    type: 'security',
    title: 'Access Code Regenerated',
    description: `User regenerated access code for file: ${file.originalName}`,
    user: req.user.id,
    resource: file._id,
    resourceModel: 'File',
    importance: 'medium'
  });

  // Log security event
  await SecurityEvent.create({
    type: 'info',
    message: `Access code regenerated for file: ${file.originalName}`,
    user: req.user.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    resourceType: 'file',
    resourceId: file._id,
    aiConfidence: 100
  });

  res.status(200).json({
    success: true,
    data: {
      accessCode: file.accessCode,
      expiresAt: file.expiresAt,
      maxAccess: file.maxAccess
    }
  });
});

// @desc    Update file security settings
// @route   PUT /api/files/:id/security
// @access  Private
exports.updateFileSecurity = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return next(new ErrorResponse(`File not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is file owner or admin
  if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    // Log security event for unauthorized access
    await SecurityEvent.create({
      type: 'warning',
      message: `Unauthorized attempt to update file security: ${file.originalName}`,
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'file',
      resourceId: file._id,
      aiConfidence: 95
    });

    return next(new ErrorResponse('Not authorized to modify this file', 401));
  }

  // Update security settings
  if (req.body.selfDestruct !== undefined) {
    file.selfDestruct = req.body.selfDestruct === 'true' || req.body.selfDestruct === true;
  }
  
  if (req.body.expiresAt) {
    file.expiresAt = new Date(req.body.expiresAt);
  }
  
  if (req.body.maxAccess) {
    file.maxAccess = parseInt(req.body.maxAccess);
  }
  
  if (req.body.classification) {
    file.classification = req.body.classification;
  }
  
  if (req.body.authorizedEmails) {
    file.authorizedEmails = req.body.authorizedEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  // Save changes
  await file.save();

  // Create activity record
  await Activity.create({
    type: 'security',
    title: 'File Security Updated',
    description: `User updated security settings for file: ${file.originalName}`,
    user: req.user.id,
    resource: file._id,
    resourceModel: 'File',
    importance: 'medium',
    metadata: {
      selfDestruct: file.selfDestruct,
      expiresAt: file.expiresAt,
      maxAccess: file.maxAccess,
      classification: file.classification
    }
  });

  // Log security event
  await SecurityEvent.create({
    type: 'info',
    message: `Security settings updated for file: ${file.originalName}`,
    user: req.user.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    resourceType: 'file',
    resourceId: file._id,
    aiConfidence: 100
  });

  res.status(200).json({
    success: true,
    data: {
      selfDestruct: file.selfDestruct,
      expiresAt: file.expiresAt,
      maxAccess: file.maxAccess,
      classification: file.classification,
      authorizedEmails: file.authorizedEmails
    }
  });
});

// Add this function to your controller
// @desc    Verify a file's integrity using encryption key
// @route   POST /api/files/verify
// @access  Public
exports.verifyFile = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a file to verify', 400));
  }

  if (!req.body.encryptionKey) {
    return next(new ErrorResponse('Encryption key is required', 400));
  }

  const file = req.files.file;
  const encryptionKey = req.body.encryptionKey;
  
  // Optional: Check against a specific file ID if provided
  let originalFile;
  if (req.body.fileId) {
    originalFile = await File.findById(req.body.fileId).select('+encryptionKey');
    if (!originalFile) {
      return next(new ErrorResponse('Original file not found', 404));
    }
  }

  try {
    // Create temp files for verification
    const uploadPath = path.resolve(process.env.FILE_UPLOAD_PATH || path.join(__dirname, '..', 'public', 'uploads'));
    const tempDir = path.join(uploadPath, 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `verify_${Date.now()}_${file.name}`);
    const tempDecryptedPath = path.join(tempDir, `decrypt_${Date.now()}_${file.name}`);
    
    // Move uploaded file to temp location
    await file.mv(tempFilePath);
    
    try {
      // Try to decrypt the file with provided key
      await encryption.decryptFile(tempFilePath, tempDecryptedPath, encryptionKey);
      
      let verificationResult = {
        success: true,
        message: 'File decrypted successfully',
        originalMatch: false
      };
      
      // If we have the original file, compare content hashes
      if (originalFile) {
        // Get original decrypted content for comparison
        const originalDecryptedPath = path.join(tempDir, `original_${Date.now()}_${originalFile.originalName}`);
        await encryption.decryptFile(originalFile.path, originalDecryptedPath, originalFile.encryptionKey);
        
        // Compare file hashes
        const fileHash1 = crypto.createHash('sha256').update(fs.readFileSync(tempDecryptedPath)).digest('hex');
        const fileHash2 = crypto.createHash('sha256').update(fs.readFileSync(originalDecryptedPath)).digest('hex');
        
        verificationResult.originalMatch = fileHash1 === fileHash2;
        
        // Clean up original decrypted file
        if (fs.existsSync(originalDecryptedPath)) {
          fs.unlinkSync(originalDecryptedPath);
        }
      }
      
      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (fs.existsSync(tempDecryptedPath)) {
        fs.unlinkSync(tempDecryptedPath);
      }
      
      // Return verification result
      return res.status(200).json({
        success: true,
        data: verificationResult
      });
    } catch (error) {
      // Decryption failed - wrong key or corrupted file
      console.error("Verification error:", error);
      
      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (fs.existsSync(tempDecryptedPath) && fs.existsSync(tempDecryptedPath)) {
        fs.unlinkSync(tempDecryptedPath);
      }
      
      return res.status(400).json({
        success: false,
        error: 'File verification failed. The encryption key may be incorrect or the file is corrupted.'
      });
    }
  } catch (error) {
    console.error("Verification process error:", error);
    return next(new ErrorResponse('Error during file verification process', 500));
  }
});

// Helper function to handle file destruction
async function handleFileDestruction(file, reason, userId = null) {
  // Delete the file from filesystem
  if (fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
      console.log(`File ${file.originalName} has been deleted from filesystem`);
    } catch (err) {
      console.error(`Error deleting file from filesystem: ${err.message}`);
    }
  }
  
  // Create destruction record
  await Activity.create({
    type: 'destruction',
    title: 'File Destroyed',
    description: `File destroyed: ${file.originalName}`,
    user: userId || file.owner,
    resource: file._id,
    resourceModel: 'File',
    importance: 'high',
    metadata: {
      reason,
      originalName: file.originalName,
      classification: file.classification
    }
  });
  
  // Delete database record
  await File.findByIdAndDelete(file._id);
  
  return true;
}
// In fileController.js
exports.getFileById = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.id);
  
  if (!file) {
    return next(new ErrorResponse(`File not found with id ${req.params.id}`, 404));
  }
  
  // Check if user has permission to access this file
  if (file.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this file', 403));
  }
  
  res.status(200).json({
    success: true,
    data: file
  });
});

// In fileController.js
exports.getFileInfoByCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;
  
  const file = await File.findOne({ accessCode: code });
  
  if (!file) {
    return next(new ErrorResponse(`File not found with access code ${code}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: file
  });
});

// Get file info by access code
exports.getFileInfoByCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  console.log(`Looking for file with access code: ${code}`);

  const file = await File.findOne({ accessCode: code });

  if (!file) {
    console.log(`File not found with access code: ${code}`);
    return next(new ErrorResponse(`File not found with access code ${code}`, 404));
  }

  console.log(`File found: ${file.originalName}`);

  res.status(200).json({
    success: true,
    data: file
  });
});

// @desc    Download file using access code
// @route   GET /api/files/access/:code/download
// @access  Public
exports.downloadFileWithCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  console.log(`File download requested with access code: ${code}`);

  // Find the file by access code
  const file = await File.findOne({ accessCode: code });

  if (!file) {
    console.log(`File not found with access code: ${code}`);
    return next(new ErrorResponse(`File not found with access code ${code}`, 404));
  }

  // Check if the file exists on the server
  const filePath = file.path || path.join(__dirname, '..', 'uploads', file._id.toString());
  if (!fs.existsSync(filePath)) {
    console.error(`File not found on disk: ${filePath}`);
    return next(new ErrorResponse('File not found on server', 404));
  }

  // Set headers for file download
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');

  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// @desc    Preview file using access code (if previewable)
// @route   GET /api/files/access/:code/preview
// @access  Public
exports.previewFileWithCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;
  const { key } = req.query; // decryption key if needed

  console.log(`File preview requested with access code: ${code}`);

  // Find the file by access code
  const file = await File.findOne({ accessCode: code });

  if (!file) {
    console.log(`File not found with access code: ${code}`);
    return next(new ErrorResponse(`File not found with access code ${code}`, 404));
  }

  // Check if file is previewable based on mime type
  const previewableMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg'
  ];

  const fileType = file.type || file.mimeType;
  const isPreviewable = previewableMimeTypes.includes(fileType);
  
  if (!isPreviewable) {
    return next(new ErrorResponse('This file type cannot be previewed in browser', 400));
  }

  // Check if the file exists on the server
  if (!fs.existsSync(file.path)) {
    console.error(`File not found on disk: ${file.path}`);
    return next(new ErrorResponse('File not found on server', 404));
  }

  try {
    // For simple preview without decryption (if files are not encrypted)
    if (!file.isEncrypted) {
      console.log("File is not encrypted, serving directly:", file.path);
      
      // Set content type for inline viewing
      res.setHeader('Content-Type', fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      
      // Stream the file to the client
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
      
      // Update access history
      file.lastAccessed = Date.now();
      await file.save();
      
      return;
    }
    
    // For encrypted files that need decryption
    console.log("File is encrypted, creating temporary decrypted version for preview");
    
    // Create a temporary directory for the decrypted file if it doesn't exist
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a unique temporary file path
    const tempFileName = `preview_${Date.now()}_${path.basename(file.path)}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    console.log(`Decrypting file to temporary path: ${tempFilePath}`);
    
    // Decrypt the file using the encryption utility
    await encryption.decryptFile(file.path, tempFilePath, key || file.encryptionKey);
    
    // Set content type for inline viewing
    res.setHeader('Content-Type', fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    
    // Stream the decrypted file to the client
    const fileStream = fs.createReadStream(tempFilePath);
    
    // Clean up the temporary file after streaming
    fileStream.on('end', () => {
      console.log(`Cleaning up temporary file: ${tempFilePath}`);
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error(`Error deleting temporary file: ${err}`);
        else console.log(`Temporary file deleted: ${tempFilePath}`);
      });
    });
    
    fileStream.on('error', (err) => {
      console.error(`Error streaming file: ${err}`);
      // Try to clean up the temp file if there's an error
      if (fs.existsSync(tempFilePath)) {
        fs.unlink(tempFilePath, () => {});
      }
    });
    
    fileStream.pipe(res);
    
    // Update access history
    file.lastAccessed = Date.now();
    await file.save();
    
  } catch (err) {
    console.error(`Error previewing file: ${err.message}`, err);
    return next(new ErrorResponse(`Error previewing file: ${err.message}`, 500));
  }
});