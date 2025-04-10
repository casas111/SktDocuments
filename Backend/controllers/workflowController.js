const workflowService = require('../services/workflowService');
const documentService = require('../services/documentService');
const logger = require('../utils/logger');

/**
 * Process translation node
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processTranslation = async (req, res) => {
  try {
    const { documentId, exampleDocumentId } = req.body;
    
    if (!documentId || !exampleDocumentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: documentId and exampleDocumentId are required'
      });
    }
    
    // Check if documents exist
    const document = documentService.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: `Document with ID ${documentId} not found`
      });
    }
    
    const exampleDocument = documentService.getDocumentById(exampleDocumentId);
    if (!exampleDocument) {
      return res.status(404).json({
        success: false,
        message: `Example document with ID ${exampleDocumentId} not found`
      });
    }
    
    // Start translation process
    const process = await workflowService.executeTranslation(documentId, exampleDocumentId);
    
    // Return process information
    res.status(200).json({
      success: true,
      message: 'Translation process started',
      process: {
        id: process.id,
        type: process.type,
        status: process.status,
        startTime: process.startTime,
        result: process.result
      }
    });
  } catch (error) {
    logger.error('Error processing translation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process translation',
      error: error.message
    });
  }
};

/**
 * Process communication node (stub)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processCommunication = (req, res) => {
  // Stub implementation
  logger.info('Communication node processing requested (stub)');
  res.status(200).json({
    success: true,
    message: 'Communication node processing is not implemented yet',
    stub: true
  });
};

/**
 * Process comparison node (stub)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processComparison = (req, res) => {
  // Stub implementation
  logger.info('Comparison node processing requested (stub)');
  res.status(200).json({
    success: true,
    message: 'Comparison node processing is not implemented yet',
    stub: true
  });
};

/**
 * Process Simetrik node (stub)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processSimetrik = (req, res) => {
  // Stub implementation
  logger.info('Simetrik node processing requested (stub)');
  res.status(200).json({
    success: true,
    message: 'Simetrik node processing is not implemented yet',
    stub: true
  });
};

/**
 * Get workflow process status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProcessStatus = (req, res) => {
  try {
    const processId = req.params.id;
    const process = workflowService.getProcess(processId);
    
    if (!process) {
      return res.status(404).json({
        success: false,
        message: `Process with ID ${processId} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      process
    });
  } catch (error) {
    logger.error(`Error getting process status for ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get process status',
      error: error.message
    });
  }
};

/**
 * Get all workflow processes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllProcesses = (req, res) => {
  try {
    const processes = workflowService.getAllProcesses();
    
    res.status(200).json({
      success: true,
      count: processes.length,
      processes
    });
  } catch (error) {
    logger.error('Error getting all processes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get processes',
      error: error.message
    });
  }
};

/**
 * Get all workflows
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllWorkflows = async (req, res) => {
  try {
    const result = await workflowService.getAllWorkflows();
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to get workflows'
      });
    }
    res.status(200).json({
      success: true,
      count: result.data.length,
      workflows: result.data
    });
  } catch (error) {
    logger.error('Error getting all workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflows',
      error: error.message
    });
  }
};

/**
 * Get workflow by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWorkflowById = async (req, res) => {
  try {
    const result = await workflowService.getWorkflowById(req.params.id);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || `Workflow with ID ${req.params.id} not found`
      });
    }
    res.status(200).json({
      success: true,
      workflow: result.data
    });
  } catch (error) {
    logger.error(`Error getting workflow ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow',
      error: error.message
    });
  }
};

/**
 * Create new workflow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createWorkflow = async (req, res) => {
  try {
    const result = await workflowService.createWorkflow(req.body);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create workflow'
      });
    }
    res.status(201).json({
      success: true,
      workflow: result.data
    });
  } catch (error) {
    logger.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow',
      error: error.message
    });
  }
};

/**
 * Update workflow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateWorkflow = async (req, res) => {
  try {
    const result = await workflowService.updateWorkflow(req.params.id, req.body);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || `Workflow with ID ${req.params.id} not found`
      });
    }
    res.status(200).json({
      success: true,
      workflow: result.data
    });
  } catch (error) {
    logger.error(`Error updating workflow ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workflow',
      error: error.message
    });
  }
};

/**
 * Delete workflow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteWorkflow = async (req, res) => {
  try {
    const result = await workflowService.deleteWorkflow(req.params.id);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || `Workflow with ID ${req.params.id} not found`
      });
    }
    res.status(200).json({
      success: true,
      message: result.message || `Workflow with ID ${req.params.id} deleted successfully`
    });
  } catch (error) {
    logger.error(`Error deleting workflow ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workflow',
      error: error.message
    });
  }
};

module.exports = {
  processTranslation,
  processCommunication,
  processComparison,
  processSimetrik,
  getProcessStatus,
  getAllProcesses,
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
};
