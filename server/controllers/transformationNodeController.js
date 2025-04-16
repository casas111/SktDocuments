const transformationNodeService = require('../utils/transformationNodeService');
const { Node, NodeExecution, Document } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create a new transformation node
exports.createTransformationNode = async (req, res) => {
  try {
    const { workflowId, name, position, instruction, outputTemplateUrl } = req.body;
    
    // Validate required fields
    if (!workflowId || !name || !instruction) {
      return res.status(400).json({ 
        error: true, 
        message: 'WorkflowId, name, and instruction are required' 
      });
    }
    
    // Validate configuration
    const validationResult = transformationNodeService.validateTransformationConfig({
      name,
      instruction
    });
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid transformation node configuration',
        details: validationResult.errors
      });
    }
    
    // Create node data
    const nodeData = {
      name,
      instruction,
      outputTemplateUrl: outputTemplateUrl || null
    };
    
    // Create node in database
    const node = await Node.create({
      id: uuidv4(),
      name,
      type: 'transformation',
      position: position || { x: 0, y: 0 },
      data: nodeData,
      workflowId
    });
    
    res.status(201).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error creating transformation node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update transformation node
exports.updateTransformationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, instruction, outputTemplateUrl, position } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'transformation') {
      return res.status(400).json({ error: true, message: 'Node is not a transformation node' });
    }
    
    // Update node data
    const updatedData = {
      ...node.data,
      name: name || node.data.name,
      instruction: instruction || node.data.instruction,
      outputTemplateUrl: outputTemplateUrl !== undefined ? outputTemplateUrl : node.data.outputTemplateUrl
    };
    
    // Validate updated configuration
    const validationResult = transformationNodeService.validateTransformationConfig(updatedData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid transformation node configuration',
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
    console.error('Error updating transformation node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute transformation node
exports.executeTransformationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputDocuments } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'transformation') {
      return res.status(400).json({ error: true, message: 'Node is not a transformation node' });
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
      // Execute transformation
      const result = await transformationNodeService.executeTransformation(
        node.id,
        node.name,
        inputDocuments,
        node.data.instruction,
        node.data.outputTemplateUrl
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
          transformationDetails: result.transformationDetails
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
    console.error('Error executing transformation node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get transformation node details
exports.getTransformationNodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'transformation') {
      return res.status(400).json({ error: true, message: 'Node is not a transformation node' });
    }
    
    // Get execution history
    const executions = await NodeExecution.findAll({
      where: { nodeId: id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Get output template document if exists
    let outputTemplate = null;
    if (node.data.outputTemplateUrl) {
      const templateId = node.data.outputTemplateUrl.split('/').pop();
      outputTemplate = await Document.findByPk(templateId);
    }
    
    res.status(200).json({
      success: true,
      node,
      executions,
      outputTemplate
    });
  } catch (error) {
    console.error('Error fetching transformation node details:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
