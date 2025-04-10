/**
 * Claude AI Routes
 * Defines API endpoints for Claude AI functionality
 */

const express = require('express');
const router = express.Router();
const claudeController = require('../controllers/claudeController');

// POST /api/claude/message - Send a message to Claude and get a response
router.post('/message', claudeController.sendMessage);

// GET /api/claude/models - Get available Claude models
router.get('/models', claudeController.getModels);

module.exports = router;
