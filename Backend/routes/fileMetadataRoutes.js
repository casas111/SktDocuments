// Backend API routes for file handling
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileMetadataController');

// Add the new route for file metadata
router.get('/metadata/:filePath', fileController.getFileMetadata);

// Add the new route for file download
router.get('/download/:filePath', fileController.downloadFile);

// Add direct file serving route
router.get('/serve/:filePath', fileController.serveFile);

module.exports = router;
