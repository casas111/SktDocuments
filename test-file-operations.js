/**
 * Test script for file uploading and file/folder deletion
 * 
 * This script tests the file uploading and file/folder deletion functionality
 * using the unified document service.
 */

const unifiedDocumentService = require('../Frontend/src/services/unifiedDocumentService');
const fs = require('fs');
const path = require('path');

// Test file uploading
async function testFileUpload() {
  console.log('=== Testing File Upload Functionality ===');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-file-upload.txt');
  const testFileContent = 'This is a test file for upload functionality.';
  
  try {
    // Write test file
    fs.writeFileSync(testFilePath, testFileContent);
    console.log(`Created test file: ${testFilePath}`);
    
    // Create a test folder first
    const testFolderName = `test-folder-${Date.now()}`;
    console.log(`Creating test folder: ${testFolderName}`);
    
    const createFolderResponse = await unifiedDocumentService.createFolder(testFolderName, '/');
    
    if (createFolderResponse.success && createFolderResponse.data) {
      const folderPath = createFolderResponse.data.path;
      console.log(`✅ Test folder created: ${folderPath}`);
      
      // Upload file to the test folder
      console.log(`Uploading test file to folder: ${folderPath}`);
      
      // Create a File object from the test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], 'test-file-upload.txt', { type: 'text/plain' });
      
      const uploadResponse = await unifiedDocumentService.uploadFiles([file], folderPath);
      
      if (uploadResponse.success) {
        console.log('✅ File uploaded successfully');
        
        // Verify file exists in the folder
        const contentsResponse = await unifiedDocumentService.getDirectoryContents(folderPath);
        
        if (contentsResponse.success && contentsResponse.data) {
          const uploadedFile = contentsResponse.data.find(item => item.name === 'test-file-upload.txt');
          
          if (uploadedFile) {
            console.log('✅ Uploaded file found in directory contents');
            
            // Test file deletion
            console.log(`Testing file deletion for: ${uploadedFile.path}`);
            const deleteFileResponse = await unifiedDocumentService.deleteFile(uploadedFile.path);
            
            if (deleteFileResponse.success) {
              console.log('✅ File deleted successfully');
              
              // Verify file is deleted
              const updatedContentsResponse = await unifiedDocumentService.getDirectoryContents(folderPath);
              
              if (updatedContentsResponse.success && updatedContentsResponse.data) {
                const deletedFile = updatedContentsResponse.data.find(item => item.name === 'test-file-upload.txt');
                
                if (!deletedFile) {
                  console.log('✅ File deletion verified - file no longer exists in directory');
                } else {
                  console.error('❌ File still exists after deletion');
                  return false;
                }
              }
            } else {
              console.error('❌ Failed to delete file:', deleteFileResponse.error);
              return false;
            }
            
            // Test folder deletion
            console.log(`Testing folder deletion for: ${folderPath}`);
            const deleteFolderResponse = await unifiedDocumentService.deleteFolder(folderPath);
            
            if (deleteFolderResponse.success) {
              console.log('✅ Folder deleted successfully');
              
              // Verify folder is deleted
              const rootContentsResponse = await unifiedDocumentService.getDirectoryContents('/');
              
              if (rootContentsResponse.success && rootContentsResponse.data) {
                const deletedFolder = rootContentsResponse.data.find(item => item.path === folderPath);
                
                if (!deletedFolder) {
                  console.log('✅ Folder deletion verified - folder no longer exists in root directory');
                  return true;
                } else {
                  console.error('❌ Folder still exists after deletion');
                  return false;
                }
              }
            } else {
              console.error('❌ Failed to delete folder:', deleteFolderResponse.error);
              return false;
            }
          } else {
            console.error('❌ Uploaded file not found in directory contents');
            return false;
          }
        } else {
          console.error('❌ Failed to get directory contents:', contentsResponse.error);
          return false;
        }
      } else {
        console.error('❌ Failed to upload file:', uploadResponse.error);
        return false;
      }
    } else {
      console.error('❌ Failed to create test folder:', createFolderResponse.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
    return false;
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log(`Cleaned up test file: ${testFilePath}`);
    }
  }
}

// Run the test
testFileUpload()
  .then(success => {
    if (success) {
      console.log('🎉 All tests passed!');
    } else {
      console.error('❌ Some tests failed');
    }
  })
  .catch(error => {
    console.error('❌ Error running tests:', error);
  });
