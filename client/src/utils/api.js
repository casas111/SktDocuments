import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Document API
export const documentApi = {
  // Get all documents
  getAllDocuments: () => api.get('/documents'),
  
  // Get documents in a folder
  getDocumentsByFolder: (folderId) => api.get(`/documents/folder/${folderId}`),
  
  // Get document by ID
  getDocumentById: (id) => api.get(`/documents/${id}`),
  
  // Create new document (with file upload)
  createDocument: (formData) => {
    return api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update document
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  
  // Delete document
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  
  // Search documents
  searchDocuments: (query) => api.get(`/documents/search/${query}`),
  
  // Add label to document
  addLabelToDocument: (documentId, labelId) => api.post(`/documents/${documentId}/labels/${labelId}`),
  
  // Remove label from document
  removeLabelFromDocument: (documentId, labelId) => api.delete(`/documents/${documentId}/labels/${labelId}`),
  
  // Process document with Claude AI
  processDocumentWithClaude: (id, instruction) => api.post(`/documents/${id}/process`, { instruction }),
  
  // Extract structured data from document
  extractStructuredData: (id, schema) => api.post(`/documents/${id}/extract-data`, { schema }),
  
  // Generate document summary
  generateDocumentSummary: (id, options) => api.post(`/documents/${id}/summarize`, { options })
};

// Folder API
export const folderApi = {
  // Get all folders
  getAllFolders: () => api.get('/folders'),
  
  // Get folder by ID
  getFolderById: (id) => api.get(`/folders/${id}`),
  
  // Get subfolders
  getSubfolders: (parentId) => api.get(`/folders/parent/${parentId}`),
  
  // Create new folder
  createFolder: (data) => api.post('/folders', data),
  
  // Update folder
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  
  // Delete folder
  deleteFolder: (id) => api.delete(`/folders/${id}`)
};

// Workflow API
export const workflowApi = {
  // Get all workflows
  getAllWorkflows: () => api.get('/workflows'),
  
  // Get workflow by ID
  getWorkflowById: (id) => api.get(`/workflows/${id}`),
  
  // Create new workflow
  createWorkflow: (data) => api.post('/workflows', data),
  
  // Update workflow
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  
  // Delete workflow
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  
  // Execute workflow
  executeWorkflow: (id, inputDocuments) => api.post(`/workflows/${id}/execute`, { inputDocuments })
};

// Node API
export const nodeApi = {
  // Get all nodes for a workflow
  getNodesByWorkflow: (workflowId) => api.get(`/nodes/workflow/${workflowId}`),
  
  // Get node by ID
  getNodeById: (id) => api.get(`/nodes/${id}`),
  
  // Create transformation node
  createTransformationNode: (data) => api.post('/nodes/transformation', data),
  
  // Update transformation node
  updateTransformationNode: (id, data) => api.put(`/nodes/transformation/${id}`, data),
  
  // Execute transformation node
  executeTransformationNode: (id, inputDocuments) => api.post(`/nodes/transformation/${id}/execute`, { inputDocuments }),
  
  // Create comparison node
  createComparisonNode: (data) => api.post('/nodes/comparison', data),
  
  // Update comparison node
  updateComparisonNode: (id, data) => api.put(`/nodes/comparison/${id}`, data),
  
  // Execute comparison node
  executeComparisonNode: (id, inputDocuments) => api.post(`/nodes/comparison/${id}/execute`, { inputDocuments }),
  
  // Create Simetrik integration node
  createSimetrikIntegrationNode: (data) => api.post('/nodes/simetrik-integration', data),
  
  // Update Simetrik integration node
  updateSimetrikIntegrationNode: (id, data) => api.put(`/nodes/simetrik-integration/${id}`, data),
  
  // Execute Simetrik integration node
  executeSimetrikIntegrationNode: (id, inputDocuments) => api.post(`/nodes/simetrik-integration/${id}/execute`, { inputDocuments }),
  
  // Create communication node
  createCommunicationNode: (data) => api.post('/nodes/communication', data),
  
  // Update communication node
  updateCommunicationNode: (id, data) => api.put(`/nodes/communication/${id}`, data),
  
  // Execute communication node
  executeCommunicationNode: (id, inputDocuments) => api.post(`/nodes/communication/${id}/execute`, { inputDocuments })
};

// Edge API
export const edgeApi = {
  // Get all edges for a workflow
  getEdgesByWorkflow: (workflowId) => api.get(`/edges/workflow/${workflowId}`),
  
  // Create edge
  createEdge: (data) => api.post('/edges', data),
  
  // Update edge
  updateEdge: (id, data) => api.put(`/edges/${id}`, data),
  
  // Delete edge
  deleteEdge: (id) => api.delete(`/edges/${id}`)
};

// Label API
export const labelApi = {
  // Get all labels
  getAllLabels: () => api.get('/labels'),
  
  // Get label by ID
  getLabelById: (id) => api.get(`/labels/${id}`),
  
  // Create new label
  createLabel: (data) => api.post('/labels', data),
  
  // Update label
  updateLabel: (id, data) => api.put(`/labels/${id}`, data),
  
  // Delete label
  deleteLabel: (id) => api.delete(`/labels/${id}`)
};

// Claude API
export const claudeApi = {
  // Initialize Claude API
  initialize: (apiKey, model) => api.post('/claude/initialize', { apiKey, model }),
  
  // Process document with Claude
  processDocument: (documentContent, instruction) => api.post('/claude/process-document', { documentContent, instruction }),
  
  // Compare documents with Claude
  compareDocuments: (document1Content, document2Content, instruction) => api.post('/claude/compare-documents', { document1Content, document2Content, instruction }),
  
  // Generate transformation template
  generateTemplate: (exampleInput, exampleOutput) => api.post('/claude/generate-template', { exampleInput, exampleOutput }),
  
  // Extract structured data from document
  extractData: (documentContent, schema) => api.post('/claude/extract-data', { documentContent, schema }),
  
  // Generate document summary
  generateSummary: (documentContent, options) => api.post('/claude/generate-summary', { documentContent, options })
};

// Export all APIs
export default {
  document: documentApi,
  folder: folderApi,
  workflow: workflowApi,
  node: nodeApi,
  edge: edgeApi,
  label: labelApi,
  claude: claudeApi
};
