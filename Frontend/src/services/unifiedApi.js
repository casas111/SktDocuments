/**
 * Unified API Service
 * 
 * This service provides a centralized interface for all API operations,
 * consolidating the functionality from multiple parallel implementations.
 */
import axios from 'axios';
import { API_BASE_URL } from '../config';
import unifiedDocumentService from './unifiedDocumentService';

// Re-export the unified document service methods
export const {
  getAllFolders,
  createFolder,
  deleteFolder,
  getDirectoryContents,
  uploadFiles,
  getFileInfo
} = unifiedDocumentService;

// Document API functions
export const getDocuments = async (folderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents`, {
      params: { folderId }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting documents:', error);
    return {
      success: false,
      error: error.message || 'Failed to get documents'
    };
  }
};

export const getDocumentById = async (documentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Error getting document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to get document'
    };
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
    
    return {
      success: true,
      message: response.data.message || 'Document deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to delete document'
    };
  }
};

// Tag API functions
export const getAllTags = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents/tags/all`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting tags:', error);
    return {
      success: false,
      error: error.message || 'Failed to get tags'
    };
  }
};

export const createTag = async (name, color) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/documents/tags`, { name, color });
    
    return {
      success: true,
      data: response.data.tag,
      message: response.data.message || 'Tag created successfully'
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    return {
      success: false,
      error: error.message || 'Failed to create tag'
    };
  }
};

export const addTagToDocument = async (documentId, tagId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/documents/${documentId}/tag/${tagId}`);
    
    return {
      success: true,
      message: response.data.message || 'Tag added to document successfully'
    };
  } catch (error) {
    console.error(`Error adding tag ${tagId} to document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to add tag to document'
    };
  }
};

export const removeTagFromDocument = async (documentId, tagId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}/tag/${tagId}`);
    
    return {
      success: true,
      message: response.data.message || 'Tag removed from document successfully'
    };
  } catch (error) {
    console.error(`Error removing tag ${tagId} from document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to remove tag from document'
    };
  }
};

// Document star functionality
export const toggleDocumentStarred = async (documentId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/documents/${documentId}/star`);
    
    return {
      success: true,
      data: response.data.starred,
      message: response.data.message || 'Document star status toggled successfully'
    };
  } catch (error) {
    console.error(`Error toggling star for document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to toggle document star status'
    };
  }
};

// Workflow API functions - preserved as they are working correctly
export const createWorkflow = async (workflow) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/workflow`, workflow);
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

export const updateWorkflow = async (id, workflow) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/workflow/${id}`, workflow);
    return response.data;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
};

export const getWorkflow = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workflow/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
};

export const deleteWorkflow = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/workflow/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

export const listWorkflows = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workflow`);
    return response.data;
  } catch (error) {
    console.error('Error listing workflows:', error);
    throw error;
  }
};

// Process API functions
export const getAllProcesses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/processes`);
    return response.data;
  } catch (error) {
    console.error('Error getting processes:', error);
    throw error;
  }
};

export const getProcessStatus = async (processId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/processes/${processId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting process status:', error);
    throw error;
  }
};

// Types for TypeScript compatibility
export const Document = {};
export const Folder = {};
export const Tag = {};
export const Process = {};
export const AppDocument = {};
export const AppFolder = {};
