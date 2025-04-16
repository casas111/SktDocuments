const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');

// Node routes
router.post('/', nodeController.createNode);
router.get('/workflow/:workflowId', nodeController.getNodesByWorkflow);
router.get('/:id', nodeController.getNodeById);
router.put('/:id', nodeController.updateNode);
router.delete('/:id', nodeController.deleteNode);
router.post('/:id/execute', nodeController.executeNode);
router.get('/:id/executions', nodeController.getNodeExecutionHistory);

// Node connection routes
router.post('/edge', nodeController.createEdge);
router.put('/edge/:id', nodeController.updateEdge);
router.delete('/edge/:id', nodeController.deleteEdge);
router.get('/edge/workflow/:workflowId', nodeController.getEdgesByWorkflow);

module.exports = router;
