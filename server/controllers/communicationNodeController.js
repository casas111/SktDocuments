const communicationNodeService = require('../utils/communicationNodeService');
const { Node, NodeExecution, Document } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create a new communication node
exports.createCommunicationNode = async (req, res) => {
  try {
    const { workflowId, name, position, method, recipients, subject, message, endpoint, webhookUrl, event, httpMethod, headers, payload } = req.body;
    
    // Validate required fields
    if (!workflowId || !name || !method || !recipients) {
      return res.status(400).json({ 
        error: true, 
        message: 'WorkflowId, name, method, and recipients are required' 
      });
    }
    
    // Create node data
    const nodeData = {
      name,
      method,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      subject,
      message,
      endpoint,
      webhookUrl,
      event,
      httpMethod,
      headers,
      payload
    };
    
    // Validate configuration
    const validationResult = communicationNodeService.validateCommunicationConfig(nodeData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid communication node configuration',
        details: validationResult.errors
      });
    }
    
    // Create node in database
    const node = await Node.create({
      id: uuidv4(),
      name,
      type: 'communication',
      position: position || { x: 0, y: 0 },
      data: nodeData,
      workflowId
    });
    
    res.status(201).json({
      success: true,
      node
    });
  } catch (error) {
    console.error('Error creating communication node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update communication node
exports.updateCommunicationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, method, recipients, subject, message, endpoint, webhookUrl, event, httpMethod, headers, payload, position } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'communication') {
      return res.status(400).json({ error: true, message: 'Node is not a communication node' });
    }
    
    // Update node data
    const updatedData = {
      ...node.data,
      name: name || node.data.name,
      method: method || node.data.method,
      recipients: recipients ? (Array.isArray(recipients) ? recipients : [recipients]) : node.data.recipients,
      subject: subject !== undefined ? subject : node.data.subject,
      message: message !== undefined ? message : node.data.message,
      endpoint: endpoint !== undefined ? endpoint : node.data.endpoint,
      webhookUrl: webhookUrl !== undefined ? webhookUrl : node.data.webhookUrl,
      event: event !== undefined ? event : node.data.event,
      httpMethod: httpMethod !== undefined ? httpMethod : node.data.httpMethod,
      headers: headers !== undefined ? headers : node.data.headers,
      payload: payload !== undefined ? payload : node.data.payload
    };
    
    // Validate updated configuration
    const validationResult = communicationNodeService.validateCommunicationConfig(updatedData);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid communication node configuration',
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
    console.error('Error updating communication node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Execute communication node
exports.executeCommunicationNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputDocuments } = req.body;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'communication') {
      return res.status(400).json({ error: true, message: 'Node is not a communication node' });
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
      // Execute communication
      const result = await communicationNodeService.executeCommunication(
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
          communicationDetails: result.communicationDetails
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
    console.error('Error executing communication node:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get communication node details
exports.getCommunicationNodeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const node = await Node.findByPk(id);
    
    if (!node) {
      return res.status(404).json({ error: true, message: 'Node not found' });
    }
    
    if (node.type !== 'communication') {
      return res.status(400).json({ error: true, message: 'Node is not a communication node' });
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
    console.error('Error fetching communication node details:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};
