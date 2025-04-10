const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

// Upload document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Download document by ID
router.get('/download/:id', documentController.downloadDocument);

// Delete document by ID
router.delete('/:id', documentController.deleteDocument);

// Get documents by folder
router.get('/folder/:folderId', documentController.getDocumentsByFolder);

// Move document to folder
router.put('/:id/move/:folderId', documentController.moveDocumentToFolder);

// Get all folders
router.get('/folders/all', documentController.getAllFolders);

// Create folder
router.post('/folders', documentController.createFolder);

// Delete folder
router.delete('/folders/:id', documentController.deleteFolder);

// Get all tags
router.get('/tags/all', documentController.getAllTags);

// Create tag
router.post('/tags', documentController.createTag);

// Add tag to document
router.put('/:id/tag/:tagId', documentController.addTagToDocument);

// Remove tag from document
router.delete('/:id/tag/:tagId', documentController.removeTagFromDocument);

// Toggle document starred status
router.put('/:id/star', documentController.toggleDocumentStarred);

module.exports = router;
