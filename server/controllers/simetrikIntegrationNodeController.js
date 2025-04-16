const simetrikIntegrationNodeService = require('../utils/simetrikIntegrationNodeService');
const { Node, NodeExecution, Document } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create a new Simetrik integration node
exports.createSimetrikIntegrationNode = async (req, res) => {
  try {
    const { workflowId, name, position, endpoint, method, format } = req.body;
    
    // Validate required fields
    if (!workflowId || !name || !endpoint) {
      return res.status(400).json({ 
        error: true, 
        message: 'WorkflowId, name, and endpoint are required' 
      });
    }
    
    // Create node data
    const nodeData = {
      name,
      endpoint,
      method: method || 'POST',
      format: format || 'CSV'
    };
    
    // Validate configuration
    const validationResult = simetrikIntegrationNodeService.validateIntegrationConfig(nodeData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid Simetrik integration node configuration',
        details: validationResult.errors
      });
    }
    
    // Create node in database
    const node = await Node.create({
      id: uuidv4(),
      name,
      type: 'simetrik_integration',
      position: position || { x: 0, y: 0 },
      data: nodeData,
      workflowId
    });
    
    res.status(201).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error creating Simetrik integration node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update Simetrik integration node
exports.updateSimetrikIntegrationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, endpoint, method, format, position } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'simetrik_integration') {
      return res.status(400).json({ error: true, message: 'Node is not a Simetrik integration node' });
    }
    
    // Update node data
    const updatedData = {
      ...node.data,
      name: name || node.data.name,
      endpoint: endpoint || node.data.endpoint,
      method: method || node.data.method,
      format: format || node.data.format
    };
    
    // Validate updated configuration
    const validationResult = simetrikIntegrationNodeService.validateIntegrationConfig(updatedData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid Simetrik integration node configuration',
        details: validationResult.errors
      });
    }
    
    // Update node
    await node.update({
      name: name || node.name,
      position: position || node.position,
      data: updatedData
    });
    
    res.status(200).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error updating Simetrik integration node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute Simetrik integration node
exports.executeSimetrikIntegrationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputDocuments } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'simetrik_integration') {
      return res.status(400).json({ error: true, message: 'Node is not a Simetrik integration node' });
    }
    
    // Validate input documents
    if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Input documents must be a non-empty array of document URLs' 
      });
    }
    
    // Create execution record
    const execution = await NodeExecution.create({
      nodeId: id,
      status: 'running',
      inputDocuments
    });
    
    try {
      // Execute Simetrik integration
      const result = await simetrikIntegrationNodeService.executeSimetrikIntegration(
        node.id,
        node.name,
        inputDocuments,
        node.data
      );
      
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
          outputDocuments: result.outputDocuments,
          integrationDetails: result.integrationDetails
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
    console.error('Error executing Simetrik integration node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get Simetrik integration node details
exports.getSimetrikIntegrationNodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'simetrik_integration') {
      return res.status(400).json({ error: true, message: 'Node is not a Simetrik integration node' });
    }
    
    // Get execution history
    const executions = await NodeExecution.findAll({
      where: { nodeId: id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.status(200).json({
      success: true,
      node,
      executions
    });
  } catch (error) {
    console.error('Error fetching Simetrik integration node details:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
