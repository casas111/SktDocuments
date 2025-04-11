/**
 * Verification script for ensuring working features are preserved
 * 
 * This script verifies that the existing working features are still functioning
 * correctly after implementing the fixes.
 */

const unifiedDocumentService = require('../Frontend/src/services/unifiedDocumentService');
const fs = require('fs');
const path = require('path');

// Test folder creation and navigation
async function testFolderCreationAndNavigation() {
  console.log('=== Testing Folder Creation and Navigation ===');
  
  try {
    // Create a test folder
    const testFolderName = `test-folder-${Date.now()}`;
    console.log(`Creating test folder: ${testFolderName}`);
    
    const createFolderResponse = await unifiedDocumentService.createFolder(testFolderName, '/');
    
    if (createFolderResponse.success && createFolderResponse.data) {
      const folderPath = createFolderResponse.data.path;
      console.log(`✅ Test folder created: ${folderPath}`);
      
      // Get directory contents to verify folder exists
      const contentsResponse = await unifiedDocumentService.getDirectoryContents('/');
      
      if (contentsResponse.success && contentsResponse.data) {
        const createdFolder = contentsResponse.data.find(item => item.path === folderPath);
        
        if (createdFolder) {
          console.log('✅ Folder found in directory contents');
          
          // Create a subfolder to test navigation
          const subfolderName = `subfolder-${Date.now()}`;
          console.log(`Creating subfolder: ${subfolderName} in ${folderPath}`);
          
          const createSubfolderResponse = await unifiedDocumentService.createFolder(subfolderName, folderPath);
          
          if (createSubfolderResponse.success && createSubfolderResponse.data) {
            const subfolderPath = createSubfolderResponse.data.path;
            console.log(`✅ Subfolder created: ${subfolderPath}`);
            
            // Get directory contents of the parent folder
            const parentContentsResponse = await unifiedDocumentService.getDirectoryContents(folderPath);
            
            if (parentContentsResponse.success && parentContentsResponse.data) {
              const createdSubfolder = parentContentsResponse.data.find(item => item.path === subfolderPath);
              
              if (createdSubfolder) {
                console.log('✅ Subfolder found in parent folder contents');
                console.log('✅ Folder creation and navigation test passed');
                
                // Clean up - delete the subfolder
                await unifiedDocumentService.deleteFolder(subfolderPath);
                
                // Clean up - delete the test folder
                await unifiedDocumentService.deleteFolder(folderPath);
                
                return true;
              } else {
                console.error('❌ Subfolder not found in parent folder contents');
                return false;
              }
            } else {
              console.error('❌ Failed to get parent folder contents:', parentContentsResponse.error);
              return false;
            }
          } else {
            console.error('❌ Failed to create subfolder:', createSubfolderResponse.error);
            return false;
          }
        } else {
          console.error('❌ Created folder not found in directory contents');
          return false;
        }
      } else {
        console.error('❌ Failed to get directory contents:', contentsResponse.error);
        return false;
      }
    } else {
      console.error('❌ Failed to create test folder:', createFolderResponse.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during folder creation and navigation test:', error);
    return false;
  }
}

// Test file viewing and downloading
async function testFileViewingAndDownloading() {
  console.log('=== Testing File Viewing and Downloading ===');
  
  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file-view.txt');
    const testFileContent = 'This is a test file for viewing and downloading.';
    
    // Write test file
    fs.writeFileSync(testFilePath, testFileContent);
    console.log(`Created test file: ${testFilePath}`);
    
    // Create a test folder
    const testFolderName = `test-folder-view-${Date.now()}`;
    console.log(`Creating test folder: ${testFolderName}`);
    
    const createFolderResponse = await unifiedDocumentService.createFolder(testFolderName, '/');
    
    if (createFolderResponse.success && createFolderResponse.data) {
      const folderPath = createFolderResponse.data.path;
      console.log(`✅ Test folder created: ${folderPath}`);
      
      // Upload file to the test folder
      console.log(`Uploading test file to folder: ${folderPath}`);
      
      // Create a File object from the test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], 'test-file-view.txt', { type: 'text/plain' });
      
      const uploadResponse = await unifiedDocumentService.uploadFiles([file], folderPath);
      
      if (uploadResponse.success) {
        console.log('✅ File uploaded successfully');
        
        // Get directory contents to find the uploaded file
        const contentsResponse = await unifiedDocumentService.getDirectoryContents(folderPath);
        
        if (contentsResponse.success && contentsResponse.data) {
          const uploadedFile = contentsResponse.data.find(item => item.name === 'test-file-view.txt');
          
          if (uploadedFile) {
            console.log('✅ Uploaded file found in directory contents');
            
            // Get file info to check viewing and downloading URLs
            const fileInfoResponse = await unifiedDocumentService.getFileInfo(uploadedFile.path);
            
            if (fileInfoResponse.success && fileInfoResponse.data) {
              const fileInfo = fileInfoResponse.data;
              
              // Check if download URL is available
              if (fileInfo.downloadUrl) {
                console.log('✅ Download URL is available:', fileInfo.downloadUrl);
              } else {
                console.error('❌ Download URL is not available');
                return false;
              }
              
              console.log('✅ File viewing and downloading test passed');
              
              // Clean up - delete the file
              await unifiedDocumentService.deleteFile(uploadedFile.path);
              
              // Clean up - delete the test folder
              await unifiedDocumentService.deleteFolder(folderPath);
              
              return true;
            } else {
              console.error('❌ Failed to get file info:', fileInfoResponse.error);
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
    console.error('❌ Error during file viewing and downloading test:', error);
    return false;
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log(`Cleaned up test file: ${testFilePath}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Starting Verification of Working Features ===');
  
  const folderCreationResult = await testFolderCreationAndNavigation();
  const fileViewingResult = await testFileViewingAndDownloading();
  
  if (folderCreationResult && fileViewingResult) {
    console.log('🎉 All working features are preserved!');
    return true;
  } else {
    console.error('❌ Some working features may be broken');
    return false;
  }
}

// Run the tests
runAllTests()
  .then(success => {
    if (success) {
      console.log('✅ Verification completed successfully');
    } else {
      console.error('❌ Verification failed');
    }
  })
  .catch(error => {
    console.error('❌ Error running verification:', error);
  });
