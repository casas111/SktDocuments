const Tag = require('../models/tagModel');
const Document = require('../models/documentModel');

/**
 * Get all tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: tags.length,
      tags
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get tag by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    res.status(200).json({
      success: true,
      tag
    });
  } catch (error) {
    console.error(`Error getting tag ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create new tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a tag name'
      });
    }
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        error: 'Tag with this name already exists'
      });
    }
    
    // Create new tag
    const tag = await Tag.create({
      name,
      color: color || '#2196f3'
    });
    
    res.status(201).json({
      success: true,
      tag,
      message: 'Tag created successfully'
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Update tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Find tag
    let tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Update tag
    tag.name = name || tag.name;
    tag.color = color || tag.color;
    tag.updatedAt = Date.now();
    
    await tag.save();
    
    res.status(200).json({
      success: true,
      tag,
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error(`Error updating tag ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Remove tag from all documents
    await Document.updateMany(
      { tags: req.params.id },
      { $pull: { tags: req.params.id } }
    );
    
    // Delete tag
    await tag.remove();
    
    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting tag ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get documents by tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentsByTag = async (req, res) => {
  try {
    const documents = await Document.find({ tags: req.params.id })
      .sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error(`Error getting documents for tag ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Add tag to document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addTagToDocument = async (req, res) => {
  try {
    const { documentId, tagId } = req.params;
    
    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check if tag exists
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    // Check if tag is already added to document
    if (document.tags.includes(tagId)) {
      return res.status(400).json({
        success: false,
        error: 'Tag already added to document'
      });
    }
    
    // Add tag to document
    document.tags.push(tagId);
    await document.save();
    
    res.status(200).json({
      success: true,
      document,
      message: 'Tag added to document successfully'
    });
  } catch (error) {
    console.error(`Error adding tag ${req.params.tagId} to document ${req.params.documentId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Remove tag from document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeTagFromDocument = async (req, res) => {
  try {
    const { documentId, tagId } = req.params;
    
    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check if tag is added to document
    if (!document.tags.includes(tagId)) {
      return res.status(400).json({
        success: false,
        error: 'Tag not added to document'
      });
    }
    
    // Remove tag from document
    document.tags = document.tags.filter(tag => tag.toString() !== tagId);
    await document.save();
    
    res.status(200).json({
      success: true,
      document,
      message: 'Tag removed from document successfully'
    });
  } catch (error) {
    console.error(`Error removing tag ${req.params.tagId} from document ${req.params.documentId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
