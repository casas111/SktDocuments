/**
 * Routes for transformation node functionality
 */
const express = require('express');
const router = express.Router();
const transformationNodeController = require('../controllers/transformationNodeController');

// POST /api/transformation/node - Create a new transformation node
router.post('/node', transformationNodeController.createNode);

// POST /api/transformation/trigger - Trigger a transformation node with input documents
router.post('/trigger', transformationNodeController.triggerNode);

// GET /api/transformation/models - Get available Claude models for transformation
router.get('/models', transformationNodeController.getTransformationModels);

module.exports = router;
