import express from 'express';
import {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToDocument,
  removeLabelFromDocument,
} from '../controllers/labelController';

const router = express.Router();

// GET /api/labels - Get all labels
router.get('/', getLabels);

// POST /api/labels - Create label
router.post('/', createLabel);

// PUT /api/labels/:id - Update label
router.put('/:id', updateLabel);

// DELETE /api/labels/:id - Delete label
router.delete('/:id', deleteLabel);

// POST /api/labels/document - Add label to document
router.post('/document', addLabelToDocument);

// DELETE /api/labels/document/:documentId/:labelId - Remove label from document
router.delete('/document/:documentId/:labelId', removeLabelFromDocument);

export default router;
