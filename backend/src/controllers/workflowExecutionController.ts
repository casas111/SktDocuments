import { Request, Response, NextFunction } from 'express';
import Node from '../models/Node';
import Workflow from '../models/Workflow';
import Connection from '../models/Connection';
import Document from '../models/Document';
import { claudeApiClient } from '../services/claudeApiService';
import { uploadToS3, getFromS3 } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';

// Execute workflow
export const executeWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workflowId, documentIds } = req.body;
    
    if (!workflowId) {
      const error = new Error('Workflow ID is required') as Error & { status?: number };
      error.status = 400;
      throw error;
    }
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      const error = new Error('At least one document ID is required') as Error & { status?: number };
      error.status = 400;
      throw error;
    }
    
    // Get workflow
    const workflow = await Workflow.findOne({
      where: {
        id: workflowId,
        ownerId: req.body.userId, // In a real app, this would come from auth middleware
      },
      include: ['nodes', 'connections'],
    });
    
    if (!workflow) {
      const error = new Error('Workflow not found') as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    
    // Get documents
    const documents = await Promise.all(
      documentIds.map(async (id: string) => {
        const document = await Document.findOne({
          where: {
            id,
            ownerId: req.body.userId, // In a real app, this would come from auth middleware
          },
        });
        
        if (!document) {
          throw new Error(`Document not found: ${id}`);
        }
        
        return document;
      })
    );
    
    // Execute workflow
    const executionResult = await executeWorkflowNodes(workflow, documents);
    
    res.status(200).json({
      success: true,
      data: executionResult,
    });
  } catch (error) {
    next(error);
  }
};

// Execute workflow nodes
const executeWorkflowNodes = async (workflow: any, documents: any[]) => {
  try {
    // Get nodes and connections
    const nodes = workflow.nodes || [];
    const connections = workflow.connections || [];
    
    // Find start nodes (nodes with no incoming connections)
    const startNodeIds = nodes
      .filter((node: any) => !connections.some((conn: any) => conn.targetNodeId === node.id))
      .map((node: any) => node.id);
    
    if (startNodeIds.length === 0) {
      throw new Error('No start nodes found in workflow');
    }
    
    // Initialize execution context
    const executionContext: any = {
      workflowId: workflow.id,
      nodeResults: {},
      documentMap: {},
    };
    
    // Add input documents to context
    documents.forEach((doc) => {
      executionContext.documentMap[doc.id] = doc;
    });
    
    // Execute nodes starting from start nodes
    const results = await Promise.all(
      startNodeIds.map((nodeId: string) => executeNode(nodeId, nodes, connections, executionContext))
    );
    
    return {
      workflowId: workflow.id,
      results: executionContext.nodeResults,
    };
  } catch (error) {
    console.error('Error executing workflow:', error);
    throw error;
  }
};

// Execute a single node and its downstream nodes
const executeNode = async (
  nodeId: string,
  allNodes: any[],
  connections: any[],
  executionContext: any
): Promise<any> => {
  try {
    // Check if node has already been executed
    if (executionContext.nodeResults[nodeId]) {
      return executionContext.nodeResults[nodeId];
    }
    
    // Get node
    const node = allNodes.find((n: any) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    
    // Get incoming connections
    const incomingConnections = connections.filter((conn: any) => conn.targetNodeId === nodeId);
    
    // Get input documents from incoming connections
    const inputDocuments: any[] = [];
    
    // If there are incoming connections, execute upstream nodes first
    if (incomingConnections.length > 0) {
      await Promise.all(
        incomingConnections.map(async (conn: any) => {
          // Execute source node if not already executed
          if (!executionContext.nodeResults[conn.sourceNodeId]) {
            await executeNode(conn.sourceNodeId, allNodes, connections, executionContext);
          }
          
          // Get result document from source node
          const sourceNodeResult = executionContext.nodeResults[conn.sourceNodeId];
          if (sourceNodeResult && sourceNodeResult.outputDocumentId) {
            const outputDoc = executionContext.documentMap[sourceNodeResult.outputDocumentId];
            if (outputDoc) {
              inputDocuments.push(outputDoc);
            }
          }
        })
      );
    } else {
      // If no incoming connections, use the initial input documents
      Object.values(executionContext.documentMap).forEach((doc: any) => {
        if (!doc.isOutput) {
          inputDocuments.push(doc);
        }
      });
    }
    
    // Execute node based on type
    let result;
    
    switch (node.type) {
      case 'transformation':
        result = await executeTransformationNode(node, inputDocuments, executionContext);
        break;
      case 'comparison':
        result = await executeComparisonNode(node, inputDocuments, executionContext);
        break;
      case 'simetrik_integration':
        result = await executeSimetrikIntegrationNode(node, inputDocuments, executionContext);
        break;
      case 'communication':
        result = await executeCommunicationNode(node, inputDocuments, executionContext);
        break;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
    
    // Store result in execution context
    executionContext.nodeResults[nodeId] = result;
    
    // If node produced an output document, add it to the document map
    if (result.outputDocumentId) {
      const outputDoc = await Document.findByPk(result.outputDocumentId);
      if (outputDoc) {
        outputDoc.isOutput = true;
        executionContext.documentMap[outputDoc.id] = outputDoc;
      }
    }
    
    // Execute downstream nodes
    const outgoingConnections = connections.filter((conn: any) => conn.sourceNodeId === nodeId);
    
    await Promise.all(
      outgoingConnections.map(async (conn: any) => {
        await executeNode(conn.targetNodeId, allNodes, connections, executionContext);
      })
    );
    
    return result;
  } catch (error) {
    console.error(`Error executing node ${nodeId}:`, error);
    throw error;
  }
};

// Execute transformation node
const executeTransformationNode = async (node: any, inputDocuments: any[], executionContext: any) => {
  try {
    // Parse node config
    const config = JSON.parse(node.config);
    
    // Get document contents
    const documentContents = await Promise.all(
      inputDocuments.map(async (doc) => {
        try {
          // Extract S3 key from URL
          const url = new URL(doc.url);
          const key = url.pathname.substring(1); // Remove leading slash
          
          // Get document content from S3
          const s3Object = await getFromS3(key);
          return s3Object.Body?.toString('utf-8') || '';
        } catch (error) {
          console.error(`Error getting document content for ${doc.id}:`, error);
          return '';
        }
      })
    );
    
    // Call Claude API for transformation
    const transformedContent = await claudeApiClient.transformDocuments(
      documentContents,
      config.instruction || '',
      config.outputTemplate
    );
    
    // Save transformed document to S3
    const fileName = `${node.name}-${new Date().toISOString()}.txt`;
    const s3Key = `transformations/${executionContext.workflowId}/${fileName}`;
    
    const uploadResult = await uploadToS3(
      Buffer.from(transformedContent),
      fileName,
      'text/plain',
      `transformations/${executionContext.workflowId}`
    );
    
    // Create document record
    const transformedDocument = await Document.create({
      id: uuidv4(),
      name: fileName,
      type: 'text/plain',
      size: transformedContent.length,
      url: uploadResult,
      folderId: null, // This would be a real folder ID in production
      ownerId: node.workflow.ownerId,
    });
    
    return {
      nodeId: node.id,
      status: 'success',
      outputDocumentId: transformedDocument.id,
      outputDocumentUrl: transformedDocument.url,
    };
  } catch (error) {
    console.error('Error executing transformation node:', error);
    return {
      nodeId: node.id,
      status: 'error',
      error: error.message,
    };
  }
};

// Execute comparison node
const executeComparisonNode = async (node: any, inputDocuments: any[], executionContext: any) => {
  try {
    // Parse node config
    const config = JSON.parse(node.config);
    
    // Need exactly 2 documents for comparison
    if (inputDocuments.length !== 2) {
      throw new Error('Comparison node requires exactly 2 input documents');
    }
    
    // Get document contents
    const documentContents = await Promise.all(
      inputDocuments.map(async (doc) => {
        try {
          // Extract S3 key from URL
          const url = new URL(doc.url);
          const key = url.pathname.substring(1); // Remove leading slash
          
          // Get document content from S3
          const s3Object = await getFromS3(key);
          return s3Object.Body?.toString('utf-8') || '';
        } catch (error) {
          console.error(`Error getting document content for ${doc.id}:`, error);
          return '';
        }
      })
    );
    
    // Call Claude API for comparison
    const comparisonContent = await claudeApiClient.compareDocuments(
      documentContents[0],
      documentContents[1],
      config.instruction || ''
    );
    
    // Save comparison document to S3
    const fileName = `${node.name}-${new Date().toISOString()}.txt`;
    const s3Key = `comparisons/${executionContext.workflowId}/${fileName}`;
    
    const uploadResult = await uploadToS3(
      Buffer.from(comparisonContent),
      fileName,
      'text/plain',
      `comparisons/${executionContext.workflowId}`
    );
    
    // Create document record
    const comparisonDocument = await Document.create({
      id: uuidv4(),
      name: fileName,
      type: 'text/plain',
      size: comparisonContent.length,
      url: uploadResult,
      folderId: null, // This would be a real folder ID in production
      ownerId: node.workflow.ownerId,
    });
    
    return {
      nodeId: node.id,
      status: 'success',
      outputDocumentId: comparisonDocument.id,
      outputDocumentUrl: comparisonDocument.url,
    };
  } catch (error) {
    console.error('Error executing comparison node:', error);
    return {
      nodeId: node.id,
      status: 'error',
      error: error.message,
    };
  }
};

// Execute Simetrik integration node
const executeSimetrikIntegrationNode = async (node: any, inputDocuments: any[], executionContext: any) => {
  try {
    // Parse node config
    const config = JSON.parse(node.config);
    
    // This is a placeholder implementation
    // In a real implementation, this would integrate with Simetrik services
    
    return {
      nodeId: node.id,
      status: 'success',
      message: 'Simetrik integration node execution completed',
    };
  } catch (error) {
    console.error('Error executing Simetrik integration node:', error);
    return {
      nodeId: node.id,
      status: 'error',
      error: error.message,
    };
  }
};

// Execute communication node
const executeCommunicationNode = async (node: any, inputDocuments: any[], executionContext: any) => {
  try {
    // Parse node config
    const config = JSON.parse(node.config);
    
    // This is a placeholder implementation
    // In a real implementation, this would send emails, notifications, etc.
    
    return {
      nodeId: node.id,
      status: 'success',
      message: 'Communication node execution completed',
    };
  } catch (error) {
    console.error('Error executing communication node:', error);
    return {
      nodeId: node.id,
      status: 'error',
      error: error.message,
    };
  }
};
