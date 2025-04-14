import express from 'express';
import {
  executeWorkflow
} from '../controllers/workflowExecutionController';

const router = express.Router();

// POST /api/workflow-execution - Execute workflow
router.post('/', executeWorkflow);

export default router;
