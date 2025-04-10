import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for interacting with the file management API
 */
class FileService {
  /**
   * Get contents of a directory
   * 
   * @param {string} dirPath - Path to the directory
   * @returns {Promise} - Promise with directory contents
   */
  getDirectoryContents(dirPath = '') {
    return axios.get(`${API_URL}/api/files`, {
      params: { dirPath }
    });
  }

  /**
   * Create a new folder
   * 
   * @param {string} folderPath - Path where to create the folder
   * @param {string} folderName - Name of the new folder
   * @returns {Promise} - Promise with created folder data
   */
  createFolder(folderPath, folderName) {
    return axios.post(`${API_URL}/api/files/folder`, {
      folderPath,
      folderName
    });
  }

  /**
   * Upload files
   * 
   * @param {FileList|File[]} files - Files to upload
   * @param {string} folderPath - Path where to upload the files
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise with uploaded files data
   */
  uploadFiles(files, folderPath = '', progressCallback = null) {
    const formData = new FormData();
    formData.append('folderPath', folderPath);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    return axios.post(`${API_URL}/api/files/upload`, formData, {
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
  }

  /**
   * Download a file
   * 
   * @param {string} filePath - Path to the file
   * @returns {Promise} - Promise that resolves when download starts
   */
  downloadFile(filePath) {
    return new Promise((resolve, reject) => {
      axios.get(`${API_URL}/api/files/download/${encodeURIComponent(filePath)}`, {
        responseType: 'blob'
      })
        .then(response => {
          // Create a blob URL for the file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          
          // Create a temporary link element
          const link = document.createElement('a');
          link.href = url;
          
          // Get filename from Content-Disposition header or use the last part of the path
          const contentDisposition = response.headers['content-disposition'];
          let filename = '';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch.length === 2) {
              filename = filenameMatch[1];
            }
          }
          
          if (!filename) {
            filename = filePath.split('/').pop();
          }
          
          link.setAttribute('download', filename);
          
          // Append to body, click and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          window.URL.revokeObjectURL(url);
          
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Download multiple files as a zip
   * 
   * @param {string[]} filePaths - Paths to the files
   * @returns {Promise} - Promise that resolves when download starts
   */
  downloadMultipleFiles(filePaths) {
    return new Promise((resolve, reject) => {
      axios.post(`${API_URL}/api/files/download-multiple`, {
        filePaths
      }, {
        responseType: 'blob'
      })
        .then(response => {
          // Create a blob URL for the zip file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          
          // Create a temporary link element
          const link = document.createElement('a');
          link.href = url;
          
          // Get filename from Content-Disposition header or use default
          const contentDisposition = response.headers['content-disposition'];
          let filename = 'download.zip';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch.length === 2) {
              filename = filenameMatch[1];
            }
          }
          
          link.setAttribute('download', filename);
          
          // Append to body, click and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          window.URL.revokeObjectURL(url);
          
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Rename a file or folder
   * 
   * @param {string} itemPath - Path to the item
   * @param {string} newName - New name for the item
   * @returns {Promise} - Promise with renamed item data
   */
  renameItem(itemPath, newName) {
    return axios.put(`${API_URL}/api/files/rename`, {
      path: itemPath,
      newName
    });
  }

  /**
   * Move a file or folder
   * 
   * @param {string} sourcePath - Path to the source item
   * @param {string} destinationPath - Path to the destination directory
   * @returns {Promise} - Promise with moved item data
   */
  moveItem(sourcePath, destinationPath) {
    return axios.put(`${API_URL}/api/files/move`, {
      sourcePath,
      destinationPath
    });
  }

  /**
   * Delete a file or folder
   * 
   * @param {string} itemPath - Path to the item
   * @returns {Promise} - Promise that resolves when deletion is complete
   */
  deleteItem(itemPath) {
    return axios.delete(`${API_URL}/api/files/${encodeURIComponent(itemPath)}`);
  }

  /**
   * Get metadata for a file or folder
   * 
   * @param {string} itemPath - Path to the item
   * @returns {Promise} - Promise with item metadata
   */
  getMetadata(itemPath) {
    return axios.get(`${API_URL}/api/files/metadata/${encodeURIComponent(itemPath)}`);
  }

  /**
   * Get a preview for a file
   * 
   * @param {string} filePath - Path to the file
   * @returns {Promise} - Promise with file preview data
   */
  getFilePreview(filePath) {
    return axios.get(`${API_URL}/api/files/preview/${encodeURIComponent(filePath)}`);
  }
}

export default new FileService();
