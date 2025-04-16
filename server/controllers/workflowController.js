const workflowService = require('../utils/workflowService');
const { Workflow, Node, Edge, NodeExecution, Document } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Create a new workflow
exports.createWorkflow = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate workflow name
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: true, message: 'Workflow name is required' });
    }
    
    // Create workflow
    const result = await workflowService.createWorkflow(name, description);
    
    if (!result.success) {
      return res.status(500).json({ error: true, message: result.error });
    }
    
    res.status(201).json({
      success: true,
      workflow: result.workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all workflows
exports.getAllWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json({
      success: true,
      count: workflows.length,
      workflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get workflow by ID
exports.getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await workflowService.getWorkflow(id);
    
    if (!result.success) {
      return res.status(404).json({ error: true, message: result.error });
    }
    
    res.status(200).json({
      success: true,
      workflow: result.workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update workflow
exports.updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).json({ error: true, message: 'Workflow not found' });
    }
    
    // Update workflow properties
    await workflow.update({
      name: name || workflow.name,
      description: description !== undefined ? description : workflow.description
    });
    
    res.status(200).json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).json({ error: true, message: 'Workflow not found' });
    }
    
    // Delete the workflow (cascade will delete nodes and edges)
    await workflow.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get workflow canvas data
exports.getWorkflowCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflow = await Workflow.findByPk(id, {
      attributes: ['id', 'name', 'description', 'canvasData']
    });
    
    if (!workflow) {
      return res.status(404).json({ error: true, message: 'Workflow not found' });
    }
    
    res.status(200).json({
      success: true,
      canvas: workflow.canvasData
    });
  } catch (error) {
    console.error('Error fetching workflow canvas:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update workflow canvas data
exports.updateWorkflowCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const { canvasData } = req.body;
    
    // Validate canvas data
    if (!canvasData || typeof canvasData !== 'object') {
      return res.status(400).json({ error: true, message: 'Invalid canvas data format' });
    }
    
    const result = await workflowService.updateWorkflowCanvas(id, canvasData);
    
    if (!result.success) {
      return res.status(500).json({ error: true, message: result.error });
    }
    
    res.status(200).json({
      success: true,
      message: 'Workflow canvas updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow canvas:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute workflow
exports.executeWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflow = await Workflow.findByPk(id, {
      include: [
        { model: Node, as: 'nodes' },
        { model: Edge, as: 'edges' }
      ]
    });
    
    if (!workflow) {
      return res.status(404).json({ error: true, message: 'Workflow not found' });
    }
    
    // Find starting nodes (nodes with no incoming edges)
    const startingNodes = workflow.nodes.filter(node => {
      return !workflow.edges.some(edge => edge.targetId === node.id);
    });
    
    if (startingNodes.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Workflow has no starting nodes' 
      });
    }
    
    // Start execution of each starting node
    const executionPromises = startingNodes.map(node => executeNode(node, workflow));
    
    // Wait for all starting nodes to complete
    await Promise.all(executionPromises);
    
    res.status(200).json({
      success: true,
      message: 'Workflow execution started successfully'
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get workflow execution history
exports.getWorkflowExecutionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflow = await Workflow.findByPk(id);
    
    if (!workflow) {
      return res.status(404).json({ error: true, message: 'Workflow not found' });
    }
    
    // Get all nodes for this workflow
    const nodes = await Node.findAll({
      where: { workflowId: id }
    });
    
    const nodeIds = nodes.map(node => node.id);
    
    // Get execution history for all nodes in this workflow
    const executions = await NodeExecution.findAll({
      where: {
        nodeId: {
          [Op.in]: nodeIds
        }
      },
      include: [
        { model: Node, as: 'node' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: executions.length,
      executions
    });
  } catch (error) {
    console.error('Error fetching workflow execution history:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Helper function to execute a node
const executeNode = async (node, workflow) => {
  try {
    // Create execution record
    const execution = await NodeExecution.create({
      nodeId: node.id,
      status: 'running',
      inputDocuments: []
    });
    
    // Execute node based on type
    let result;
    switch (node.type) {
      case 'transformation':
        result = await workflowService.executeTransformationNode(node.id, node.data?.inputDocuments || []);
        break;
      case 'comparison':
        result = await workflowService.executeComparisonNode(node.id, node.data?.inputDocuments || []);
        break;
      case 'simetrik_integration':
        result = await workflowService.executeSimetrikIntegrationNode(node.id, node.data?.inputDocuments || []);
        break;
      case 'communication':
        result = await workflowService.executeCommunicationNode(node.id, node.data?.inputDocuments || []);
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
    
    // Find outgoing edges
    const outgoingEdges = workflow.edges.filter(edge => edge.sourceId === node.id);
    
    // Execute target nodes
    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find(n => n.id === edge.targetId);
      if (targetNode) {
        // Pass output documents as input to target node
        targetNode.data = {
          ...targetNode.data,
          inputDocuments: result.outputDocuments
        };
        
        // Execute target node
        await executeNode(targetNode, workflow);
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    
    // Update execution record with error
    await NodeExecution.update(
      {
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - new Date(execution.createdAt).getTime()
      },
      { where: { id: execution.id } }
    );
    
    throw error;
  }
};
