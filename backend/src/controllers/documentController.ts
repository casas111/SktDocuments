import { Request, Response, NextFunction } from 'express';
import Document from '../models/Document';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Get all documents
export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.query;
    
    const whereClause: any = {
      ownerId: req.body.userId, // In a real app, this would come from auth middleware
    };
    
    if (folderId) {
      whereClause.folderId = folderId;
    }
    
    const documents = await Document.findAll({
      where: whereClause,
      include: ['labels'],
    });
    
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// Get document by ID
export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
      include: ['labels'],
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// Upload document
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded') as Error & { status?: number };
      error.status = 400;
      throw error;
    }
    
    const { folderId } = req.body;
    const file = req.file;
    
    // Upload to S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
      Key: `documents/${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    
    const uploadResult = await s3.upload(params).promise();
    
    // Create document record
    const document = await Document.create({
      id: uuidv4(),
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: uploadResult.Location,
      folderId,
      ownerId: req.body.userId, // In a real app, this would come from auth middleware
    });
    
    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// Update document metadata
export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    document.name = name;
    await document.save();
    
    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Delete from S3
    const key = document.url.split('/').pop();
    if (key) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
        Key: `documents/${key}`,
      };
      
      await s3.deleteObject(params).promise();
    }
    
    await document.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Move document to different folder
export const moveDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.body;
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!document) {
      const error = new Error('Document not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    document.folderId = folderId;
    await document.save();
    
    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};
