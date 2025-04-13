const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const transformationService = require('./transformationService');

// Path to workflows storage directory
const WORKFLOWS_DIR = path.join(__dirname, '../storage/workflows');
const PROCESSES_DIR = path.join(__dirname, '../storage/processes');

// Ensure directories exist
fs.ensureDirSync(WORKFLOWS_DIR);
fs.ensureDirSync(PROCESSES_DIR);

// In-memory store for active processes
const activeProcesses = new Map();

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

/**
 * Execute a node in the workflow
 * @param {string} workflowId Workflow ID
 * @param {string} nodeId Node ID to execute
 * @param {Array} inputDocIds Array of input document IDs
 * @returns {Promise<Object>} Process result
 */
const executeNode = async (workflowId, nodeId, inputDocIds) => {
  try {
    // Get workflow
    const workflowResult = await getWorkflowById(workflowId);
    if (!workflowResult.success) {
      return { success: false, error: workflowResult.error };
    }
    
    const workflow = workflowResult.data;
    
    // Find the node in the workflow
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, error: `Node with ID ${nodeId} not found in workflow` };
    }
    
    // Create a process for this node execution
    const processId = uuidv4();
    const process = {
      id: processId,
      workflowId,
      nodeId,
      type: node.type,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      inputDocIds,
      outputDocId: null,
      error: null
    };
    
    // Save process to memory and file
    activeProcesses.set(processId, process);
    await fs.writeFile(
      path.join(PROCESSES_DIR, `${processId}.json`),
      JSON.stringify(process, null, 2)
    );
    
    // Execute the node based on its type
    let result;
    switch (node.type) {
      case 'transformation':
        result = await executeTransformationNode(node, inputDocIds, process);
        break;
      // Add other node types here as needed
      default:
        result = { success: false, error: `Unsupported node type: ${node.type}` };
    }
    
    // Update process with result
    process.status = result.success ? 'completed' : 'failed';
    process.endTime = new Date().toISOString();
    process.outputDocId = result.outputDocId || null;
    process.error = result.error || null;
    
    // Update process in memory and file
    activeProcesses.set(processId, process);
    await fs.writeFile(
      path.join(PROCESSES_DIR, `${processId}.json`),
      JSON.stringify(process, null, 2)
    );
    
    // If successful, trigger downstream nodes
    if (result.success) {
      await triggerDownstreamNodes(workflow, nodeId, [result.outputDocId]);
    }
    
    return { success: result.success, process, error: result.error };
  } catch (error) {
    logger.error(`Error executing node ${nodeId} in workflow ${workflowId}:`, error);
    return { success: false, error: 'Failed to execute node' };
  }
};

/**
 * Execute a transformation node
 * @param {Object} node Node data
 * @param {Array} inputDocIds Array of input document IDs
 * @param {Object} process Process data
 * @returns {Promise<Object>} Execution result
 */
const executeTransformationNode = async (node, inputDocIds, process) => {
  try {
    // Extract node data
    const nodeData = node.data;
    
    // Call transformation service
    const result = await transformationService.processTransformation({
      node: {
        name: nodeData.label || 'Transformation Node',
        instruction: nodeData.instruction || '',
        templateId: nodeData.templateDoc?.id || '',
        model: nodeData.model || 'claude-3-haiku-20240307'
      },
      sourceDocIds: inputDocIds
    });
    
    if (!result.success) {
      return { success: false, error: result.error || 'Transformation failed' };
    }
    
    return { 
      success: true, 
      outputDocId: result.data?.transformedDocument?.id 
    };
  } catch (error) {
    logger.error('Error executing transformation node:', error);
    return { success: false, error: 'Failed to execute transformation node' };
  }
};

/**
 * Trigger downstream nodes in a workflow
 * @param {Object} workflow Workflow data
 * @param {string} sourceNodeId Source node ID
 * @param {Array} outputDocIds Array of output document IDs
 * @returns {Promise<void>}
 */
const triggerDownstreamNodes = async (workflow, sourceNodeId, outputDocIds) => {
  try {
    // Find edges that have the source node as their source
    const edges = workflow.edges || [];
    const downstreamEdges = edges.filter(edge => edge.source === sourceNodeId);
    
    // For each downstream edge, trigger the target node
    for (const edge of downstreamEdges) {
      const targetNodeId = edge.target;
      
      // Execute the target node with the output documents from the source node
      await executeNode(workflow.id, targetNodeId, outputDocIds);
    }
  } catch (error) {
    logger.error(`Error triggering downstream nodes for ${sourceNodeId}:`, error);
  }
};

/**
 * Get process by ID
 * @param {string} id Process ID
 * @returns {Object} Process object
 */
const getProcess = (id) => {
  // Check in-memory store first
  if (activeProcesses.has(id)) {
    return activeProcesses.get(id);
  }
  
  // If not in memory, try to read from file
  try {
    const filePath = path.join(PROCESSES_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    logger.error(`Error reading process ${id} from file:`, error);
  }
  
  return null;
};

/**
 * Get all processes
 * @returns {Array} Array of process objects
 */
const getAllProcesses = () => {
  // Return all processes from in-memory store
  return Array.from(activeProcesses.values());
};

module.exports = {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeNode,
  getProcess,
  getAllProcesses
};
