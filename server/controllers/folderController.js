const { Folder, Document } = require('../models');
const fileStorageService = require('../utils/fileStorageService');
const { Op } = require('sequelize');
const path = require('path');

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    // Validate folder name
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: true, message: 'Folder name is required' });
    }
    
    // If parentId is provided, check if parent folder exists
    if (parentId) {
      const parentFolder = await Folder.findByPk(parentId);
      if (!parentFolder) {
        return res.status(404).json({ error: true, message: 'Parent folder not found' });
      }
    }
    
    // Create folder path
    let folderPath = '/';
    if (parentId) {
      const parentFolder = await Folder.findByPk(parentId);
      folderPath = `${parentFolder.path}${parentFolder.name}/`;
    }
    
    // Create physical folder in the file system
    const physicalFolderPath = fileStorageService.createFolder(
      parentId ? `${parentId}/${name}` : name
    );
    
    // Create folder record in database
    const folder = await Folder.create({
      name,
      parentId: parentId || null,
      path: folderPath
    });
    
    res.status(201).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all folders
exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.findAll();
    
    res.status(200).json({
      success: true,
      count: folders.length,
      folders
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get folder tree structure
exports.getFolderTree = async (req, res) => {
  try {
    // Get all root folders (no parent)
    const rootFolders = await Folder.findAll({
      where: { parentId: null },
      include: [{ model: Folder, as: 'subfolders' }]
    });
    
    // Function to recursively build folder tree
    const buildFolderTree = async (folders) => {
      const result = [];
      
      for (const folder of folders) {
        const subfolders = await Folder.findAll({
          where: { parentId: folder.id },
          include: [{ model: Folder, as: 'subfolders' }]
        });
        
        const folderWithChildren = {
          ...folder.toJSON(),
          children: subfolders.length > 0 ? await buildFolderTree(subfolders) : []
        };
        
        result.push(folderWithChildren);
      }
      
      return result;
    };
    
    const folderTree = await buildFolderTree(rootFolders);
    
    res.status(200).json({
      success: true,
      folderTree
    });
  } catch (error) {
    console.error('Error fetching folder tree:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get folder by ID
exports.getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folder = await Folder.findByPk(id, {
      include: [
        { model: Folder, as: 'parent' },
        { model: Folder, as: 'subfolders' }
      ]
    });
    
    if (!folder) {
      return res.status(404).json({ error: true, message: 'Folder not found' });
    }
    
    res.status(200).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update folder
exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const folder = await Folder.findByPk(id);
    
    if (!folder) {
      return res.status(404).json({ error: true, message: 'Folder not found' });
    }
    
    // Validate folder name
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: true, message: 'Folder name is required' });
    }
    
    // Update folder name
    await folder.update({ name });
    
    // Update path for this folder and all subfolders
    await updateFolderPaths(folder);
    
    res.status(200).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const folder = await Folder.findByPk(id);
    
    if (!folder) {
      return res.status(404).json({ error: true, message: 'Folder not found' });
    }
    
    // Check if folder has documents
    const documentsCount = await Document.count({ where: { folderId: id } });
    
    if (documentsCount > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Cannot delete folder with documents. Move or delete documents first.' 
      });
    }
    
    // Check if folder has subfolders
    const subfoldersCount = await Folder.count({ where: { parentId: id } });
    
    if (subfoldersCount > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Cannot delete folder with subfolders. Delete subfolders first.' 
      });
    }
    
    // Delete the folder
    await folder.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Move folder to a different parent folder
exports.moveFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body;
    
    const folder = await Folder.findByPk(id);
    
    if (!folder) {
      return res.status(404).json({ error: true, message: 'Folder not found' });
    }
    
    // If parentId is null, move to root
    if (parentId === null) {
      await folder.update({ 
        parentId: null,
        path: '/'
      });
    } else {
      // Check if target parent folder exists
      const parentFolder = await Folder.findByPk(parentId);
      
      if (!parentFolder) {
        return res.status(404).json({ error: true, message: 'Parent folder not found' });
      }
      
      // Check for circular reference
      if (await isCircularReference(id, parentId)) {
        return res.status(400).json({ 
          error: true, 
          message: 'Cannot move folder to its own subfolder' 
        });
      }
      
      // Update folder's parent
      await folder.update({ 
        parentId,
        path: `${parentFolder.path}${parentFolder.name}/`
      });
    }
    
    // Update paths for all subfolders
    await updateFolderPaths(folder);
    
    res.status(200).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Error moving folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get folder contents (subfolders and documents)
exports.getFolderContents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if folder exists
    const folder = await Folder.findByPk(id);
    
    if (!folder && id !== 'root') {
      return res.status(404).json({ error: true, message: 'Folder not found' });
    }
    
    // Get subfolders
    const subfolders = await Folder.findAll({
      where: id === 'root' ? { parentId: null } : { parentId: id }
    });
    
    // Get documents
    const documents = await Document.findAll({
      where: id === 'root' ? { folderId: null } : { folderId: id }
    });
    
    res.status(200).json({
      success: true,
      folder: id === 'root' ? { id: 'root', name: 'Root', path: '/' } : folder,
      contents: {
        subfolders,
        documents
      }
    });
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Helper function to update paths for a folder and all its subfolders
const updateFolderPaths = async (folder) => {
  // Get all subfolders
  const subfolders = await Folder.findAll({
    where: { parentId: folder.id }
  });
  
  // Update each subfolder's path
  for (const subfolder of subfolders) {
    await subfolder.update({
      path: `${folder.path}${folder.name}/`
    });
    
    // Recursively update paths for subfolders
    await updateFolderPaths(subfolder);
  }
};

// Helper function to check for circular references when moving folders
const isCircularReference = async (folderId, targetParentId) => {
  // If target parent is the same as folder, it's a circular reference
  if (folderId === targetParentId) {
    return true;
  }
  
  // Check if target parent is a subfolder of the folder
  const checkSubfolders = async (parentId) => {
    const subfolders = await Folder.findAll({
      where: { parentId }
    });
    
    for (const subfolder of subfolders) {
      if (subfolder.id === targetParentId) {
        return true;
      }
      
      if (await checkSubfolders(subfolder.id)) {
        return true;
      }
    }
    
    return false;
  };
  
  return await checkSubfolders(folderId);
};
