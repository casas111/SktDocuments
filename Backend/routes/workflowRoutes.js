const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// Get all workflows
router.get('/', workflowController.getAllWorkflows);

// Get workflow by ID
router.get('/:id', workflowController.getWorkflowById);

// Create new workflow
router.post('/', workflowController.createWorkflow);

// Update workflow
router.put('/:id', workflowController.updateWorkflow);

// Delete workflow
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
