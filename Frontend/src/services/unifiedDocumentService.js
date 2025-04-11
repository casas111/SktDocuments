// Unified API Service for Document and Folder Management
// This service combines functionality from both fileService.js and api.ts
// to ensure consistent folder and document handling

import axios from 'axios';

// API base URLs
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const FILES_API = `${API_URL}/files`;
const DOCUMENTS_API = `${API_URL}/documents`;

/**
 * Unified service for document and folder management
 */
class UnifiedDocumentService {
  /**
   * Get all folders
   * 
   * @returns {Promise} - Promise with all folders
   */
  async getAllFolders() {
    try {
      // First try the documents API
      const response = await axios.get(`${DOCUMENTS_API}/folders/all`);
      
      if (response.data && response.data.folders) {
        console.log('Folders retrieved from documents API:', response.data.folders);
        return {
          success: true,
          data: response.data.folders
        };
      }
      
      return {
        success: false,
        error: 'No folders found in response'
      };
    } catch (documentsError) {
      console.warn('Error getting folders from documents API, falling back to files API:', documentsError);
      
      try {
        // Fall back to the files API
        const filesResponse = await axios.get(`${FILES_API}`, {
          params: { dirPath: '' }
        });
        
        if (filesResponse.data && filesResponse.data.data) {
          // Transform the response to match the expected format
          const folders = filesResponse.data.data
            .filter(item => item.isDirectory)
            .map(folder => ({
              id: folder.path,
              name: folder.name,
              parentId: this._getParentId(folder.path),
              createdAt: folder.createdAt,
              updatedAt: folder.modifiedAt
            }));
          
          console.log('Folders retrieved from files API:', folders);
          return {
            success: true,
            data: folders
          };
        }
        
        return {
          success: false,
          error: 'No folders found in files API response'
        };
      } catch (filesError) {
        console.error('Error getting folders from files API:', filesError);
        return {
          success: false,
          error: filesError.message || 'Failed to retrieve folders'
        };
      }
    }
  }
  
  /**
   * Get folders by parent ID
   * 
   * @param {string} parentId - Parent folder ID
   * @returns {Promise} - Promise with child folders
   */
  async getFoldersByParent(parentId) {
    try {
      // First try the documents API
      const response = await axios.get(`${DOCUMENTS_API}/folders`, {
        params: { parentId }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Child folders retrieved from documents API:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: 'No folders found in response'
      };
    } catch (documentsError) {
      console.warn('Error getting child folders from documents API, falling back to files API:', documentsError);
      
      try {
        // Fall back to the files API
        // Convert parentId to dirPath format
        const dirPath = parentId === 'root' ? '' : parentId;
        
        const filesResponse = await axios.get(`${FILES_API}`, {
          params: { dirPath }
        });
        
        if (filesResponse.data && filesResponse.data.data) {
          // Transform the response to match the expected format
          const folders = filesResponse.data.data
            .filter(item => item.isDirectory)
            .map(folder => ({
              id: folder.path,
              name: folder.name,
              parentId: this._getParentId(folder.path),
              createdAt: folder.createdAt,
              updatedAt: folder.modifiedAt
            }));
          
          console.log('Child folders retrieved from files API:', folders);
          return {
            success: true,
            data: folders
          };
        }
        
        return {
          success: false,
          error: 'No folders found in files API response'
        };
      } catch (filesError) {
        console.error('Error getting child folders from files API:', filesError);
        return {
          success: false,
          error: filesError.message || 'Failed to retrieve child folders'
        };
      }
    }
  }
  
  /**
   * Create a new folder
   * 
   * @param {string} folderName - Name of the new folder
   * @param {string} parentId - Parent folder ID
   * @returns {Promise} - Promise with created folder data
   */
  async createFolder(folderName, parentId = 'root') {
    try {
      // First try the documents API
      const documentsResponse = await axios.post(`${DOCUMENTS_API}/folders`, {
        name: folderName,
        parentId
      });
      
      if (documentsResponse.data && documentsResponse.data.folder) {
        console.log('Folder created in documents API:', documentsResponse.data.folder);
        
        // Also create in files API for consistency
        try {
          // Convert parentId to folderPath format
          const folderPath = parentId === 'root' ? '' : parentId;
          
          await axios.post(`${FILES_API}/folder`, {
            folderPath,
            folderName
          });
          
          console.log('Folder also created in files API');
        } catch (filesError) {
          console.warn('Error creating folder in files API (continuing anyway):', filesError);
        }
        
        return {
          success: true,
          data: documentsResponse.data.folder,
          message: documentsResponse.data.message || 'Folder created successfully'
        };
      }
      
      throw new Error('Invalid response from documents API');
    } catch (documentsError) {
      console.warn('Error creating folder in documents API, falling back to files API:', documentsError);
      
      try {
        // Convert parentId to folderPath format
        const folderPath = parentId === 'root' ? '' : parentId;
        
        const filesResponse = await axios.post(`${FILES_API}/folder`, {
          folderPath,
          folderName
        });
        
        if (filesResponse.data && filesResponse.data.success) {
          // Transform the response to match the expected format
          const newFolder = filesResponse.data.data;
          const folder = {
            id: newFolder.path,
            name: newFolder.name,
            parentId: this._getParentId(newFolder.path),
            createdAt: newFolder.createdAt,
            updatedAt: newFolder.modifiedAt
          };
          
          console.log('Folder created in files API:', folder);
          return {
            success: true,
            data: folder,
            message: 'Folder created successfully'
          };
        }
        
        throw new Error('Invalid response from files API');
      } catch (filesError) {
        console.error('Error creating folder in files API:', filesError);
        return {
          success: false,
          error: filesError.message || 'Failed to create folder'
        };
      }
    }
  }
  
  /**
   * Delete a folder
   * 
   * @param {string} folderId - Folder ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteFolder(folderId) {
    try {
      // First try the documents API
      const documentsResponse = await axios.delete(`${DOCUMENTS_API}/folders/${folderId}`);
      
      // Also delete in files API for consistency
      try {
        await axios.delete(`${FILES_API}/${encodeURIComponent(folderId)}`);
        console.log('Folder also deleted in files API');
      } catch (filesError) {
        console.warn('Error deleting folder in files API (continuing anyway):', filesError);
      }
      
      return {
        success: true,
        message: documentsResponse.data?.message || 'Folder deleted successfully'
      };
    } catch (documentsError) {
      console.warn('Error deleting folder in documents API, falling back to files API:', documentsError);
      
      try {
        const filesResponse = await axios.delete(`${FILES_API}/${encodeURIComponent(folderId)}`);
        
        return {
          success: filesResponse.data?.success || true,
          message: filesResponse.data?.message || 'Folder deleted successfully'
        };
      } catch (filesError) {
        console.error('Error deleting folder in files API:', filesError);
        return {
          success: false,
          error: filesError.message || 'Failed to delete folder'
        };
      }
    }
  }
  
  /**
   * Get directory contents (files and folders)
   * 
   * @param {string} dirPath - Directory path
   * @returns {Promise} - Promise with directory contents
   */
  async getDirectoryContents(dirPath = '') {
    try {
      const response = await axios.get(`${FILES_API}`, {
        params: { dirPath }
      });
      
      if (response.data && response.data.data) {
        // Add id field to each item for consistency
        const contents = response.data.data.map(item => ({
          ...item,
          id: item.path
        }));
        
        console.log('Directory contents retrieved:', contents);
        return {
          success: true,
          data: contents
        };
      }
      
      return {
        success: false,
        error: 'No contents found in response'
      };
    } catch (error) {
      console.error('Error getting directory contents:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve directory contents'
      };
    }
  }
  
  /**
   * Upload files
   * 
   * @param {FileList|File[]} files - Files to upload
   * @param {string} folderPath - Path where to upload the files
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise with uploaded files data
   */
  async uploadFiles(files, folderPath = '', progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append('folderPath', folderPath);
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const response = await axios.post(`${FILES_API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          if (progressCallback) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressCallback(percentCompleted);
          }
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to extract parent ID from path
   * 
   * @param {string} path - Folder path
   * @returns {string} - Parent ID
   * @private
   */
  _getParentId(path) {
    if (!path || path === '/') return 'root';
    
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return 'root';
    
    parts.pop(); // Remove the last part (current folder name)
    return parts.length === 0 ? 'root' : '/' + parts.join('/');
  }
}

export default new UnifiedDocumentService();
