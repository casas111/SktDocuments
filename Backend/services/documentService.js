// Enhanced Backend folder structure support
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory document storage (would be replaced with a database in production)
let documents = [];

// In-memory folder storage
let folders = [
  { id: 'root', name: 'Root', parentId: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'legal', name: 'Legal Documents', parentId: 'root', createdAt: new Date(), updatedAt: new Date() },
  { id: 'financial', name: 'Financial Documents', parentId: 'root', createdAt: new Date(), updatedAt: new Date() },
  { id: 'contracts', name: 'Contracts', parentId: 'legal', createdAt: new Date(), updatedAt: new Date() },
  { id: 'reports', name: 'Reports', parentId: 'financial', createdAt: new Date(), updatedAt: new Date() }
];

// In-memory tag storage
let tags = [
  { id: 'legal', name: 'Legal', color: '#f44336' },
  { id: 'financial', name: 'Financial', color: '#4caf50' },
  { id: 'contract', name: 'Contract', color: '#2196f3' },
  { id: 'report', name: 'Report', color: '#ff9800' },
  { id: 'confidential', name: 'Confidential', color: '#9c27b0' }
];

/**
 * Save document metadata
 * @param {Object} document - Document metadata
 * @returns {Object} Saved document with ID
 */
const saveDocument = (document) => {
  const newDocument = {
    id: document.id || uuidv4(),
    originalName: document.originalName,
    filename: document.filename,
    mimetype: document.mimetype,
    size: document.size,
    path: document.path,
    type: document.type || 'unknown',
    uploadDate: document.uploadDate || new Date(),
    metadata: document.metadata || {},
    folderId: document.folderId || 'root',
    tags: document.tags || [],
    starred: document.starred || false,
    locked: document.locked || false,
    accessLevel: document.accessLevel || 'private',
    sharedWith: document.sharedWith || []
  };
  
  // Add to in-memory store
  const existingIndex = documents.findIndex(doc => doc.id === newDocument.id);
  if (existingIndex >= 0) {
    documents[existingIndex] = newDocument;
  } else {
    documents.push(newDocument);
  }
  
  logger.info(`Document saved: ${newDocument.id} - ${newDocument.originalName}`);
  return newDocument;
};

/**
 * Get all documents
 * @returns {Array} Array of document metadata
 */
const getAllDocuments = () => {
  return documents;
};

/**
 * Get document by ID
 * @param {string} id - Document ID
 * @returns {Object|null} Document metadata or null if not found
 */
const getDocumentById = (id) => {
  return documents.find(doc => doc.id === id) || null;
};

/**
 * Get documents by folder ID
 * @param {string} folderId - Folder ID
 * @returns {Array} Array of documents in the folder
 */
const getDocumentsByFolder = (folderId) => {
  return documents.filter(doc => doc.folderId === folderId);
};

/**
 * Get documents by tag
 * @param {string} tagId - Tag ID
 * @returns {Array} Array of documents with the tag
 */
const getDocumentsByTag = (tagId) => {
  return documents.filter(doc => doc.tags && doc.tags.includes(tagId));
};

/**
 * Delete document by ID
 * @param {string} id - Document ID
 * @returns {boolean} True if document was deleted, false otherwise
 */
const deleteDocument = async (id) => {
  const document = getDocumentById(id);
  if (!document) {
    return false;
  }
  
  // Delete file from filesystem
  try {
    if (document.path && fs.existsSync(document.path)) {
      await fs.unlink(document.path);
    }
    
    // Remove from in-memory store
    documents = documents.filter(doc => doc.id !== id);
    logger.info(`Document deleted: ${id} - ${document.originalName}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting document ${id}:`, error);
    return false;
  }
};

/**
 * Move a document to the processed directory
 * @param {string} sourceId - Source document ID
 * @param {string} newFilename - New filename (optional)
 * @returns {Object|null} New document metadata or null if error
 */
const moveToProcessed = async (sourceId, newFilename = null) => {
  const sourceDoc = getDocumentById(sourceId);
  if (!sourceDoc) {
    return null;
  }
  
  try {
    const processedDir = path.join(__dirname, '../storage/processed');
    fs.ensureDirSync(processedDir);
    
    const filename = newFilename || sourceDoc.filename;
    const newPath = path.join(processedDir, filename);
    
    // Copy the file to processed directory
    await fs.copy(sourceDoc.path, newPath);
    
    // Create new document entry
    const processedDoc = {
      id: uuidv4(),
      originalName: sourceDoc.originalName,
      filename: filename,
      mimetype: sourceDoc.mimetype,
      size: sourceDoc.size,
      path: newPath,
      type: 'processed',
      uploadDate: new Date(),
      folderId: sourceDoc.folderId,
      tags: sourceDoc.tags,
      starred: sourceDoc.starred,
      locked: sourceDoc.locked,
      accessLevel: sourceDoc.accessLevel,
      sharedWith: sourceDoc.sharedWith,
      metadata: {
        ...sourceDoc.metadata,
        sourceDocumentId: sourceId,
        processedDate: new Date()
      }
    };
    
    logger.info(`Document moved to processed: ${sourceId} -> ${processedDoc.id}`);
    return saveDocument(processedDoc);
  } catch (error) {
    logger.error(`Error moving document ${sourceId} to processed:`, error);
    return null;
  }
};

/**
 * Move document to a different folder
 * @param {string} documentId - Document ID
 * @param {string} folderId - Destination folder ID
 * @returns {Object|null} Updated document or null if error
 */
const moveDocumentToFolder = (documentId, folderId) => {
  // Check if folder exists
  const folderExists = folders.some(folder => folder.id === folderId);
  if (!folderExists && folderId !== 'root') {
    logger.error(`Folder not found: ${folderId}`);
    return null;
  }
  
  const document = getDocumentById(documentId);
  if (!document) {
    logger.error(`Document not found: ${documentId}`);
    return null;
  }
  
  // Update document folder
  document.folderId = folderId;
  document.metadata = {
    ...document.metadata,
    lastModified: new Date()
  };
  
  // Save updated document
  const updatedDoc = saveDocument(document);
  logger.info(`Document moved to folder: ${documentId} -> ${folderId}`);
  return updatedDoc;
};

/**
 * Create a new folder
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID
 * @returns {Object} Created folder
 */
const createFolder = (name, parentId = 'root') => {
  // Check if parent folder exists
  const parentExists = folders.some(folder => folder.id === parentId);
  if (!parentExists && parentId !== 'root') {
    logger.error(`Parent folder not found: ${parentId}`);
    return null;
  }
  
  const newFolder = {
    id: uuidv4(),
    name,
    parentId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  folders.push(newFolder);
  logger.info(`Folder created: ${newFolder.id} - ${name}`);
  return newFolder;
};

/**
 * Get all folders
 * @returns {Array} Array of folders
 */
const getAllFolders = () => {
  return folders;
};

/**
 * Get folder by ID
 * @param {string} id - Folder ID
 * @returns {Object|null} Folder or null if not found
 */
const getFolderById = (id) => {
  return folders.find(folder => folder.id === id) || null;
};

/**
 * Delete folder by ID
 * @param {string} id - Folder ID
 * @returns {boolean} True if folder was deleted, false otherwise
 */
const deleteFolder = (id) => {
  // Don't allow deleting root folder
  if (id === 'root') {
    logger.error('Cannot delete root folder');
    return false;
  }
  
  // Check if folder exists
  const folderIndex = folders.findIndex(folder => folder.id === id);
  if (folderIndex === -1) {
    logger.error(`Folder not found: ${id}`);
    return false;
  }
  
  // Check if folder has subfolders
  const hasSubfolders = folders.some(folder => folder.parentId === id);
  if (hasSubfolders) {
    logger.error(`Cannot delete folder with subfolders: ${id}`);
    return false;
  }
  
  // Move documents to parent folder
  const folder = folders[folderIndex];
  const folderDocuments = getDocumentsByFolder(id);
  folderDocuments.forEach(doc => {
    moveDocumentToFolder(doc.id, folder.parentId);
  });
  
  // Remove folder
  folders.splice(folderIndex, 1);
  logger.info(`Folder deleted: ${id}`);
  return true;
};

/**
 * Get all tags
 * @returns {Array} Array of tags
 */
const getAllTags = () => {
  return tags;
};

/**
 * Create a new tag
 * @param {string} name - Tag name
 * @param {string} color - Tag color
 * @returns {Object} Created tag
 */
const createTag = (name, color) => {
  const newTag = {
    id: uuidv4(),
    name,
    color
  };
  
  tags.push(newTag);
  logger.info(`Tag created: ${newTag.id} - ${name}`);
  return newTag;
};

/**
 * Add tag to document
 * @param {string} documentId - Document ID
 * @param {string} tagId - Tag ID
 * @returns {Object|null} Updated document or null if error
 */
const addTagToDocument = (documentId, tagId) => {
  // Check if tag exists
  const tagExists = tags.some(tag => tag.id === tagId);
  if (!tagExists) {
    logger.error(`Tag not found: ${tagId}`);
    return null;
  }
  
  const document = getDocumentById(documentId);
  if (!document) {
    logger.error(`Document not found: ${documentId}`);
    return null;
  }
  
  // Add tag if not already present
  if (!document.tags) {
    document.tags = [];
  }
  
  if (!document.tags.includes(tagId)) {
    document.tags.push(tagId);
    document.metadata = {
      ...document.metadata,
      lastModified: new Date()
    };
    
    // Save updated document
    const updatedDoc = saveDocument(document);
    logger.info(`Tag added to document: ${documentId} - ${tagId}`);
    return updatedDoc;
  }
  
  return document;
};

/**
 * Remove tag from document
 * @param {string} documentId - Document ID
 * @param {string} tagId - Tag ID
 * @returns {Object|null} Updated document or null if error
 */
const removeTagFromDocument = (documentId, tagId) => {
  const document = getDocumentById(documentId);
  if (!document) {
    logger.error(`Document not found: ${documentId}`);
    return null;
  }
  
  // Remove tag if present
  if (document.tags && document.tags.includes(tagId)) {
    document.tags = document.tags.filter(tag => tag !== tagId);
    document.metadata = {
      ...document.metadata,
      lastModified: new Date()
    };
    
    // Save updated document
    const updatedDoc = saveDocument(document);
    logger.info(`Tag removed from document: ${documentId} - ${tagId}`);
    return updatedDoc;
  }
  
  return document;
};

/**
 * Toggle document starred status
 * @param {string} documentId - Document ID
 * @returns {Object|null} Updated document or null if error
 */
const toggleDocumentStarred = (documentId) => {
  const document = getDocumentById(documentId);
  if (!document) {
    logger.error(`Document not found: ${documentId}`);
    return null;
  }
  
  // Toggle starred status
  document.starred = !document.starred;
  document.metadata = {
    ...document.metadata,
    lastModified: new Date()
  };
  
  // Save updated document
  const updatedDoc = saveDocument(document);
  logger.info(`Document starred status toggled: ${documentId} - ${document.starred}`);
  return updatedDoc;
};

module.exports = {
  saveDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentsByFolder,
  getDocumentsByTag,
  deleteDocument,
  moveToProcessed,
  moveDocumentToFolder,
  createFolder,
  getAllFolders,
  getFolderById,
  deleteFolder,
  getAllTags,
  createTag,
  addTagToDocument,
  removeTagFromDocument,
  toggleDocumentStarred
};
