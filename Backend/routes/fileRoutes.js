const express = require('express');
const fileController = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

console.log('fileController:', fileController);

const router = express.Router();

// Define the route for getting file info by access code
router.get('/access/:code/info', fileController.getFileInfoByCode);

// Your routes
router.post('/', protect, fileController.uploadFile);
router.get('/', protect, fileController.getFiles);
router.get('/access/:code', fileController.accessFileWithCode);
router.get('/access/:code/download', fileController.downloadFileWithCode);
// Add preview route
router.get('/access/:code/preview', fileController.previewFileWithCode);
router.get('/:id', protect, fileController.getFileById);
router.delete('/:id', protect, fileController.deleteFile);
router.put('/:id/regenerate-code', protect, fileController.regenerateAccessCode);
router.put('/:id/security', protect, fileController.updateFileSecurity);
router.post('/verify', fileController.verifyFile);

module.exports = router;