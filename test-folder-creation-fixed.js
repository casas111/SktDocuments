/**
 * Test script for folder creation and navigation
 * 
 * This script tests the folder creation functionality and navigation
 * using the unified document service.
 */

const unifiedDocumentService = require('../Frontend/src/services/unifiedDocumentService');

// Test folder creation
async function testFolderCreation() {
  console.log('=== Testing Folder Creation ===');
  
  // Create a test folder in the root
  const testFolderName = `test-folder-${Date.now()}`;
  console.log(`Creating test folder: ${testFolderName}`);
  
  const createResponse = await unifiedDocumentService.createFolder(testFolderName, 'root');
  
  if (createResponse.success && createResponse.data) {
    console.log('✅ Folder created successfully:', createResponse.data);
    
    // Get all folders to verify the new folder is listed
    const foldersResponse = await unifiedDocumentService.getAllFolders();
    
    if (foldersResponse.success && foldersResponse.data) {
      const folders = foldersResponse.data;
      const createdFolder = folders.find(folder => folder.name === testFolderName);
      
      if (createdFolder) {
        console.log('✅ Folder found in folder list:', createdFolder);
        
        // Create a subfolder
        const subfolderName = `subfolder-${Date.now()}`;
        console.log(`Creating subfolder: ${subfolderName} in ${createdFolder.path}`);
        
        const subfolderResponse = await unifiedDocumentService.createFolder(subfolderName, createdFolder.path);
        
        if (subfolderResponse.success && subfolderResponse.data) {
          console.log('✅ Subfolder created successfully:', subfolderResponse.data);
          
          // Get directory contents to verify the subfolder is listed
          const contentsResponse = await unifiedDocumentService.getDirectoryContents(createdFolder.path);
          
          if (contentsResponse.success && contentsResponse.data) {
            const contents = contentsResponse.data;
            const createdSubfolder = contents.find(item => item.name === subfolderName && item.isDirectory);
            
            if (createdSubfolder) {
              console.log('✅ Subfolder found in directory contents:', createdSubfolder);
              
              // Clean up - delete the subfolder
              console.log(`Cleaning up - deleting subfolder: ${createdSubfolder.path}`);
              await unifiedDocumentService.deleteFolder(createdSubfolder.path);
              
              // Clean up - delete the test folder
              console.log(`Cleaning up - deleting test folder: ${createdFolder.path}`);
              await unifiedDocumentService.deleteFolder(createdFolder.path);
              
              console.log('✅ Test completed successfully');
              return true;
            } else {
              console.error('❌ Subfolder not found in directory contents');
              return false;
            }
          } else {
            console.error('❌ Failed to get directory contents:', contentsResponse.error);
            return false;
          }
        } else {
          console.error('❌ Failed to create subfolder:', subfolderResponse.error);
          return false;
        }
      } else {
        console.error('❌ Created folder not found in folder list');
        return false;
      }
    } else {
      console.error('❌ Failed to get folders:', foldersResponse.error);
      return false;
    }
  } else {
    console.error('❌ Failed to create folder:', createResponse.error);
    return false;
  }
}

// Run the test
testFolderCreation()
  .then(success => {
    if (success) {
      console.log('🎉 All folder creation tests passed!');
    } else {
      console.error('❌ Some folder creation tests failed');
    }
  })
  .catch(error => {
    console.error('❌ Error running tests:', error);
  });
