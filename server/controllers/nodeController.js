const { Node, Edge, NodeExecution, Document } = require('../models');
const workflowService = require('../utils/workflowService');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Create a new node
exports.createNode = async (req, res) => {
  try {
    const { name, type, position, data, workflowId } = req.body;
    
    // Validate required fields
    if (!type || !workflowId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Type and workflowId are required' 
      });
    }
    
    // Create node
    const result = await workflowService.createNode(
      workflowId,
      type,
      name,
      position,
      data
    );
    
    if (!result.success) {
      return res.status(400).json({ error: true, message: result.error });
    }
    
    res.status(201).json({
      success: true,
      node: result.node
    });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get nodes by workflow
exports.getNodesByWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const nodes = await Node.findAll({
      where: { workflowId },
      include: [
        { 
          model: Edge, 
          as: 'outgoingEdges',
          include: [{ model: Node, as: 'target', attributes: ['id', 'name', 'type'] }]
        },
        { 
          model: Edge, 
          as: 'incomingEdges',
          include: [{ model: Node, as: 'source', attributes: ['id', 'name', 'type'] }]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: nodes.length,
      nodes
    });
  } catch (error) {
    console.error('Error fetching nodes by workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get node by ID
exports.getNodeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id, {
      include: [
        { 
          model: Edge, 
          as: 'outgoingEdges',
          include: [{ model: Node, as: 'target', attributes: ['id', 'name', 'type'] }]
        },
        { 
          model: Edge, 
          as: 'incomingEdges',
          include: [{ model: Node, as: 'source', attributes: ['id', 'name', 'type'] }]
        }
      ]
    });
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    res.status(200).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error fetching node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update node
exports.updateNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, data } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    // Update node properties
    await node.update({
      name: name || node.name,
      position: position || node.position,
      data: data || node.data
    });
    
    res.status(200).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete node
exports.deleteNode = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    // Delete the node (this will also delete associated edges due to cascade)
    await node.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Node deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute node
exports.executeNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputDocuments } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    // Validate input documents
    if (!inputDocuments || !Array.isArray(inputDocuments)) {
      return res.status(400).json({ 
        error: true, 
        message: 'Input documents must be an array of document URLs' 
      });
    }
    
    // Create execution record
    const execution = await NodeExecution.create({
      nodeId: id,
      status: 'running',
      inputDocuments
    });
    
    // Execute node based on type
    let result;
    try {
      switch (node.type) {
        case 'transformation':
          result = await workflowService.executeTransformationNode(id, inputDocuments);
          break;
        case 'comparison':
          result = await workflowService.executeComparisonNode(id, inputDocuments);
          break;
        case 'simetrik_integration':
          result = await workflowService.executeSimetrikIntegrationNode(id, inputDocuments);
          break;
        case 'communication':
          result = await workflowService.executeCommunicationNode(id, inputDocuments);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update execution record
      await execution.update({
        status: 'completed',
        outputDocuments: result.outputDocuments,
        executionTime: Date.now() - new Date(execution.createdAt).getTime()
      });
      
      res.status(200).json({
        success: true,
        execution: {
          id: execution.id,
          status: 'completed',
          inputDocuments,
          outputDocuments: result.outputDocuments
        }
      });
    } catch (error) {
      // Update execution record with error
      await execution.update({
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - new Date(execution.createdAt).getTime()
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Error executing node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get node execution history
exports.getNodeExecutionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    // Get execution history for this node
    const executions = await NodeExecution.findAll({
      where: { nodeId: id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: executions.length,
      executions
    });
  } catch (error) {
    console.error('Error fetching node execution history:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Create edge between nodes
exports.createEdge = async (req, res) => {
  try {
    const { sourceId, targetId, sourceHandle, targetHandle, workflowId } = req.body;
    
    // Validate required fields
    if (!sourceId || !targetId || !workflowId) {
      return res.status(400).json({ 
        error: true, 
        message: 'SourceId, targetId, and workflowId are required' 
      });
    }
    
    // Create edge
    const result = await workflowService.createEdge(
      workflowId,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle
    );
    
    if (!result.success) {
      return res.status(400).json({ error: true, message: result.error });
    }
    
    res.status(201).json({
      success: true,
      edge: result.edge
    });
  } catch (error) {
    console.error('Error creating edge:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update edge
exports.updateEdge = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceHandle, targetHandle, data } = req.body;
    
    const edge = await Edge.findByPk(id);
    
    if (!edge) {
      return res.status(404).json({ error: true, message: 'Edge not found' });
    }
    
    // Update edge properties
    await edge.update({
      sourceHandle: sourceHandle !== undefined ? sourceHandle : edge.sourceHandle,
      targetHandle: targetHandle !== undefined ? targetHandle : edge.targetHandle,
      data: data || edge.data
    });
    
    res.status(200).json({
      success: true,
      edge
    });
  } catch (error) {
    console.error('Error updating edge:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete edge
exports.deleteEdge = async (req, res) => {
  try {
    const { id } = req.params;
    
    const edge = await Edge.findByPk(id);
    
    if (!edge) {
      return res.status(404).json({ error: true, message: 'Edge not found' });
    }
    
    // Delete the edge
    await edge.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Edge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting edge:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get edges by workflow
exports.getEdgesByWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const edges = await Edge.findAll({
      where: { workflowId },
      include: [
        { model: Node, as: 'source', attributes: ['id', 'name', 'type'] },
        { model: Node, as: 'target', attributes: ['id', 'name', 'type'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: edges.length,
      edges
    });
  } catch (error) {
    console.error('Error fetching edges by workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
