const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

// Folder routes
router.post('/', folderController.createFolder);
router.get('/', folderController.getAllFolders);
router.get('/tree', folderController.getFolderTree);
router.get('/:id', folderController.getFolderById);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);
router.post('/:id/move', folderController.moveFolder);
router.get('/:id/contents', folderController.getFolderContents);

module.exports = router;
