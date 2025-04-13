/**
 * Routes for transformation functionality
 */
const express = require('express');
const router = express.Router();
const transformationController = require('../controllers/transformationController');

// POST /api/transformation/process - Process document transformation
router.post('/process', transformationController.transformDocuments);

// GET /api/transformation/models - Get available Claude models for transformation
router.get('/models', transformationController.getTransformationModels);

module.exports = router;
