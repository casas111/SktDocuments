import { Request, Response, NextFunction } from 'express';
import Node from '../models/Node';
import Workflow from '../models/Workflow';
import Connection from '../models/Connection';
import Document from '../models/Document';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import axios from 'axios';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create node
export const createNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId, type, name, positionX, positionY, config } = req.body;
    
    // Check if workflow exists and belongs to user
    const workflow = await Workflow.findOne({
      where: {
        id: workflowId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Create node
    const node = await Node.create({
      id: uuidv4(),
      workflowId,
      type,
      name,
      positionX: positionX || 0,
      positionY: positionY || 0,
      config: JSON.stringify(config || {}),
    });
    
    res.status(201).json({
      success: true,
      data: node,
    });
  } catch (error) {
    next(error);
  }
};

// Update node
export const updateNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, positionX, positionY, config } = req.body;
    
    // Find node and check if it belongs to user's workflow
    const node = await Node.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Workflow,
          as: 'workflow',
          where: {
            ownerId: req.body.userId, // In a real app, this would come from auth middleware
          },
        },
      ],
    });
    
    if (!node) {
      const error = new Error('Node not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Update node
    if (name) node.name = name;
    if (positionX !== undefined) node.positionX = positionX;
    if (positionY !== undefined) node.positionY = positionY;
    if (config) node.config = JSON.stringify(config);
    
    await node.save();
    
    res.status(200).json({
      success: true,
      data: node,
    });
  } catch (error) {
    next(error);
  }
};

// Delete node
export const deleteNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find node and check if it belongs to user's workflow
    const node = await Node.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Workflow,
          as: 'workflow',
          where: {
            ownerId: req.body.userId, // In a real app, this would come from auth middleware
          },
        },
      ],
    });
    
    if (!node) {
      const error = new Error('Node not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Delete node
    await node.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Create connection
export const createConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId, sourceNodeId, targetNodeId, sourceHandle, targetHandle } = req.body;
    
    // Check if workflow exists and belongs to user
    const workflow = await Workflow.findOne({
      where: {
        id: workflowId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Check if source node exists
    const sourceNode = await Node.findOne({
      where: {
        id: sourceNodeId,
        workflowId,
      },
    });
    
    if (!sourceNode) {
      const error = new Error('Source node not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Check if target node exists
    const targetNode = await Node.findOne({
      where: {
        id: targetNodeId,
        workflowId,
      },
    });
    
    if (!targetNode) {
      const error = new Error('Target node not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Create connection
    const connection = await Connection.create({
      id: uuidv4(),
      workflowId,
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle,
    });
    
    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// Delete connection
export const deleteConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find connection and check if it belongs to user's workflow
    const connection = await Connection.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Workflow,
          as: 'workflow',
          where: {
            ownerId: req.body.userId, // In a real app, this would come from auth middleware
          },
        },
      ],
    });
    
    if (!connection) {
      const error = new Error('Connection not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Delete connection
    await connection.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Trigger node execution
export const triggerNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentUrls } = req.body;
    
    // Find node and check if it belongs to user's workflow
    const node = await Node.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Workflow,
          as: 'workflow',
          where: {
            ownerId: req.body.userId, // In a real app, this would come from auth middleware
          },
        },
      ],
    });
    
    if (!node) {
      const error = new Error('Node not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Parse node config
    const config = JSON.parse(node.config);
    
    // Execute node based on type
    let result;
    
    switch (node.type) {
      case 'transformation':
        result = await executeTransformationNode(node, documentUrls, config);
        break;
      case 'comparison':
        result = await executeComparisonNode(node, documentUrls, config);
        break;
      case 'simetrik_integration':
        result = await executeSimetrikIntegrationNode(node, documentUrls, config);
        break;
      case 'communication':
        result = await executeCommunicationNode(node, documentUrls, config);
        break;
      default:
        const error = new Error('Invalid node type') as Error & { status?: number };
        error.status = 400;
        throw error;
    }
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Execute transformation node
const executeTransformationNode = async (node: Node, documentUrls: string[], config: any) => {
  try {
    // Get documents content
    const documents = await Promise.all(
      documentUrls.map(async (url) => {
        const documentId = url.split('/').pop();
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          throw new Error(`Document not found: ${documentId}`);
        }
        
        // Get document content from S3
        const params = {
          Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
          Key: document.url.replace(`https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`, ''),
        };
        
        const s3Object = await s3.getObject(params).promise();
        const content = s3Object.Body?.toString('utf-8') || '';
        
        return {
          id: document.id,
          name: document.name,
          type: document.type,
          content,
        };
      })
    );
    
    // Call Claude API for transformation
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `
              I need you to transform the following documents based on this instruction:
              
              Instruction: ${config.instruction || ''}
              
              Output Template: ${config.outputTemplate || ''}
              
              Documents:
              ${documents.map((doc) => `Document: ${doc.name}\nContent: ${doc.content}`).join('\n\n')}
              
              Please provide the transformed output following the template.
            `,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );
    
    const transformedContent = claudeResponse.data.content[0].text;
    
    // Save transformed document to S3
    const fileName = `${node.name}-${new Date().toISOString()}.txt`;
    const s3Key = `transformations/${node.workflowId}/${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
      Key: s3Key,
      Body: transformedContent,
      ContentType: 'text/plain',
    };
    
    const uploadResult = await s3.upload(uploadParams).promise();
    
    // Create document record
    const transformedDocument = await Document.create({
      id: uuidv4(),
      name: fileName,
      type: 'text/plain',
      size: transformedContent.length,
      url: uploadResult.Location,
      folderId: 'transformations', // This would be a real folder ID in production
      ownerId: node.workflow.ownerId,
    });
    
    return {
      nodeId: node.id,
      documentId: transformedDocument.id,
      documentUrl: transformedDocument.url,
    };
  } catch (error) {
    console.error('Error executing transformation node:', error);
    throw error;
  }
};

// Execute comparison node
const executeComparisonNode = async (node: Node, documentUrls: string[], config: any) => {
  try {
    // Get documents content
    const documents = await Promise.all(
      documentUrls.map(async (url) => {
        const documentId = url.split('/').pop();
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          throw new Error(`Document not found: ${documentId}`);
        }
        
        // Get document content from S3
        const params = {
          Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
          Key: document.url.replace(`https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`, ''),
        };
        
        const s3Object = await s3.getObject(params).promise();
        const content = s3Object.Body?.toString('utf-8') || '';
        
        return {
          id: document.id,
          name: document.name,
          type: document.type,
          content,
        };
      })
    );
    
    if (documents.length !== 2) {
      throw new Error('Comparison node requires exactly 2 documents');
    }
    
    // Call Claude API for comparison
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `
              I need you to compare the following two documents and produce a flags report based on this instruction:
              
              Instruction: ${config.instruction || ''}
              
              Document 1: ${documents[0].name}
              Content: ${documents[0].content}
              
              Document 2: ${documents[1].name}
              Content: ${documents[1].content}
              
              Please provide a detailed flags report with green, yellow, and red flags after running a consistency and integrity check between the two documents.
            `,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );
    
    const comparisonContent = claudeResponse.data.content[0].text;
    
    // Save comparison document to S3
    const fileName = `${node.name}-${new Date().toISOString()}.txt`;
    const s3Key = `comparisons/${node.workflowId}/${fileName}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || 'simetrik-documents',
      Key: s3Key,
      Body: comparisonContent,
      ContentType: 'text/plain',
    };
    
    const uploadResult = await s3.upload(uploadParams).promise();
    
    // Create document record
    const comparisonDocument = await Document.create({
      id: uuidv4(),
      name: fileName,
      type: 'text/plain',
      size: comparisonContent.length,
      url: uploadResult.Location,
      folderId: 'comparisons', // This would be a real folder ID in production
      ownerId: node.workflow.ownerId,
    });
    
    return {
      nodeId: node.id,
      documentId: comparisonDocument.id,
      documentUrl: comparisonDocument.url,
    };
  } catch (error) {
    console.error('Error executing comparison node:', error);
    throw error;
  }
};

// Execute Simetrik integration node
const executeSimetrikIntegrationNode = async (node: Node, documentUrls: string[], config: any) => {
  // This is a placeholder implementation
  return {
    nodeId: node.id,
    message: 'Simetrik integration node execution not fully implemented',
  };
};

// Execute communication node
const executeCommunicationNode = async (node: Node, documentUrls: string[], config: any) => {
  // This is a placeholder implementation
  return {
    nodeId: node.id,
    message: 'Communication node execution not fully implemented',
  };
};
