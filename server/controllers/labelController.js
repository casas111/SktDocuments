const { Label, Document, DocumentLabel } = require('../models');
const { Op } = require('sequelize');

// Create a new label
exports.createLabel = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    // Validate label name
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: true, message: 'Label name is required' });
    }
    
    // Check if label with same name already exists
    const existingLabel = await Label.findOne({ where: { name } });
    if (existingLabel) {
      return res.status(400).json({ error: true, message: 'Label with this name already exists' });
    }
    
    // Create label record in database
    const label = await Label.create({
      name,
      color: color || '#3498db',
      description: description || ''
    });
    
    res.status(201).json({
      success: true,
      label
    });
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all labels
exports.getAllLabels = async (req, res) => {
  try {
    const labels = await Label.findAll({
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: labels.length,
      labels
    });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get label by ID
exports.getLabelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const label = await Label.findByPk(id);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    res.status(200).json({
      success: true,
      label
    });
  } catch (error) {
    console.error('Error fetching label:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update label
exports.updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    
    const label = await Label.findByPk(id);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    // If name is being updated, check for duplicates
    if (name && name !== label.name) {
      const existingLabel = await Label.findOne({ where: { name } });
      if (existingLabel) {
        return res.status(400).json({ error: true, message: 'Label with this name already exists' });
      }
    }
    
    // Update label properties
    await label.update({
      name: name || label.name,
      color: color || label.color,
      description: description !== undefined ? description : label.description
    });
    
    res.status(200).json({
      success: true,
      label
    });
  } catch (error) {
    console.error('Error updating label:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete label
exports.deleteLabel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const label = await Label.findByPk(id);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    // Check if label is associated with any documents
    const documentCount = await DocumentLabel.count({ where: { labelId: id } });
    
    if (documentCount > 0) {
      return res.status(400).json({ 
        error: true, 
        message: `Cannot delete label that is used by ${documentCount} documents. Remove label from documents first.` 
      });
    }
    
    // Delete the label
    await label.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Label deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting label:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get documents by label
exports.getDocumentsByLabel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const label = await Label.findByPk(id);
    
    if (!label) {
      return res.status(404).json({ error: true, message: 'Label not found' });
    }
    
    // Get documents with this label
    const documents = await Document.findAll({
      include: [
        {
          model: Label,
          as: 'labels',
          where: { id },
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      label,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents by label:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
