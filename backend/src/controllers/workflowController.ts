import { Request, Response, NextFunction } from 'express';
import Workflow from '../models/Workflow';
import Node from '../models/Node';
import Connection from '../models/Connection';
import { v4 as uuidv4 } from 'uuid';

// Get all workflows
export const getWorkflows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflows = await Workflow.findAll({
      where: {
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    res.status(200).json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
};

// Get workflow by ID
export const getWorkflowById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
      include: ['nodes', 'connections'],
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

// Create workflow
export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    
    const workflow = await Workflow.create({
      id: uuidv4(),
      name,
      description,
      canvasState: '{}',
      ownerId: req.body.userId, // In a real app, this would come from auth middleware
    });
    
    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

// Update workflow
export const updateWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, canvasState } = req.body;
    
    const workflow = await Workflow.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    if (name) workflow.name = name;
    if (description) workflow.description = description;
    if (canvasState) workflow.canvasState = canvasState;
    
    await workflow.save();
    
    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

// Delete workflow
export const deleteWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    await workflow.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Get all nodes in a workflow
export const getWorkflowNodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    const nodes = await Node.findAll({
      where: {
        workflowId: req.params.id,
      },
    });
    
    res.status(200).json({
      success: true,
      data: nodes,
    });
  } catch (error) {
    next(error);
  }
};

// Get all connections in a workflow
export const getWorkflowConnections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: {
        id: req.params.id,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    const connections = await Connection.findAll({
      where: {
        workflowId: req.params.id,
      },
      include: ['sourceNode', 'targetNode'],
    });
    
    res.status(200).json({
      success: true,
      data: connections,
    });
  } catch (error) {
    next(error);
  }
};
