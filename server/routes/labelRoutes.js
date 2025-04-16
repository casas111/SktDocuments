const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');

// Label routes
router.post('/', labelController.createLabel);
router.get('/', labelController.getAllLabels);
router.get('/:id', labelController.getLabelById);
router.put('/:id', labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);
router.get('/:id/documents', labelController.getDocumentsByLabel);

module.exports = router;
