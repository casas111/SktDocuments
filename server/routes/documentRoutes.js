const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const uploadMiddleware = require('../utils/uploadMiddleware');

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get documents in a folder
router.get('/folder/:folderId', documentController.getDocumentsByFolder);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Create new document (with file upload)
router.post('/', uploadMiddleware.single('file'), documentController.createDocument);

// Update document
router.put('/:id', documentController.updateDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Search documents
router.get('/search/:query', documentController.searchDocuments);

// Add label to document
router.post('/:id/labels/:labelId', documentController.addLabelToDocument);

// Remove label from document
router.delete('/:id/labels/:labelId', documentController.removeLabelFromDocument);

// Process document with Claude AI
router.post('/:id/process', documentController.processDocumentWithClaude);

// Extract structured data from document
router.post('/:id/extract-data', documentController.extractStructuredData);

// Generate document summary
router.post('/:id/summarize', documentController.generateDocumentSummary);

module.exports = router;
