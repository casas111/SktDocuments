import express from 'express';
import {
  createNode,
  updateNode,
  deleteNode,
  createConnection,
  deleteConnection,
  triggerNode,
} from '../controllers/nodeController';

const router = express.Router();

// POST /api/nodes - Create node
router.post('/', createNode);

// PUT /api/nodes/:id - Update node
router.put('/:id', updateNode);

// DELETE /api/nodes/:id - Delete node
router.delete('/:id', deleteNode);

// POST /api/nodes/connections - Create connection
router.post('/connections', createConnection);

// DELETE /api/nodes/connections/:id - Delete connection
router.delete('/connections/:id', deleteConnection);

// POST /api/nodes/:id/trigger - Trigger node execution
router.post('/:id/trigger', triggerNode);

export default router;
