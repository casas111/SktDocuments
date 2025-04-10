const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../utils/logger');

/**
 * Upload a document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadDocument = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create document metadata
    const document = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      type: req.body.type || 'input',
      folderId: req.body.folderId || 'root',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      starred: req.body.starred === 'true',
      locked: req.body.locked === 'true',
      accessLevel: req.body.accessLevel || 'private',
      sharedWith: req.body.sharedWith ? JSON.parse(req.body.sharedWith) : [],
      metadata: {
        nodeId: req.body.nodeId || null,
        nodeType: req.body.nodeType || null,
        inputId: req.body.inputId || null,
        description: req.body.description || ''
      }
    };

    // Save document metadata
    const savedDocument = documentService.saveDocument(document);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: savedDocument.id,
        originalName: savedDocument.originalName,
        filename: savedDocument.filename,
        mimetype: savedDocument.mimetype,
        size: savedDocument.size,
        type: savedDocument.type,
        uploadDate: savedDocument.uploadDate,
        folderId: savedDocument.folderId,
        tags: savedDocument.tags,
        starred: savedDocument.starred,
        locked: savedDocument.locked,
        accessLevel: savedDocument.accessLevel,
        sharedWith: savedDocument.sharedWith,
        metadata: savedDocument.metadata,
        url: `/files/uploads/${savedDocument.filename}`
      }
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get all documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDocuments = (req, res) => {
  try {
    const documents = documentService.getAllDocuments();
    
    // Map documents to include URLs
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      url: doc.type === 'processed' 
        ? `/files/processed/${doc.filename}`
        : `/files/uploads/${doc.filename}`
    }));

    res.status(200).json({
      success: true,
      count: documentsWithUrls.length,
      documents: documentsWithUrls
    });
  } catch (error) {
    logger.error('Error getting documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDocumentById = (req, res) => {
  try {
    const document = documentService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Add URL to document
    const documentWithUrl = {
      ...document,
      url: document.type === 'processed' 
        ? `/files/processed/${document.filename}`
        : `/files/uploads/${document.filename}`
    };

    res.status(200).json({
      success: true,
      document: documentWithUrl
    });
  } catch (error) {
    logger.error(`Error getting document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
};

/**
 * Download document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadDocument = (req, res) => {
  try {
    const document = documentService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Set content disposition header for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    
    // Send file
    res.sendFile(document.path);
  } catch (error) {
    logger.error(`Error downloading document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

/**
 * Delete document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDocument = async (req, res) => {
  try {
    const deleted = await documentService.deleteDocument(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or could not be deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

/**
 * Get documents by folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDocumentsByFolder = (req, res) => {
  try {
    const folderId = req.params.folderId;
    const documents = documentService.getDocumentsByFolder(folderId);
    
    // Map documents to include URLs
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      url: doc.type === 'processed' 
        ? `/files/processed/${doc.filename}`
        : `/files/uploads/${doc.filename}`
    }));

    res.status(200).json({
      success: true,
      count: documentsWithUrls.length,
      documents: documentsWithUrls
    });
  } catch (error) {
    logger.error(`Error getting documents for folder ${req.params.folderId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents by folder',
      error: error.message
    });
  }
};

/**
 * Move document to folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const moveDocumentToFolder = (req, res) => {
  try {
    const documentId = req.params.id;
    const folderId = req.params.folderId;
    
    const updatedDocument = documentService.moveDocumentToFolder(documentId, folderId);
    
    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document or folder not found'
      });
    }

    // Add URL to document
    const documentWithUrl = {
      ...updatedDocument,
      url: updatedDocument.type === 'processed' 
        ? `/files/processed/${updatedDocument.filename}`
        : `/files/uploads/${updatedDocument.filename}`
    };

    res.status(200).json({
      success: true,
      message: 'Document moved successfully',
      document: documentWithUrl
    });
  } catch (error) {
    logger.error(`Error moving document ${req.params.id} to folder ${req.params.folderId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to move document',
      error: error.message
    });
  }
};

/**
 * Get all folders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFolders = (req, res) => {
  try {
    const folders = documentService.getAllFolders();
    
    res.status(200).json({
      success: true,
      count: folders.length,
      folders
    });
  } catch (error) {
    logger.error('Error getting folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get folders',
      error: error.message
    });
  }
};

/**
 * Create folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFolder = (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }
    
    const newFolder = documentService.createFolder(name, parentId);
    
    if (!newFolder) {
      return res.status(404).json({
        success: false,
        message: 'Parent folder not found'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: newFolder
    });
  } catch (error) {
    logger.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create folder',
      error: error.message
    });
  }
};

/**
 * Delete folder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFolder = (req, res) => {
  try {
    const deleted = documentService.deleteFolder(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or could not be deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting folder ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete folder',
      error: error.message
    });
  }
};

/**
 * Get all tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTags = (req, res) => {
  try {
    const tags = documentService.getAllTags();
    
    res.status(200).json({
      success: true,
      count: tags.length,
      tags
    });
  } catch (error) {
    logger.error('Error getting tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tags',
      error: error.message
    });
  }
};

/**
 * Create tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTag = (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'Tag name and color are required'
      });
    }
    
    const newTag = documentService.createTag(name, color);

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      tag: newTag
    });
  } catch (error) {
    logger.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
};

/**
 * Add tag to document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addTagToDocument = (req, res) => {
  try {
    const documentId = req.params.id;
    const tagId = req.params.tagId;
    
    const updatedDocument = documentService.addTagToDocument(documentId, tagId);
    
    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document or tag not found'
      });
    }

    // Add URL to document
    const documentWithUrl = {
      ...updatedDocument,
      url: updatedDocument.type === 'processed' 
        ? `/files/processed/${updatedDocument.filename}`
        : `/files/uploads/${updatedDocument.filename}`
    };

    res.status(200).json({
      success: true,
      message: 'Tag added to document successfully',
      document: documentWithUrl
    });
  } catch (error) {
    logger.error(`Error adding tag ${req.params.tagId} to document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to add tag to document',
      error: error.message
    });
  }
};

/**
 * Remove tag from document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeTagFromDocument = (req, res) => {
  try {
    const documentId = req.params.id;
    const tagId = req.params.tagId;
    
    const updatedDocument = documentService.removeTagFromDocument(documentId, tagId);
    
    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Add URL to document
    const documentWithUrl = {
      ...updatedDocument,
      url: updatedDocument.type === 'processed' 
        ? `/files/processed/${updatedDocument.filename}`
        : `/files/uploads/${updatedDocument.filename}`
    };

    res.status(200).json({
      success: true,
      message: 'Tag removed from document successfully',
      document: documentWithUrl
    });
  } catch (error) {
    logger.error(`Error removing tag ${req.params.tagId} from document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove tag from document',
      error: error.message
    });
  }
};

/**
 * Toggle document starred status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleDocumentStarred = (req, res) => {
  try {
    const documentId = req.params.id;
    
    const updatedDocument = documentService.toggleDocumentStarred(documentId);
    
    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Add URL to document
    const documentWithUrl = {
      ...updatedDocument,
      url: updatedDocument.type === 'processed' 
        ? `/files/processed/${updatedDocument.filename}`
        : `/files/uploads/${updatedDocument.filename}`
    };

    res.status(200).json({
      success: true,
      message: `Document ${updatedDocument.starred ? 'starred' : 'unstarred'} successfully`,
      document: documentWithUrl
    });
  } catch (error) {
    logger.error(`Error toggling starred status for document ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle document starred status',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  getDocumentsByFolder,
  moveDocumentToFolder,
  getAllFolders,
  createFolder,
  deleteFolder,
  getAllTags,
  createTag,
  addTagToDocument,
  removeTagFromDocument,
  toggleDocumentStarred
};
