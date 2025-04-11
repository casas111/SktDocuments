// Test script to verify folder rendering solution
// This script tests the unified document service and folder rendering components

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3001/api';
const FILES_API = `${API_URL}/files`;
const DOCUMENTS_API = `${API_URL}/documents`;
const TEST_FOLDER_NAME = 'test-folder-' + Date.now();
const TEST_SUBFOLDER_NAME = 'test-subfolder-' + Date.now();

// Utility to log with timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Simulate the unified document service
const unifiedDocumentService = {
  // Get all folders
  async getAllFolders() {
    try {
      // First try the documents API
      log('Attempting to get folders from documents API...');
      const response = await axios.get(`${DOCUMENTS_API}/folders/all`);
      
      if (response.data && response.data.folders) {
        log(`Successfully retrieved ${response.data.folders.length} folders from documents API`);
        return {
          success: true,
          data: response.data.folders
        };
      }
      
      log('No folders found in documents API response');
      return {
        success: false,
        error: 'No folders found in response'
      };
    } catch (documentsError) {
      log(`Error getting folders from documents API: ${documentsError.message}`);
      
      try {
        // Fall back to the files API
        log('Falling back to files API...');
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
          
          log(`Successfully retrieved ${folders.length} folders from files API`);
          return {
            success: true,
            data: folders
          };
        }
        
        log('No folders found in files API response');
        return {
          success: false,
          error: 'No folders found in files API response'
        };
      } catch (filesError) {
        log(`Error getting folders from files API: ${filesError.message}`);
        return {
          success: false,
          error: filesError.message || 'Failed to retrieve folders'
        };
      }
    }
  },
  
  // Create a new folder
  async createFolder(folderName, parentId = 'root') {
    try {
      // First try the documents API
      log(`Attempting to create folder "${folderName}" in parent "${parentId}" using documents API...`);
      const documentsResponse = await axios.post(`${DOCUMENTS_API}/folders`, {
        name: folderName,
        parentId
      });
      
      if (documentsResponse.data && documentsResponse.data.folder) {
        log(`Successfully created folder in documents API: ${JSON.stringify(documentsResponse.data.folder)}`);
        
        // Also create in files API for consistency
        try {
          // Convert parentId to folderPath format
          const folderPath = parentId === 'root' ? '' : parentId;
          
          log(`Also creating folder in files API at path "${folderPath}"...`);
          await axios.post(`${FILES_API}/folder`, {
            folderPath,
            folderName
          });
          
          log('Folder also created in files API');
        } catch (filesError) {
          log(`Warning: Error creating folder in files API: ${filesError.message}`);
        }
        
        return {
          success: true,
          data: documentsResponse.data.folder,
          message: documentsResponse.data.message || 'Folder created successfully'
        };
      }
      
      log('Invalid response from documents API');
      throw new Error('Invalid response from documents API');
    } catch (documentsError) {
      log(`Error creating folder in documents API: ${documentsError.message}`);
      
      try {
        // Convert parentId to folderPath format
        const folderPath = parentId === 'root' ? '' : parentId;
        
        log(`Falling back to files API, creating folder at path "${folderPath}"...`);
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
          
          log(`Successfully created folder in files API: ${JSON.stringify(folder)}`);
          return {
            success: true,
            data: folder,
            message: 'Folder created successfully'
          };
        }
        
        log('Invalid response from files API');
        throw new Error('Invalid response from files API');
      } catch (filesError) {
        log(`Error creating folder in files API: ${filesError.message}`);
        return {
          success: false,
          error: filesError.message || 'Failed to create folder'
        };
      }
    }
  },
  
  // Get directory contents
  async getDirectoryContents(dirPath = '') {
    try {
      log(`Getting directory contents for path "${dirPath}"...`);
      const response = await axios.get(`${FILES_API}`, {
        params: { dirPath }
      });
      
      if (response.data && response.data.data) {
        // Add id field to each item for consistency
        const contents = response.data.data.map(item => ({
          ...item,
          id: item.path
        }));
        
        log(`Successfully retrieved ${contents.length} items from directory`);
        return {
          success: true,
          data: contents
        };
      }
      
      log('No contents found in response');
      return {
        success: false,
        error: 'No contents found in response'
      };
    } catch (error) {
      log(`Error getting directory contents: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Failed to retrieve directory contents'
      };
    }
  },
  
  // Delete a folder
  async deleteFolder(folderId) {
    try {
      log(`Attempting to delete folder "${folderId}" using documents API...`);
      const documentsResponse = await axios.delete(`${DOCUMENTS_API}/folders/${folderId}`);
      
      log('Successfully deleted folder in documents API');
      
      // Also delete in files API for consistency
      try {
        log(`Also deleting folder in files API...`);
        await axios.delete(`${FILES_API}/${encodeURIComponent(folderId)}`);
        log('Folder also deleted in files API');
      } catch (filesError) {
        log(`Warning: Error deleting folder in files API: ${filesError.message}`);
      }
      
      return {
        success: true,
        message: documentsResponse.data?.message || 'Folder deleted successfully'
      };
    } catch (documentsError) {
      log(`Error deleting folder in documents API: ${documentsError.message}`);
      
      try {
        log(`Falling back to files API...`);
        const filesResponse = await axios.delete(`${FILES_API}/${encodeURIComponent(folderId)}`);
        
        log('Successfully deleted folder in files API');
        return {
          success: filesResponse.data?.success || true,
          message: filesResponse.data?.message || 'Folder deleted successfully'
        };
      } catch (filesError) {
        log(`Error deleting folder in files API: ${filesError.message}`);
        return {
          success: false,
          error: filesError.message || 'Failed to delete folder'
        };
      }
    }
  },
  
  // Helper method to extract parent ID from path
  _getParentId(path) {
    if (!path || path === '/') return 'root';
    
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return 'root';
    
    parts.pop(); // Remove the last part (current folder name)
    return parts.length === 0 ? 'root' : '/' + parts.join('/');
  }
};

// Test functions
async function testGetAllFolders() {
  log('=== Testing getAllFolders ===');
  const response = await unifiedDocumentService.getAllFolders();
  
  if (response.success) {
    log(`✅ Successfully retrieved ${response.data.length} folders`);
    log('Sample folders:');
    response.data.slice(0, 3).forEach(folder => {
      log(`  - ${folder.name} (${folder.id || folder.path})`);
    });
  } else {
    log(`❌ Failed to retrieve folders: ${response.error}`);
  }
  
  return response;
}

async function testCreateFolder() {
  log('=== Testing createFolder ===');
  const response = await unifiedDocumentService.createFolder(TEST_FOLDER_NAME);
  
  if (response.success) {
    log(`✅ Successfully created folder: ${TEST_FOLDER_NAME}`);
    log(`Folder details: ${JSON.stringify(response.data)}`);
  } else {
    log(`❌ Failed to create folder: ${response.error}`);
  }
  
  return response;
}

async function testCreateSubfolder(parentId) {
  log(`=== Testing createFolder (subfolder in ${parentId}) ===`);
  const response = await unifiedDocumentService.createFolder(TEST_SUBFOLDER_NAME, parentId);
  
  if (response.success) {
    log(`✅ Successfully created subfolder: ${TEST_SUBFOLDER_NAME} in ${parentId}`);
    log(`Subfolder details: ${JSON.stringify(response.data)}`);
  } else {
    log(`❌ Failed to create subfolder: ${response.error}`);
  }
  
  return response;
}

async function testGetDirectoryContents(dirPath) {
  log(`=== Testing getDirectoryContents for path "${dirPath}" ===`);
  const response = await unifiedDocumentService.getDirectoryContents(dirPath);
  
  if (response.success) {
    log(`✅ Successfully retrieved ${response.data.length} items from directory`);
    log('Items:');
    response.data.forEach(item => {
      log(`  - ${item.name} (${item.isDirectory ? 'Folder' : 'File'})`);
    });
  } else {
    log(`❌ Failed to retrieve directory contents: ${response.error}`);
  }
  
  return response;
}

async function testDeleteFolder(folderId) {
  log(`=== Testing deleteFolder for "${folderId}" ===`);
  const response = await unifiedDocumentService.deleteFolder(folderId);
  
  if (response.success) {
    log(`✅ Successfully deleted folder: ${folderId}`);
  } else {
    log(`❌ Failed to delete folder: ${response.error}`);
  }
  
  return response;
}

// Main test function
async function runTests() {
  try {
    log('Starting folder rendering tests...');
    
    // Test getting all folders
    const foldersResponse = await testGetAllFolders();
    
    // Test creating a folder
    const createResponse = await testCreateFolder();
    if (!createResponse.success) {
      log('❌ Cannot continue tests without successfully creating a folder');
      return;
    }
    
    const newFolderId = createResponse.data.id || createResponse.data.path;
    
    // Wait a moment to ensure backend processing completes
    log('Waiting for backend processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test getting directory contents (root)
    await testGetDirectoryContents('');
    
    // Test creating a subfolder
    const createSubfolderResponse = await testCreateSubfolder(newFolderId);
    if (!createSubfolderResponse.success) {
      log('❌ Failed to create subfolder, but continuing tests');
    }
    
    // Wait a moment to ensure backend processing completes
    log('Waiting for backend processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test getting all folders again to verify the new folder appears
    await testGetAllFolders();
    
    // Test getting directory contents of the new folder
    if (newFolderId) {
      await testGetDirectoryContents(newFolderId);
    }
    
    // Clean up: delete the test folders
    if (createSubfolderResponse.success) {
      const subFolderId = createSubfolderResponse.data.id || createSubfolderResponse.data.path;
      await testDeleteFolder(subFolderId);
    }
    
    if (newFolderId) {
      await testDeleteFolder(newFolderId);
    }
    
    log('All tests completed!');
  } catch (error) {
    log(`❌ Error during tests: ${error.message}`);
    console.error(error);
  }
}

// Run the tests
runTests();
