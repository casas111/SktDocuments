/**
 * Routes for translation functionality
 */
const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

// POST /api/translation/process - Process document translation
router.post('/process', translationController.translateDocuments);

// GET /api/translation/models - Get available Claude models for translation
router.get('/models', translationController.getTranslationModels);

module.exports = router;
