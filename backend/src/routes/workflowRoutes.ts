import express from 'express';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowNodes,
  getWorkflowConnections,
} from '../controllers/workflowController';

const router = express.Router();

// GET /api/workflows - Get all workflows
router.get('/', getWorkflows);

// GET /api/workflows/:id - Get workflow by ID
router.get('/:id', getWorkflowById);

// POST /api/workflows - Create workflow
router.post('/', createWorkflow);

// PUT /api/workflows/:id - Update workflow
router.put('/:id', updateWorkflow);

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', deleteWorkflow);

// GET /api/workflows/:id/nodes - Get all nodes in a workflow
router.get('/:id/nodes', getWorkflowNodes);

// GET /api/workflows/:id/connections - Get all connections in a workflow
router.get('/:id/connections', getWorkflowConnections);

export default router;
