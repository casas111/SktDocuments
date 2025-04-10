/**
 * File Routes
 * Defines API endpoints for file and folder operations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
    files: 10 // Maximum 10 files per upload
  }
});

// GET /api/files - Get directory contents
router.get('/', fileController.getDirectoryContents);

// POST /api/files/folder - Create a new folder
router.post('/folder', fileController.createFolder);

// POST /api/files/upload - Upload files
router.post('/upload', upload.array('files'), fileController.uploadFiles);

// GET /api/files/download/:filePath - Download a file
router.get('/download/:filePath', fileController.downloadFile);

// POST /api/files/download-multiple - Download multiple files as zip
router.post('/download-multiple', fileController.downloadMultipleFiles);

// PUT /api/files/rename - Rename a file or folder
router.put('/rename', fileController.rename);

// PUT /api/files/move - Move a file or folder
router.put('/move', fileController.move);

// DELETE /api/files/:path - Delete a file or folder
router.delete('/:path', fileController.delete);

// GET /api/files/metadata/:path - Get file or folder metadata
router.get('/metadata/:path', fileController.getMetadata);

// GET /api/files/preview/:filePath - Preview a file
router.get('/preview/:filePath', fileController.previewFile);

module.exports = router;
