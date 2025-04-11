/**
 * Unified Document Service
 * 
 * This service provides a unified interface for document and folder operations,
 * integrating both the documents API and files API to ensure consistent behavior.
 */
import axios from 'axios';
import { API_BASE_URL } from '../config';

// API endpoints
const DOCUMENTS_API = `${API_BASE_URL}/documents`;
const FILES_API = `${API_BASE_URL}/files`;

class UnifiedDocumentService {
  /**
   * Get all folders
   * 
   * @returns {Promise} - Promise with folders data
   */
  async getAllFolders() {
    try {
      // First try the documents API
      const documentsResponse = await axios.get(`${DOCUMENTS_API}/folders/all`);
      
      if (documentsResponse.data && Array.isArray(documentsResponse.data)) {
        const folders = documentsResponse.data.map(folder => ({
          ...folder,
          path: folder.id, // Ensure path property exists for compatibility
          parent: folder.parentId === 'root' ? '/' : folder.parentId
        }));
        
        console.log('Folders retrieved from documents API:', folders);
        return {
          success: true,
          data: folders
        };
      }
    } catch (documentsError) {
      console.warn('Error getting folders from documents API, falling back to files API:', documentsError);
    }
    
    // Fall back to files API
    try {
      const filesResponse = await axios.get(FILES_API, {
        params: { dirPath: '/' }
      });
      
      if (filesResponse.data && filesResponse.data.success && filesResponse.data.data) {
        // Filter to only include directories
        const folders = filesResponse.data.data
          .filter(item => item.isDirectory)
          .map(folder => ({
            id: folder.path,
            name: folder.name,
            path: folder.path,
            parent: this._getParentPath(folder.path),
            parentId: this._getParentPath(folder.path) === '/' ? 'root' : this._getParentPath(folder.path),
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
        error: 'No folders found in response'
      };
    } catch (filesError) {
      console.error('Error getting folders from files API:', filesError);
      return {
        success: false,
        error: filesError.message || 'Failed to retrieve folders'
      };
    }
  }
  
  /**
   * Create a new folder
   * 
   * @param {string} name - Folder name
   * @param {string} parentId - Parent folder ID
   * @returns {Promise} - Promise with created folder data
   */
  async createFolder(name, parentId = 'root') {
    // First try the documents API
    try {
      const documentsResponse = await axios.post(`${DOCUMENTS_API}/folders`, {
        name,
        parentId
      });
      
      if (documentsResponse.data && documentsResponse.data.folder) {
        const folder = documentsResponse.data.folder;
        
        // Also create in files API for consistency
        try {
          const parentPath = parentId === 'root' ? '/' : parentId;
          await axios.post(`${FILES_API}/folder`, {
            folderName: name,
            parentPath
          });
          console.log('Folder also created in files API');
        } catch (filesError) {
          console.warn('Error creating folder in files API (continuing anyway):', filesError);
        }
        
        console.log('Folder created in documents API:', folder);
        return {
          success: true,
          data: {
            ...folder,
            path: folder.id, // Ensure path property exists for compatibility
            parent: folder.parentId === 'root' ? '/' : folder.parentId
          },
          message: documentsResponse.data.message || 'Folder created successfully'
        };
      }
      
      throw new Error('Invalid response from documents API');
    } catch (documentsError) {
      console.warn('Error creating folder in documents API, falling back to files API:', documentsError);
      
      try {
        const parentPath = parentId === 'root' ? '/' : parentId;
        const filesResponse = await axios.post(`${FILES_API}/folder`, {
          folderName: name,
          parentPath
        });
        
        if (filesResponse.data && filesResponse.data.success && filesResponse.data.data) {
          // Transform the response to match the expected format
          const newFolder = filesResponse.data.data;
          const folder = {
            id: newFolder.path,
            name: newFolder.name,
            path: newFolder.path,
            parent: this._getParentPath(newFolder.path),
            parentId: this._getParentPath(newFolder.path) === '/' ? 'root' : this._getParentPath(newFolder.path),
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
   * Delete a file
   * 
   * @param {string} filePath - Path of the file to delete
   * @returns {Promise} - Promise with deletion result
   */
  async deleteFile(filePath) {
    try {
      // Try to delete from documents API first
      try {
        const documentsResponse = await axios.delete(`${DOCUMENTS_API}/${encodeURIComponent(filePath)}`);
        
        // Also delete in files API for consistency
        try {
          await axios.delete(`${FILES_API}/${encodeURIComponent(filePath)}`);
          console.log('File also deleted in files API');
        } catch (filesError) {
          console.warn('Error deleting file in files API (continuing anyway):', filesError);
        }
        
        return {
          success: true,
          message: documentsResponse.data?.message || 'File deleted successfully'
        };
      } catch (documentsError) {
        console.warn('Error deleting file in documents API, falling back to files API:', documentsError);
        
        // Fallback to files API
        const filesResponse = await axios.delete(`${FILES_API}/${encodeURIComponent(filePath)}`);
        
        return {
          success: filesResponse.data?.success || true,
          message: filesResponse.data?.message || 'File deleted successfully'
        };
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete file'
      };
    }
  },
  
  /**
   * Get file metadata and preview URL
   * 
   * @param {string} filePath - File path
   * @returns {Promise} - Promise with file metadata and preview URL
   */
  async getFileInfo(filePath) {
    try {
      const response = await axios.get(`${FILES_API}/metadata/${encodeURIComponent(filePath)}`);
      
      if (response.data && response.data.success && response.data.data) {
        const fileData = response.data.data;
        
        // Add preview URL for viewable file types
        if (fileData.type.startsWith('image/') || fileData.type === 'application/pdf') {
          fileData.previewUrl = `${FILES_API}/preview/${encodeURIComponent(filePath)}`;
        }
        
        // Add download URL
        fileData.downloadUrl = `${FILES_API}/download/${encodeURIComponent(filePath)}`;
        
        return {
          success: true,
          data: fileData
        };
      }
      
      return {
        success: false,
        error: 'No file data found in response'
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve file information'
      };
    }
  }
  
  /**
   * Helper method to extract parent path from path
   * 
   * @param {string} path - Folder path
   * @returns {string} - Parent path
   * @private
   */
  _getParentPath(path) {
    if (!path || path === '/') return '/';
    
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return '/';
    
    parts.pop(); // Remove the last part (current folder name)
    return '/' + parts.join('/');
  }
}

export default new UnifiedDocumentService();
