import express from 'express';
import {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
} from '../controllers/folderController';

const router = express.Router();

// GET /api/folders - Get all folders
router.get('/', getFolders);

// GET /api/folders/:id - Get folder by ID
router.get('/:id', getFolderById);

// POST /api/folders - Create folder
router.post('/', createFolder);

// PUT /api/folders/:id - Update folder
router.put('/:id', updateFolder);

// DELETE /api/folders/:id - Delete folder
router.delete('/:id', deleteFolder);

export default router;
