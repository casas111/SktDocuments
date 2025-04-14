import { Request, Response, NextFunction } from 'express';
import Label from '../models/Label';
import Document from '../models/Document';
import DocumentLabel from '../models/DocumentLabel';
import { v4 as uuidv4 } from 'uuid';

// Get all labels
export const getLabels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labels = await Label.findAll({
      where: {
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error) {
    next(error);
  }
};

// Create label
export const createLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, color } = req.body;
    
    const label = await Label.create({
      id: uuidv4(),
      name,
      color,
      ownerId: req.body.userId, // In a real app, this would come from auth middleware
    });
    
    res.status(201).json({
      success: true,
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

// Update label
export const updateLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, color } = req.body;
    
    const label = await Label.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!label) {
      const error = new Error('Label not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    label.name = name;
    label.color = color;
    await label.save();
    
    res.status(200).json({
      success: true,
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

// Delete label
export const deleteLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = await Label.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!label) {
      const error = new Error('Label not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    await label.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Add label to document
export const addLabelToDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, labelId } = req.body;
    
    // Check if document exists and belongs to user
    const document = await Document.findOne({
      where: {
        id: documentId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Check if label exists and belongs to user
    const label = await Label.findOne({
      where: {
        id: labelId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!label) {
      const error = new Error('Label not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Check if the label is already applied to the document
    const existingDocumentLabel = await DocumentLabel.findOne({
      where: {
        documentId,
        labelId,
      },
    });
    
    if (existingDocumentLabel) {
      return res.status(200).json({
        success: true,
        message: 'Label already applied to document',
        data: existingDocumentLabel,
      });
    }
    
    // Add label to document
    const documentLabel = await DocumentLabel.create({
      documentId,
      labelId,
    });
    
    res.status(201).json({
      success: true,
      data: documentLabel,
    });
  } catch (error) {
    next(error);
  }
};

// Remove label from document
export const removeLabelFromDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, labelId } = req.params;
    
    // Check if document exists and belongs to user
    const document = await Document.findOne({
      where: {
        id: documentId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Check if the label is applied to the document
    const documentLabel = await DocumentLabel.findOne({
      where: {
        documentId,
        labelId,
      },
    });
    
    if (!documentLabel) {
      const error = new Error('Label not applied to document') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Remove label from document
    await documentLabel.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
