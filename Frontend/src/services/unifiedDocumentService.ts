import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class UnifiedDocumentService {
  /**
   * Get all documents and folders in a directory
   * 
   * @param {string} path - Directory path
   * @returns {Promise} - Promise with directory contents
   */
  async getDirectoryContents(path: string): Promise<FileItem[]> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/directory`, {
        params: { path }
      });
      
      if (response.data.success) {
        return response.data.contents;
      } else {
        throw new Error(response.data.error || 'Failed to load directory contents');
      }
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      throw error;
    }
  }
  
  /**
   * Create a new folder
   * 
   * @param {string} path - Parent directory path
   * @param {string} folderName - Name of the new folder
   * @returns {Promise} - Promise with created folder data
   */
  async createFolder(path: string, folderName: string): Promise<FileItem> {
    try {
      const response = await axios.post(`${API_ENDPOINTS.FOLDERS}/create`, {
        path,
        folderName
      });
      
      if (response.data.success) {
        return response.data.folder;
      } else {
        throw new Error(response.data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }
  
  /**
   * Delete a folder
   * 
   * @param {string} path - Folder path to delete
   * @returns {Promise} - Promise with deletion result
   */
  async deleteFolder(path: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_ENDPOINTS.FOLDERS}/delete`, {
        params: { path }
      });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }
  
  /**
   * Upload files to a directory
   * 
   * @param {string} path - Directory path to upload to
   * @param {File[]} files - Files to upload
   * @returns {Promise} - Promise with uploaded files data
   */
  async uploadFiles(path: string, files: File[]): Promise<FileItem[]> {
    try {
      const formData = new FormData();
      formData.append('path', path);
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const response = await axios.post(`${API_ENDPOINTS.FILES}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return response.data.files;
      } else {
        throw new Error(response.data.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file
   * 
   * @param {string} path - File path to delete
   * @returns {Promise} - Promise with deletion result
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_ENDPOINTS.FILES}/delete`, {
        params: { path }
      });
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
  
  /**
   * Get file metadata and preview URL
   * 
   * @param {string} filePath - File path
   * @returns {Promise} - Promise with file metadata and preview URL
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/metadata`, {
        params: { path: filePath }
      });
      
      if (response.data.success) {
        return response.data.file;
      } else {
        throw new Error(response.data.error || 'Failed to get file metadata');
      }
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }
  
  /**
   * Get file download URL
   * 
   * @param {string} filePath - File path
   * @returns {Promise} - Promise with download URL
   */
  async getFileDownloadUrl(filePath: string): Promise<string> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/download`, {
        params: { path: filePath }
      });
      
      if (response.data.success && response.data.downloadUrl) {
        return response.data.downloadUrl;
      } else {
        throw new Error(response.data.error || 'Failed to get download URL');
      }
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
  
  /**
   * Process translation with Claude AI
   * 
   * @param {object} params - Translation parameters
   * @returns {Promise} - Promise with translation result
   */
  async processTranslation(params: {
    sourceDoc1Id: string;
    sourceDoc2Id: string;
    templateDocId: string;
    instruction: string;
    model: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_ENDPOINTS.TRANSLATION}/process`, params);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to process translation');
      }
    } catch (error) {
      console.error('Error processing translation:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const unifiedDocumentService = new UnifiedDocumentService();

export { unifiedDocumentService };
