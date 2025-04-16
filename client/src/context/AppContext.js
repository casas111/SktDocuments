import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'Root' });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // State for workflows
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  
  // State for labels
  const [labels, setLabels] = useState([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  
  // State for Claude API
  const [isClaudeInitialized, setIsClaudeInitialized] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Fetch documents in current folder
  const fetchDocuments = async (folderId = 'root') => {
    setIsLoadingDocuments(true);
    setError(null);
    
    try {
      let response;
      
      if (folderId === 'root') {
        response = await api.document.getAllDocuments();
      } else {
        response = await api.document.getDocumentsByFolder(folderId);
      }
      
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  
  // Fetch folders
  const fetchFolders = async (parentId = 'root') => {
    setIsLoadingDocuments(true);
    setError(null);
    
    try {
      const response = await api.folder.getSubfolders(parentId);
      setFolders(response.data.folders || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders. Please try again.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  
  // Create new folder
  const createFolder = async (name, parentId = currentFolder.id) => {
    setError(null);
    
    try {
      const response = await api.folder.createFolder({
        name,
        parentId
      });
      
      // Refresh folders
      await fetchFolders(parentId);
      
      return response.data.folder;
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
      return null;
    }
  };
  
  // Upload document
  const uploadDocument = async (file, folderId = currentFolder.id) => {
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);
      
      const response = await api.document.createDocument(formData);
      
      // Refresh documents
      await fetchDocuments(folderId);
      
      return response.data.document;
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      return null;
    }
  };
  
  // Delete document
  const deleteDocument = async (documentId) => {
    setError(null);
    
    try {
      await api.document.deleteDocument(documentId);
      
      // Update documents list
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      return false;
    }
  };
  
  // Process document with Claude
  const processDocumentWithClaude = async (documentId, instruction) => {
    setError(null);
    
    try {
      const response = await api.document.processDocumentWithClaude(documentId, instruction);
      return response.data;
    } catch (err) {
      console.error('Error processing document with Claude:', err);
      setError('Failed to process document. Please try again.');
      return null;
    }
  };
  
  // Fetch workflows
  const fetchWorkflows = async () => {
    setIsLoadingWorkflows(true);
    setError(null);
    
    try {
      const response = await api.workflow.getAllWorkflows();
      setWorkflows(response.data.workflows || []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load workflows. Please try again.');
    } finally {
      setIsLoadingWorkflows(false);
    }
  };
  
  // Create workflow
  const createWorkflow = async (name, description = '') => {
    setError(null);
    
    try {
      const response = await api.workflow.createWorkflow({
        name,
        description
      });
      
      // Refresh workflows
      await fetchWorkflows();
      
      return response.data.workflow;
    } catch (err) {
      console.error('Error creating workflow:', err);
      setError('Failed to create workflow. Please try again.');
      return null;
    }
  };
  
  // Update workflow
  const updateWorkflow = async (workflowId, data) => {
    setError(null);
    
    try {
      const response = await api.workflow.updateWorkflow(workflowId, data);
      
      // Update current workflow if it's the one being edited
      if (currentWorkflow && currentWorkflow.id === workflowId) {
        setCurrentWorkflow(response.data.workflow);
      }
      
      // Refresh workflows
      await fetchWorkflows();
      
      return response.data.workflow;
    } catch (err) {
      console.error('Error updating workflow:', err);
      setError('Failed to update workflow. Please try again.');
      return null;
    }
  };
  
  // Delete workflow
  const deleteWorkflow = async (workflowId) => {
    setError(null);
    
    try {
      await api.workflow.deleteWorkflow(workflowId);
      
      // Update workflows list
      setWorkflows(workflows.filter(wf => wf.id !== workflowId));
      
      return true;
    } catch (err) {
      console.error('Error deleting workflow:', err);
      setError('Failed to delete workflow. Please try again.');
      return false;
    }
  };
  
  // Fetch workflow by ID
  const fetchWorkflowById = async (workflowId) => {
    setError(null);
    
    try {
      const response = await api.workflow.getWorkflowById(workflowId);
      setCurrentWorkflow(response.data.workflow);
      return response.data.workflow;
    } catch (err) {
      console.error('Error fetching workflow:', err);
      setError('Failed to load workflow. Please try again.');
      return null;
    }
  };
  
  // Execute workflow
  const executeWorkflow = async (workflowId, inputDocuments) => {
    setError(null);
    
    try {
      const response = await api.workflow.executeWorkflow(workflowId, inputDocuments);
      return response.data;
    } catch (err) {
      console.error('Error executing workflow:', err);
      setError('Failed to execute workflow. Please try again.');
      return null;
    }
  };
  
  // Fetch labels
  const fetchLabels = async () => {
    setIsLoadingLabels(true);
    setError(null);
    
    try {
      const response = await api.label.getAllLabels();
      setLabels(response.data.labels || []);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to load labels. Please try again.');
    } finally {
      setIsLoadingLabels(false);
    }
  };
  
  // Create label
  const createLabel = async (name, color = '#1976d2') => {
    setError(null);
    
    try {
      const response = await api.label.createLabel({
        name,
        color
      });
      
      // Refresh labels
      await fetchLabels();
      
      return response.data.label;
    } catch (err) {
      console.error('Error creating label:', err);
      setError('Failed to create label. Please try again.');
      return null;
    }
  };
  
  // Initialize Claude API
  const initializeClaudeApi = async (apiKey, model) => {
    setError(null);
    
    try {
      await api.claude.initialize(apiKey, model);
      setIsClaudeInitialized(true);
      return true;
    } catch (err) {
      console.error('Error initializing Claude API:', err);
      setError('Failed to initialize Claude API. Please check your API key and try again.');
      setIsClaudeInitialized(false);
      return false;
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchDocuments();
    fetchFolders();
    fetchWorkflows();
    fetchLabels();
  }, []);
  
  // Context value
  const contextValue = {
    // Document state and functions
    documents,
    folders,
    currentFolder,
    isLoadingDocuments,
    setCurrentFolder,
    fetchDocuments,
    fetchFolders,
    createFolder,
    uploadDocument,
    deleteDocument,
    processDocumentWithClaude,
    
    // Workflow state and functions
    workflows,
    currentWorkflow,
    isLoadingWorkflows,
    fetchWorkflows,
    fetchWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    
    // Label state and functions
    labels,
    isLoadingLabels,
    fetchLabels,
    createLabel,
    
    // Claude API state and functions
    isClaudeInitialized,
    initializeClaudeApi,
    
    // Error state
    error,
    setError
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

export default AppContext;
