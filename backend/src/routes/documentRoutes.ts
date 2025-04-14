import express from 'express';
import multer from 'multer';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
} from '../controllers/documentController';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/documents - Get all documents
router.get('/', getDocuments);

// GET /api/documents/:id - Get document by ID
router.get('/:id', getDocumentById);

// POST /api/documents - Upload document
router.post('/', upload.single('file'), uploadDocument);

// PUT /api/documents/:id - Update document metadata
router.put('/:id', updateDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', deleteDocument);

// POST /api/documents/:id/move - Move document to different folder
router.post('/:id/move', moveDocument);

export default router;
