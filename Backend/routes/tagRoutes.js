const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Get all tags
router.get('/', tagController.getAllTags);

// Get tag by ID
router.get('/:id', tagController.getTagById);

// Create new tag
router.post('/', tagController.createTag);

// Update tag
router.put('/:id', tagController.updateTag);

// Delete tag
router.delete('/:id', tagController.deleteTag);

// Get documents by tag
router.get('/:id/documents', tagController.getDocumentsByTag);

// Add tag to document
router.post('/document/:documentId/tag/:tagId', tagController.addTagToDocument);

// Remove tag from document
router.delete('/document/:documentId/tag/:tagId', tagController.removeTagFromDocument);

module.exports = router;
