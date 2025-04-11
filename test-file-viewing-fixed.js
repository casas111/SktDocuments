/**
 * Test script for file viewing and downloading
 * 
 * This script tests the file viewing and downloading functionality
 * using the unified document service.
 */

const unifiedDocumentService = require('../Frontend/src/services/unifiedDocumentService');
const fs = require('fs');
const path = require('path');

// Test file viewing and downloading
async function testFileViewing() {
  console.log('=== Testing File Viewing and Downloading ===');
  
  // First, get directory contents to find a file
  console.log('Getting directory contents from root...');
  
  const contentsResponse = await unifiedDocumentService.getDirectoryContents('/');
  
  if (contentsResponse.success && contentsResponse.data) {
    const contents = contentsResponse.data;
    const files = contents.filter(item => !item.isDirectory);
    
    if (files.length > 0) {
      // Use the first file for testing
      const testFile = files[0];
      console.log(`Found file for testing: ${testFile.name} (${testFile.path})`);
      
      // Get file info
      console.log(`Getting file info for: ${testFile.path}`);
      const fileInfoResponse = await unifiedDocumentService.getFileInfo(testFile.path);
      
      if (fileInfoResponse.success && fileInfoResponse.data) {
        const fileInfo = fileInfoResponse.data;
        console.log('✅ File info retrieved successfully:', fileInfo);
        
        // Check if download URL is available
        if (fileInfo.downloadUrl) {
          console.log('✅ Download URL is available:', fileInfo.downloadUrl);
        } else {
          console.error('❌ Download URL is not available');
          return false;
        }
        
        // Check if preview URL is available for viewable files
        if (fileInfo.type.startsWith('image/') || fileInfo.type === 'application/pdf') {
          if (fileInfo.previewUrl) {
            console.log('✅ Preview URL is available:', fileInfo.previewUrl);
          } else {
            console.error('❌ Preview URL is not available for viewable file');
            return false;
          }
        }
        
        console.log('✅ File viewing test completed successfully');
        return true;
      } else {
        console.error('❌ Failed to get file info:', fileInfoResponse.error);
        return false;
      }
    } else {
      console.log('No files found in root directory. Creating a test file...');
      
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-files', 'test-file.txt');
      const testFileContent = 'This is a test file for file viewing and downloading.';
      
      try {
        // Ensure test-files directory exists
        if (!fs.existsSync(path.join(__dirname, 'test-files'))) {
          fs.mkdirSync(path.join(__dirname, 'test-files'));
        }
        
        // Write test file
        fs.writeFileSync(testFilePath, testFileContent);
        console.log(`Created test file: ${testFilePath}`);
        
        // Upload the test file
        const formData = new FormData();
        formData.append('files', new File([testFileContent], 'test-file.txt', { type: 'text/plain' }));
        formData.append('folderPath', '/');
        
        console.log('Uploading test file...');
        const uploadResponse = await unifiedDocumentService.uploadFiles([new File([testFileContent], 'test-file.txt', { type: 'text/plain' })], '/');
        
        if (uploadResponse.success && uploadResponse.data) {
          console.log('✅ Test file uploaded successfully:', uploadResponse.data);
          
          // Get directory contents again to find the uploaded file
          const updatedContentsResponse = await unifiedDocumentService.getDirectoryContents('/');
          
          if (updatedContentsResponse.success && updatedContentsResponse.data) {
            const updatedContents = updatedContentsResponse.data;
            const uploadedFile = updatedContents.find(item => item.name === 'test-file.txt');
            
            if (uploadedFile) {
              console.log('✅ Uploaded file found in directory contents:', uploadedFile);
              
              // Get file info
              console.log(`Getting file info for: ${uploadedFile.path}`);
              const fileInfoResponse = await unifiedDocumentService.getFileInfo(uploadedFile.path);
              
              if (fileInfoResponse.success && fileInfoResponse.data) {
                const fileInfo = fileInfoResponse.data;
                console.log('✅ File info retrieved successfully:', fileInfo);
                
                // Check if download URL is available
                if (fileInfo.downloadUrl) {
                  console.log('✅ Download URL is available:', fileInfo.downloadUrl);
                } else {
                  console.error('❌ Download URL is not available');
                  return false;
                }
                
                console.log('✅ File viewing test completed successfully');
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
            console.error('❌ Failed to get updated directory contents:', updatedContentsResponse.error);
            return false;
          }
        } else {
          console.error('❌ Failed to upload test file:', uploadResponse.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Error creating or uploading test file:', error);
        return false;
      }
    }
  } else {
    console.error('❌ Failed to get directory contents:', contentsResponse.error);
    return false;
  }
}

// Run the test
testFileViewing()
  .then(success => {
    if (success) {
      console.log('🎉 All file viewing tests passed!');
    } else {
      console.error('❌ Some file viewing tests failed');
    }
  })
  .catch(error => {
    console.error('❌ Error running tests:', error);
  });
