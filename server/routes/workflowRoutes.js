const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// Workflow routes
router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);
router.get('/:id/canvas', workflowController.getWorkflowCanvas);
router.put('/:id/canvas', workflowController.updateWorkflowCanvas);
router.post('/:id/execute', workflowController.executeWorkflow);
router.get('/:id/executions', workflowController.getWorkflowExecutionHistory);

module.exports = router;
