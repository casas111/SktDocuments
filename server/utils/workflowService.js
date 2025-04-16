const { Workflow, Node, Edge, Document } = require('../models');
const fileStorageService = require('../utils/fileStorageService');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class WorkflowService {
  constructor() {
    this.baseUploadDir = path.join(__dirname, '../../uploads');
    this.transformationsDir = path.join(this.baseUploadDir, 'transformations');
    this.comparisonsDir = path.join(this.baseUploadDir, 'comparisons');
    this.simetrikIntegrationsDir = path.join(this.baseUploadDir, 'simetrik_integrations');
    this.communicationsDir = path.join(this.baseUploadDir, 'communications');
    
    // Ensure directories exist
    fileStorageService.ensureDirectoryExists(this.transformationsDir);
    fileStorageService.ensureDirectoryExists(this.comparisonsDir);
    fileStorageService.ensureDirectoryExists(this.simetrikIntegrationsDir);
    fileStorageService.ensureDirectoryExists(this.communicationsDir);
  }
  
  // Create a new workflow
  async createWorkflow(name, description) {
    try {
      const workflow = await Workflow.create({
        name,
        description: description || '',
        canvasData: { nodes: [], edges: [] }
      });
      
      return {
        success: true,
        workflow
      };
    } catch (error) {
      console.error('Error creating workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get workflow by ID
  async getWorkflow(workflowId) {
    try {
      const workflow = await Workflow.findByPk(workflowId, {
        include: [
          { model: Node, as: 'nodes' },
          { model: Edge, as: 'edges' }
        ]
      });
      
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow not found'
        };
      }
      
      return {
        success: true,
        workflow
      };
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Update workflow canvas data
  async updateWorkflowCanvas(workflowId, canvasData) {
    try {
      const workflow = await Workflow.findByPk(workflowId);
      
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow not found'
        };
      }
      
      // Update workflow canvas data
      await workflow.update({ canvasData });
      
      // Sync nodes and edges with database
      await this.syncNodesAndEdges(workflowId, canvasData);
      
      return {
        success: true,
        workflow
      };
    } catch (error) {
      console.error('Error updating workflow canvas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Sync nodes and edges with database
  async syncNodesAndEdges(workflowId, canvasData) {
    try {
      const { nodes = [], edges = [] } = canvasData;
      
      // Get existing nodes and edges
      const existingNodes = await Node.findAll({ where: { workflowId } });
      const existingEdges = await Edge.findAll({ where: { workflowId } });
      
      // Create or update nodes
      for (const nodeData of nodes) {
        const existingNode = existingNodes.find(n => n.id === nodeData.id);
        
        if (existingNode) {
          // Update existing node
          await existingNode.update({
            name: nodeData.data?.name || existingNode.name,
            type: nodeData.type || existingNode.type,
            position: nodeData.position || existingNode.position,
            data: nodeData.data || existingNode.data
          });
        } else {
          // Create new node
          await Node.create({
            id: nodeData.id || uuidv4(),
            name: nodeData.data?.name || 'Unnamed Node',
            type: nodeData.type,
            position: nodeData.position || { x: 0, y: 0 },
            data: nodeData.data || {},
            workflowId
          });
        }
      }
      
      // Create or update edges
      for (const edgeData of edges) {
        const existingEdge = existingEdges.find(e => e.id === edgeData.id);
        
        if (existingEdge) {
          // Update existing edge
          await existingEdge.update({
            sourceId: edgeData.source,
            targetId: edgeData.target,
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle,
            data: edgeData.data || existingEdge.data
          });
        } else {
          // Create new edge
          await Edge.create({
            id: edgeData.id || uuidv4(),
            sourceId: edgeData.source,
            targetId: edgeData.target,
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle,
            data: edgeData.data || {},
            workflowId
          });
        }
      }
      
      // Delete nodes that are no longer in canvas
      const nodeIdsInCanvas = nodes.map(n => n.id);
      for (const existingNode of existingNodes) {
        if (!nodeIdsInCanvas.includes(existingNode.id)) {
          await existingNode.destroy();
        }
      }
      
      // Delete edges that are no longer in canvas
      const edgeIdsInCanvas = edges.map(e => e.id);
      for (const existingEdge of existingEdges) {
        if (!edgeIdsInCanvas.includes(existingEdge.id)) {
          await existingEdge.destroy();
        }
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error syncing nodes and edges:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create a node
  async createNode(workflowId, nodeType, name, position, data) {
    try {
      const workflow = await Workflow.findByPk(workflowId);
      
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow not found'
        };
      }
      
      // Validate node type
      const validTypes = ['transformation', 'comparison', 'simetrik_integration', 'communication'];
      if (!validTypes.includes(nodeType)) {
        return {
          success: false,
          error: `Invalid node type. Must be one of: ${validTypes.join(', ')}`
        };
      }
      
      // Create node
      const node = await Node.create({
        id: uuidv4(),
        name: name || 'Unnamed Node',
        type: nodeType,
        position: position || { x: 0, y: 0 },
        data: data || {},
        workflowId
      });
      
      // Update workflow canvas data
      const canvasData = workflow.canvasData || { nodes: [], edges: [] };
      canvasData.nodes.push({
        id: node.id,
        type: nodeType,
        position: position || { x: 0, y: 0 },
        data: {
          name: name || 'Unnamed Node',
          ...data
        }
      });
      
      await workflow.update({ canvasData });
      
      return {
        success: true,
        node
      };
    } catch (error) {
      console.error('Error creating node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create an edge between nodes
  async createEdge(workflowId, sourceId, targetId, sourceHandle, targetHandle) {
    try {
      const workflow = await Workflow.findByPk(workflowId);
      
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow not found'
        };
      }
      
      // Check if source node exists
      const sourceNode = await Node.findByPk(sourceId);
      if (!sourceNode) {
        return {
          success: false,
          error: 'Source node not found'
        };
      }
      
      // Check if target node exists
      const targetNode = await Node.findByPk(targetId);
      if (!targetNode) {
        return {
          success: false,
          error: 'Target node not found'
        };
      }
      
      // Create edge
      const edgeId = uuidv4();
      const edge = await Edge.create({
        id: edgeId,
        sourceId,
        targetId,
        sourceHandle,
        targetHandle,
        workflowId,
        data: {}
      });
      
      // Update workflow canvas data
      const canvasData = workflow.canvasData || { nodes: [], edges: [] };
      canvasData.edges.push({
        id: edgeId,
        source: sourceId,
        target: targetId,
        sourceHandle,
        targetHandle
      });
      
      await workflow.update({ canvasData });
      
      return {
        success: true,
        edge
      };
    } catch (error) {
      console.error('Error creating edge:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Execute a transformation node
  async executeTransformationNode(nodeId, inputDocuments) {
    try {
      const node = await Node.findByPk(nodeId);
      
      if (!node) {
        return {
          success: false,
          error: 'Node not found'
        };
      }
      
      if (node.type !== 'transformation') {
        return {
          success: false,
          error: 'Node is not a transformation node'
        };
      }
      
      // Validate input documents
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
        return {
          success: false,
          error: 'Input documents must be a non-empty array of document URLs'
        };
      }
      
      // Get document contents
      const documentContents = [];
      for (const documentUrl of inputDocuments) {
        const documentId = documentUrl.split('/').pop();
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          return {
            success: false,
            error: `Document not found: ${documentUrl}`
          };
        }
        
        // Read document content
        const readResult = await fileStorageService.readFile(document.path);
        
        if (!readResult.success) {
          return {
            success: false,
            error: `Error reading document: ${readResult.error}`
          };
        }
        
        documentContents.push({
          id: document.id,
          name: document.name,
          content: readResult.content,
          type: document.type
        });
      }
      
      // In a real implementation, this would call Claude API
      // For now, we'll create a simple transformation result
      const transformationResult = `Transformation result for node ${node.name}:\n\n`;
      const transformationDetails = documentContents.map(doc => 
        `Document: ${doc.name}\nContent: ${doc.content.substring(0, 100)}...`
      ).join('\n\n');
      
      const resultContent = transformationResult + transformationDetails;
      
      // Create output document
      const outputResult = await fileStorageService.createTransformationOutput(
        node.name,
        resultContent
      );
      
      if (!outputResult.success) {
        return {
          success: false,
          error: `Error creating output document: ${outputResult.error}`
        };
      }
      
      // Create document record in database
      const outputDocument = await Document.create({
        name: path.basename(outputResult.path),
        path: outputResult.path,
        type: outputResult.type,
        size: outputResult.size,
        content: resultContent,
        url: `/api/documents/${uuidv4()}`
      });
      
      return {
        success: true,
        outputDocuments: [outputDocument.url]
      };
    } catch (error) {
      console.error('Error executing transformation node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Execute a comparison node
  async executeComparisonNode(nodeId, inputDocuments) {
    try {
      const node = await Node.findByPk(nodeId);
      
      if (!node) {
        return {
          success: false,
          error: 'Node not found'
        };
      }
      
      if (node.type !== 'comparison') {
        return {
          success: false,
          error: 'Node is not a comparison node'
        };
      }
      
      // Validate input documents
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length !== 2) {
        return {
          success: false,
          error: 'Comparison node requires exactly 2 input documents'
        };
      }
      
      // Get document contents
      const documentContents = [];
      for (const documentUrl of inputDocuments) {
        const documentId = documentUrl.split('/').pop();
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          return {
            success: false,
            error: `Document not found: ${documentUrl}`
          };
        }
        
        // Read document content
        const readResult = await fileStorageService.readFile(document.path);
        
        if (!readResult.success) {
          return {
            success: false,
            error: `Error reading document: ${readResult.error}`
          };
        }
        
        documentContents.push({
          id: document.id,
          name: document.name,
          content: readResult.content,
          type: document.type
        });
      }
      
      // In a real implementation, this would call Claude API
      // For now, we'll create a simple comparison result
      const comparisonResult = `Comparison result for node ${node.name}:\n\n`;
      const doc1 = documentContents[0];
      const doc2 = documentContents[1];
      
      const resultContent = `${comparisonResult}
Document 1: ${doc1.name}
Document 2: ${doc2.name}

Comparison Summary:
- Green Flags: Both documents appear to be consistent in format and structure.
- Yellow Flags: Some minor differences in content length.
- Red Flags: None detected.

Details:
Document 1 content (excerpt): ${doc1.content.substring(0, 100)}...
Document 2 content (excerpt): ${doc2.content.substring(0, 100)}...
`;
      
      // Create output document
      const outputResult = await fileStorageService.createComparisonOutput(
        node.name,
        resultContent
      );
      
      if (!outputResult.success) {
        return {
          success: false,
          error: `Error creating output document: ${outputResult.error}`
        };
      }
      
      // Create document record in database
      const outputDocument = await Document.create({
        name: path.basename(outputResult.path),
        path: outputResult.path,
        type: outputResult.type,
        size: outputResult.size,
        content: resultContent,
        url: `/api/documents/${uuidv4()}`
      });
      
      return {
        success: true,
        outputDocuments: [outputDocument.url]
      };
    } catch (error) {
      console.error('Error executing comparison node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Execute a Simetrik integration node
  async executeSimetrikIntegrationNode(nodeId, inputDocuments) {
    try {
      const node = await Node.findByPk(nodeId);
      
      if (!node) {
        return {
          success: false,
          error: 'Node not found'
        };
      }
      
      if (node.type !== 'simetrik_integration') {
        return {
          success: false,
          error: 'Node is not a Simetrik integration node'
        };
      }
      
      // Validate input documents
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
        return {
          success: false,
          error: 'Input documents must be a non-empty array of document URLs'
        };
      }
      
      // Basic implementation for Simetrik integration
      const csvContent = 'id,name,value\n1,test,100\n2,example,200\n3,sample,300';
      
      // Create output document
      const outputResult = await fileStorageService.createSimetrikIntegrationOutput(
        node.name,
        csvContent
      );
      
      if (!outputResult.success) {
        return {
          success: false,
          error: `Error creating output document: ${outputResult.error}`
        };
      }
      
      // Create document record in database
      const outputDocument = await Document.create({
        name: path.basename(outputResult.path),
        path: outputResult.path,
        type: outputResult.type,
        size: outputResult.size,
        content: csvContent,
        url: `/api/documents/${uuidv4()}`
      });
      
      return {
        success: true,
        outputDocuments: [outputDocument.url]
      };
    } catch (error) {
      console.error('Error executing Simetrik integration node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Execute a communication node
  async executeCommunicationNode(nodeId, inputDocuments) {
    try {
      const node = await Node.findByPk(nodeId);
      
      if (!node) {
        return {
          success: false,
          error: 'Node not found'
        };
      }
      
      if (node.type !== 'communication') {
        return {
          success: false,
          error: 'Node is not a communication node'
        };
      }
      
      // Validate input documents
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
        return {
          success: false,
          error: 'Input documents must be a non-empty array of document URLs'
        };
      }
      
      // Basic implementation for communication node
      const communicationResult = `Communication result for node ${node.name}:\n\n`;
      const resultContent = `${communicationResult}
This is a basic implementation of the communication node.
In a real implementation, this would handle external communication.

Input documents: ${inputDocuments.join(', ')}
`;
      
      // Create output document
      const outputResult = await fileStorageService.createCommunicationOutput(
        node.name,
        resultContent
      );
      
      if (!outputResult.success) {
        return {
          success: false,
          error: `Error creating output document: ${outputResult.error}`
        };
      }
      
      // Create document record in database
      const outputDocument = await Document.create({
        name: path.basename(outputResult.path),
        path: outputResult.path,
        type: outputResult.type,
        size: outputResult.size,
        content: resultContent,
        url: `/api/documents/${uuidv4()}`
      });
      
      return {
        success: true,
        outputDocuments: [outputDocument.url]
      };
    } catch (error) {
      console.error('Error executing communication node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WorkflowService();
