import { Request, Response, NextFunction } from 'express';
import Folder from '../models/Folder';
import { v4 as uuidv4 } from 'uuid';

// Get all folders
export const getFolders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folders = await Folder.findAll({
      where: {
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    res.status(200).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
};

// Get folder by ID
export const getFolderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await Folder.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
      include: ['subfolders', 'documents'],
    });
    
    if (!folder) {
      const error = new Error('Folder not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    next(error);
  }
};

// Create folder
export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId } = req.body;
    
    const folder = await Folder.create({
      id: uuidv4(),
      name,
      parentId: parentId || null,
      ownerId: req.body.userId, // In a real app, this would come from auth middleware
    });
    
    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    next(error);
  }
};

// Update folder
export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    
    const folder = await Folder.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!folder) {
      const error = new Error('Folder not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    folder.name = name;
    await folder.save();
    
    res.status(200).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    next(error);
  }
};

// Delete folder
export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await Folder.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!folder) {
      const error = new Error('Folder not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    await folder.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
