const comparisonNodeService = require('../utils/comparisonNodeService');
const { Node, NodeExecution, Document } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create a new comparison node
exports.createComparisonNode = async (req, res) => {
  try {
    const { workflowId, name, position, instruction } = req.body;
    
    // Validate required fields
    if (!workflowId || !name || !instruction) {
      return res.status(400).json({ 
        error: true, 
        message: 'WorkflowId, name, and instruction are required' 
      });
    }
    
    // Validate configuration
    const validationResult = comparisonNodeService.validateComparisonConfig({
      name,
      instruction
    });
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid comparison node configuration',
        details: validationResult.errors
      });
    }
    
    // Create node data
    const nodeData = {
      name,
      instruction
    };
    
    // Create node in database
    const node = await Node.create({
      id: uuidv4(),
      name,
      type: 'comparison',
      position: position || { x: 0, y: 0 },
      data: nodeData,
      workflowId
    });
    
    res.status(201).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error creating comparison node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update comparison node
exports.updateComparisonNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, instruction, position } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'comparison') {
      return res.status(400).json({ error: true, message: 'Node is not a comparison node' });
    }
    
    // Update node data
    const updatedData = {
      ...node.data,
      name: name || node.data.name,
      instruction: instruction || node.data.instruction
    };
    
    // Validate updated configuration
    const validationResult = comparisonNodeService.validateComparisonConfig(updatedData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid comparison node configuration',
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
    console.error('Error updating comparison node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute comparison node
exports.executeComparisonNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputDocuments } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'comparison') {
      return res.status(400).json({ error: true, message: 'Node is not a comparison node' });
    }
    
    // Validate input documents
    if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length !== 2) {
      return res.status(400).json({ 
        error: true, 
        message: 'Comparison node requires exactly 2 input documents' 
      });
    }
    
    // Create execution record
    const execution = await NodeExecution.create({
      nodeId: id,
      status: 'running',
      inputDocuments
    });
    
    try {
      // Execute comparison
      const result = await comparisonNodeService.executeComparison(
        node.id,
        node.name,
        inputDocuments,
        node.data.instruction
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
          comparisonDetails: result.comparisonDetails
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
    console.error('Error executing comparison node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get comparison node details
exports.getComparisonNodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'comparison') {
      return res.status(400).json({ error: true, message: 'Node is not a comparison node' });
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
    console.error('Error fetching comparison node details:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
