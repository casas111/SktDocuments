const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Path to workflows storage directory
const WORKFLOWS_DIR = path.join(__dirname, '../storage/workflows');

// Ensure workflows directory exists
fs.ensureDirSync(WORKFLOWS_DIR);

/**
 * Get all workflows
 * @returns {Promise<Array>} Array of workflow objects
 */
const getAllWorkflows = async () => {
  try {
    // Ensure directory exists
    await fs.ensureDir(WORKFLOWS_DIR);
    
    // Get all workflow files
    const files = await fs.readdir(WORKFLOWS_DIR);
    const workflowFiles = files.filter(file => file.endsWith('.json'));
    
    // Read and parse each workflow file
    const workflows = await Promise.all(
      workflowFiles.map(async (file) => {
        const filePath = path.join(WORKFLOWS_DIR, file);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      })
    );
    
    return { success: true, data: workflows };
  } catch (error) {
    logger.error('Error getting all workflows:', error);
    return { success: false, error: 'Failed to retrieve workflows' };
  }
};

/**
 * Get workflow by ID
 * @param {string} id Workflow ID
 * @returns {Promise<Object>} Workflow object
 */
const getWorkflowById = async (id) => {
  try {
    const filePath = path.join(WORKFLOWS_DIR, `${id}.json`);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'Workflow not found' };
    }
    
    // Read and parse workflow file
    const data = await fs.readFile(filePath, 'utf8');
    const workflow = JSON.parse(data);
    
    return { success: true, data: workflow };
  } catch (error) {
    logger.error(`Error getting workflow ${id}:`, error);
    return { success: false, error: 'Failed to retrieve workflow' };
  }
};

/**
 * Create new workflow
 * @param {Object} workflowData Workflow data
 * @returns {Promise<Object>} Created workflow object
 */
const createWorkflow = async (workflowData) => {
  try {
    // Generate unique ID if not provided
    const workflow = {
      ...workflowData,
      id: workflowData.id || uuidv4(),
      createdAt: workflowData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save workflow to file
    const filePath = path.join(WORKFLOWS_DIR, `${workflow.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(workflow, null, 2));
    
    return { success: true, data: workflow };
  } catch (error) {
    logger.error('Error creating workflow:', error);
    return { success: false, error: 'Failed to create workflow' };
  }
};

/**
 * Update existing workflow
 * @param {string} id Workflow ID
 * @param {Object} workflowData Updated workflow data
 * @returns {Promise<Object>} Updated workflow object
 */
const updateWorkflow = async (id, workflowData) => {
  try {
    const filePath = path.join(WORKFLOWS_DIR, `${id}.json`);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'Workflow not found' };
    }
    
    // Read existing workflow
    const data = await fs.readFile(filePath, 'utf8');
    const existingWorkflow = JSON.parse(data);
    
    // Update workflow
    const updatedWorkflow = {
      ...existingWorkflow,
      ...workflowData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Save updated workflow
    await fs.writeFile(filePath, JSON.stringify(updatedWorkflow, null, 2));
    
    return { success: true, data: updatedWorkflow };
  } catch (error) {
    logger.error(`Error updating workflow ${id}:`, error);
    return { success: false, error: 'Failed to update workflow' };
  }
};

/**
 * Delete workflow
 * @param {string} id Workflow ID
 * @returns {Promise<Object>} Result of deletion
 */
const deleteWorkflow = async (id) => {
  try {
    const filePath = path.join(WORKFLOWS_DIR, `${id}.json`);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'Workflow not found' };
    }
    
    // Delete workflow file
    await fs.unlink(filePath);
    
    return { success: true, message: 'Workflow deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting workflow ${id}:`, error);
    return { success: false, error: 'Failed to delete workflow' };
  }
};

module.exports = {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
};
