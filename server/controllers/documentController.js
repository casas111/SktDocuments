const { Document, Folder, Label, DocumentLabel } = require('../models');
const documentService = require('../utils/documentService');
const fileStorageService = require('../utils/fileStorageService');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Create a new document
exports.createDocument = async (req, res) => {
  try {
    const { name, folderId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No file uploaded' });
    }
    
    // Process the uploaded file
    const processResult = await documentService.processUploadedFile(req.file, name, folderId);
    
    if (!processResult.success) {
      return res.status(500).json({ error: true, message: processResult.error });
    }
    
    // Create document record in database
    const document = await Document.create(processResult.document);
    
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        { model: Folder, as: 'folder' },
        { model: Label, as: 'labels' }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get documents by folder
exports.getDocumentsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    
    const documents = await Document.findAll({
      where: { folderId },
      include: [
        { model: Label, as: 'labels' }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents by folder:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id, {
      include: [
        { model: Folder, as: 'folder' },
        { model: Label, as: 'labels' }
      ]
    });
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folderId } = req.body;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    // Update document properties
    await document.update({
      name: name || document.name,
      folderId: folderId !== undefined ? folderId : document.folderId
    });
    
    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    // Delete the physical file
    const deleteResult = await documentService.deleteDocumentFile(document.path);
    
    if (!deleteResult.success) {
      console.warn(`Warning: Could not delete physical file: ${deleteResult.error}`);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete the database record
    await document.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Move document to a different folder
exports.moveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    // If moving to a specific folder, check if it exists
    if (folderId) {
      const targetFolder = await Folder.findByPk(folderId);
      if (!targetFolder) {
        return res.status(404).json({ error: true, message: 'Target folder not found' });
      }
    }
    
    // Update document's folder
    await document.update({ folderId });
    
    // Optionally move the physical file to a folder-specific directory
    // This is commented out as it might not be necessary depending on the storage strategy
    /*
    if (folderId) {
      const targetFolderPath = path.join(fileStorageService.baseUploadDir, folderId);
      fileStorageService.ensureDirectoryExists(targetFolderPath);
      
      const fileName = path.basename(document.path);
      const newPath = path.join(targetFolderPath, fileName);
      
      const moveResult = await documentService.moveDocumentFile(document.path, newPath);
      
      if (moveResult.success) {
        await document.update({ path: newPath });
      }
    }
    */
    
    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error moving document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get document content
exports.getDocumentContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    // Read the document content
    const readResult = await documentService.readDocumentFile(document.path);
    
    if (!readResult.success) {
      return res.status(404).json({ error: true, message: readResult.error });
    }
    
    // For text files, return the content
    if (['txt', 'csv', 'md', 'json', 'xml', 'html'].includes(document.type.toLowerCase())) {
      return res.status(200).json({
        success: true,
        content: readResult.content,
        document
      });
    }
    
    // For other file types, send the file
    res.sendFile(document.path);
  } catch (error) {
    console.error('Error fetching document content:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Add label to document
exports.addLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    const label = await Label.findByPk(labelId);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    // Check if the label is already associated with the document
    const existingAssociation = await DocumentLabel.findOne({
      where: {
        documentId: id,
        labelId
      }
    });
    
    if (existingAssociation) {
      return res.status(400).json({ error: true, message: 'Label already added to this document' });
    }
    
    // Create the association
    await DocumentLabel.create({
      documentId: id,
      labelId
    });
    
    res.status(200).json({
      success: true,
      message: 'Label added to document successfully'
    });
  } catch (error) {
    console.error('Error adding label to document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Remove label from document
exports.removeLabel = async (req, res) => {
  try {
    const { id, labelId } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ error: true, message: 'Document not found' });
    }
    
    const label = await Label.findByPk(labelId);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    // Delete the association
    const deleted = await DocumentLabel.destroy({
      where: {
        documentId: id,
        labelId
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ error: true, message: 'Label not associated with this document' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Label removed from document successfully'
    });
  } catch (error) {
    console.error('Error removing label from document:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Search documents
exports.searchDocuments = async (req, res) => {
  try {
    const { query, labelIds, folderId, type } = req.query;
    
    const whereClause = {};
    
    // Search by name if query is provided
    if (query) {
      whereClause.name = {
        [Op.iLike]: `%${query}%`
      };
    }
    
    // Filter by folder if folderId is provided
    if (folderId) {
      whereClause.folderId = folderId;
    }
    
    // Filter by document type if type is provided
    if (type) {
      whereClause.type = type;
    }
    
    // Build include array for the query
    const include = [
      { model: Folder, as: 'folder' },
      { model: Label, as: 'labels' }
    ];
    
    // Filter by labels if labelIds are provided
    if (labelIds) {
      const labelIdsArray = Array.isArray(labelIds) ? labelIds : [labelIds];
      
      include[1].where = {
        id: {
          [Op.in]: labelIdsArray
        }
      };
    }
    
    const documents = await Document.findAll({
      where: whereClause,
      include
    });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
