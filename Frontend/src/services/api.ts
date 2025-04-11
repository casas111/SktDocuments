import axios from 'axios';
import { Document as AppDocument, ApiDocument, Folder as AppFolder, Tag as AppTag } from '../types/document';
import { Process } from '../types/process';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Document API endpoints
const DOCUMENT_API_ENDPOINT = `${API_BASE_URL}/documents`;
const FOLDER_API_ENDPOINT = `${API_BASE_URL}/documents/folders/all`;
const CREATE_FOLDER_API_ENDPOINT = `${API_BASE_URL}/documents/folders`;
const WORKFLOW_API_ENDPOINT = `${API_BASE_URL}/workflow`;

// Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Document interface
export interface Document {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  type: string;
  uploadDate: Date;
  folderId: string;
  tags: string[];
  starred: boolean;
  locked: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
  url: string;
  metadata: {
    nodeId: string | null;
    nodeType: string | null;
    inputId: string | null;
    description: string;
  };
}

// Folder interface
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

/**
 * Upload document
 * @param file File to upload
 * @param metadata Document metadata
 * @returns Promise with upload result
 */
export const uploadDocument = async (file: File, metadata: any): Promise<ApiResponse<Document>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata fields
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    const response = await axios.post(`${DOCUMENT_API_ENDPOINT}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      data: response.data.document,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all documents
 * @returns Promise with all documents
 */
export const getAllDocuments = async (): Promise<ApiResponse<Document[]>> => {
  try {
    const response = await axios.get(DOCUMENT_API_ENDPOINT);
    
    return {
      success: true,
      data: response.data.documents
    };
  } catch (error) {
    console.error('Error getting documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get document by ID
 * @param id Document ID
 * @returns Promise with document data
 */
export const getDocumentById = async (id: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await axios.get(`${DOCUMENT_API_ENDPOINT}/${id}`);
    
    return {
      success: true,
      data: response.data.document
    };
  } catch (error) {
    console.error(`Error getting document ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get documents by folder
 * @param folderId Folder ID
 * @returns Promise with documents in folder
 */
export const getDocumentsByFolder = async (folderId: string): Promise<ApiResponse<Document[]>> => {
  try {
    const response = await axios.get(`${DOCUMENT_API_ENDPOINT}/folder/${folderId}`);
    
    return {
      success: true,
      data: response.data.documents
    };
  } catch (error) {
    console.error(`Error getting documents for folder ${folderId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete document
 * @param id Document ID
 * @returns Promise with deletion result
 */
export const deleteDocument = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`${DOCUMENT_API_ENDPOINT}/${id}`);
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Move document to folder
 * @param documentId Document ID
 * @param folderId Folder ID
 * @returns Promise with move result
 */
export const moveDocumentToFolder = async (documentId: string, folderId: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await axios.put(`${DOCUMENT_API_ENDPOINT}/${documentId}/move/${folderId}`);
    
    return {
      success: true,
      data: response.data.document,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error moving document ${documentId} to folder ${folderId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all folders
 * @returns Promise with all folders
 */
export const getAllFolders = async (): Promise<ApiResponse<Folder[]>> => {
  try {
    const response = await axios.get(FOLDER_API_ENDPOINT);
    
    return {
      success: true,
      data: response.data.folders
    };
  } catch (error) {
    console.error('Error getting folders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create folder
 * @param name Folder name
 * @param parentId Parent folder ID
 * @returns Promise with created folder
 */
export const createFolder = async (name: string, parentId: string = 'root'): Promise<ApiResponse<Folder>> => {
  try {
    const response = await axios.post(CREATE_FOLDER_API_ENDPOINT, { name, parentId });
    
    return {
      success: true,
      data: response.data.folder,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete folder
 * @param id Folder ID
 * @returns Promise with deletion result
 */
export const deleteFolder = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`${FOLDER_API_ENDPOINT}/${id}`);
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error deleting folder ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all tags
 * @returns Promise with all tags
 */
export const getAllTags = async (): Promise<ApiResponse<Tag[]>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tags`);
    
    return {
      success: true,
      data: response.data.tags
    };
  } catch (error) {
    console.error('Error getting tags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create tag
 * @param name Tag name
 * @param color Tag color
 * @returns Promise with created tag
 */
export const createTag = async (name: string, color: string): Promise<ApiResponse<Tag>> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tags`, { name, color });
    
    return {
      success: true,
      data: response.data.tag,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Add tag to document
 * @param documentId Document ID
 * @param tagId Tag ID
 * @returns Promise with updated document
 */
export const addTagToDocument = async (documentId: string, tagId: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await axios.post(`${DOCUMENT_API_ENDPOINT}/${documentId}/tags/${tagId}`);
    
    return {
      success: true,
      data: response.data.document,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error adding tag ${tagId} to document ${documentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Remove tag from document
 * @param documentId Document ID
 * @param tagId Tag ID
 * @returns Promise with updated document
 */
export const removeTagFromDocument = async (documentId: string, tagId: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await axios.delete(`${DOCUMENT_API_ENDPOINT}/${documentId}/tags/${tagId}`);
    
    return {
      success: true,
      data: response.data.document,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error removing tag ${tagId} from document ${documentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Toggle document starred status
 * @param documentId Document ID
 * @returns Promise with updated document
 */
export const toggleDocumentStarred = async (documentId: string): Promise<ApiResponse<Document>> => {
  try {
    const response = await axios.put(`${DOCUMENT_API_ENDPOINT}/${documentId}/toggle-star`);
    
    return {
      success: true,
      data: response.data.document,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error toggling star for document ${documentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Preview document by ID
 * @param documentId Document ID
 * @returns Promise with document preview URL
 */
export const previewDocument = async (documentId: string): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents/preview/${documentId}`);
    return {
      success: true,
      data: response.data.url || `${API_BASE_URL}/documents/preview/${documentId}`
    };
  } catch (error) {
    console.error('Error getting document preview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Workflow API functions
export const createWorkflow = async (workflow: {
  name: string;
  description: string;
  processes: Process[];
}): Promise<ApiResponse<{ id: string }>> => {
  try {
    const response = await axios.post(`${WORKFLOW_API_ENDPOINT}`, workflow);
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

export const updateWorkflow = async (id: string, workflow: {
  name: string;
  description: string;
  processes: Process[];
}): Promise<ApiResponse<{ id: string }>> => {
  try {
    const response = await axios.put(`${WORKFLOW_API_ENDPOINT}/${id}`, workflow);
    return response.data;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
};

export const getWorkflow = async (id: string): Promise<ApiResponse<{
  id: string;
  name: string;
  description: string;
  processes: Process[];
}>> => {
  try {
    const response = await axios.get(`${WORKFLOW_API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
};

export const deleteWorkflow = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`${WORKFLOW_API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

export const listWorkflows = async (): Promise<ApiResponse<{
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}[]>> => {
  try {
    const response = await axios.get(WORKFLOW_API_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error listing workflows:', error);
    throw error;
  }
};

export const getAllProcesses = async (): Promise<Process[]> => {
  const response = await axios.get(`${API_BASE_URL}/processes`);
  return response.data;
};

export const processTranslation = async (documentId: string, targetLanguage: string): Promise<Process> => {
  const response = await axios.post(`${API_BASE_URL}/processes/translation`, {
    documentId,
    targetLanguage
  });
  return response.data;
};

export const getProcessStatus = async (processId: string): Promise<Process> => {
  const response = await axios.get(`${API_BASE_URL}/processes/${processId}`);
  return response.data;
};

export const getDocuments = async (folderId?: string, tagId?: string): Promise<ApiDocument[]> => {
  const params = new URLSearchParams();
  if (folderId) params.append('folderId', folderId);
  if (tagId) params.append('tagId', tagId);
  const response = await axios.get(`${API_BASE_URL}/documents?${params.toString()}`);
  return response.data;
};

export const getFolders = async (parentId?: string): Promise<AppFolder[]> => {
  const params = new URLSearchParams();
  if (parentId) params.append('parentId', parentId);
  const response = await axios.get(`${API_BASE_URL}/folders?${params.toString()}`);
  return response.data;
};

export const updateDocument = async (id: string, document: Partial<AppDocument>): Promise<AppDocument> => {
  const response = await axios.put(`${API_BASE_URL}/documents/${id}`, document);
  return response.data;
};

export const addTag = async (documentId: string, tagId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/documents/${documentId}/tags`, { tagId });
};

export const removeTag = async (documentId: string, tagId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/documents/${documentId}/tags/${tagId}`);
};

export const downloadDocument = async (documentId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/download/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};
