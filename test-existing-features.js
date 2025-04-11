/**
 * Test script to verify that existing features are preserved
 * This script tests the documents section and workflow functionality
 * to ensure they haven't been broken by the translate node implementation
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_FILES_DIR = path.join(__dirname, 'test-files');

// Test document section functionality
async function testDocumentSection() {
  console.log('\nTesting document section functionality...');
  
  try {
    // 1. Test folder creation
    console.log('Testing folder creation...');
    const folderResponse = await axios.post(`${API_BASE_URL}/files/folder`, {
      name: 'test-folder',
      path: '/'
    });
    
    if (!folderResponse.data.success) {
      console.error('Folder creation test failed:', folderResponse.data.error);
      return false;
    }
    
    console.log('Folder creation test passed.');
    
    // 2. Test file upload to folder
    console.log('Testing file upload to folder...');
    const testFileContent = 'This is a test file to verify document functionality.';
    await writeFile(path.join(TEST_FILES_DIR, 'test_document.txt'), testFileContent);
    
    const formData = new FormData();
    formData.append('file', new Blob([testFileContent], { type: 'text/plain' }), 'test_document.txt');
    formData.append('path', '/test-folder');
    
    const uploadResponse = await axios.post(`${API_BASE_URL}/files/upload`, formData);
    
    if (!uploadResponse.data.success) {
      console.error('File upload test failed:', uploadResponse.data.error);
      return false;
    }
    
    const uploadedFileId = uploadResponse.data.file.id;
    console.log('File upload test passed.');
    
    // 3. Test file viewing
    console.log('Testing file viewing...');
    const viewResponse = await axios.get(`${API_BASE_URL}/files/${uploadedFileId}`);
    
    if (!viewResponse.data.success || viewResponse.data.file.content !== testFileContent) {
      console.error('File viewing test failed');
      return false;
    }
    
    console.log('File viewing test passed.');
    
    // 4. Test file deletion
    console.log('Testing file deletion...');
    const deleteFileResponse = await axios.delete(`${API_BASE_URL}/files/${uploadedFileId}`);
    
    if (!deleteFileResponse.data.success) {
      console.error('File deletion test failed:', deleteFileResponse.data.error);
      return false;
    }
    
    console.log('File deletion test passed.');
    
    // 5. Test folder deletion
    console.log('Testing folder deletion...');
    const deleteFolderResponse = await axios.delete(`${API_BASE_URL}/files/folder`, {
      data: { path: '/test-folder' }
    });
    
    if (!deleteFolderResponse.data.success) {
      console.error('Folder deletion test failed:', deleteFolderResponse.data.error);
      return false;
    }
    
    console.log('Folder deletion test passed.');
    
    console.log('All document section tests passed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing document section:', error);
    return false;
  }
}

// Test workflow section functionality
async function testWorkflowSection() {
  console.log('\nTesting workflow section functionality...');
  
  try {
    // 1. Test workflow creation
    console.log('Testing workflow creation...');
    const workflowData = {
      name: 'Test Workflow',
      description: 'A test workflow to verify functionality',
      nodes: [
        {
          id: '1',
          type: 'communicationNode',
          position: { x: 100, y: 100 },
          data: { label: 'Communication Node' }
        },
        {
          id: '2',
          type: 'simetrikNode',
          position: { x: 300, y: 100 },
          data: { label: 'Simetrik Node' }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true }
      ]
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/workflows`, workflowData);
    
    if (!createResponse.data.success) {
      console.error('Workflow creation test failed:', createResponse.data.error);
      return false;
    }
    
    const workflowId = createResponse.data.workflow.id;
    console.log('Workflow creation test passed.');
    
    // 2. Test workflow retrieval
    console.log('Testing workflow retrieval...');
    const getResponse = await axios.get(`${API_BASE_URL}/workflows/${workflowId}`);
    
    if (!getResponse.data.success) {
      console.error('Workflow retrieval test failed:', getResponse.data.error);
      return false;
    }
    
    console.log('Workflow retrieval test passed.');
    
    // 3. Test workflow update
    console.log('Testing workflow update...');
    const updatedWorkflow = {
      ...getResponse.data.workflow,
      name: 'Updated Test Workflow',
      nodes: [
        ...getResponse.data.workflow.nodes,
        {
          id: '3',
          type: 'comparisonNode',
          position: { x: 500, y: 100 },
          data: { label: 'Comparison Node' }
        }
      ],
      edges: [
        ...getResponse.data.workflow.edges,
        { id: 'e2-3', source: '2', target: '3', animated: true }
      ]
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/workflows/${workflowId}`, updatedWorkflow);
    
    if (!updateResponse.data.success) {
      console.error('Workflow update test failed:', updateResponse.data.error);
      return false;
    }
    
    console.log('Workflow update test passed.');
    
    // 4. Test workflow deletion
    console.log('Testing workflow deletion...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`);
    
    if (!deleteResponse.data.success) {
      console.error('Workflow deletion test failed:', deleteResponse.data.error);
      return false;
    }
    
    console.log('Workflow deletion test passed.');
    
    console.log('All workflow section tests passed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing workflow section:', error);
    return false;
  }
}

// Test left menu navigation
async function testLeftMenuNavigation() {
  console.log('\nTesting left menu navigation...');
  
  try {
    // This would typically be tested with browser automation
    // For this script, we'll just check that the routes exist
    
    // 1. Test documents route
    console.log('Testing documents route...');
    const documentsResponse = await axios.get(`${API_BASE_URL}/routes/documents`);
    
    if (!documentsResponse.data.success) {
      console.error('Documents route test failed');
      return false;
    }
    
    console.log('Documents route test passed.');
    
    // 2. Test workflows route
    console.log('Testing workflows route...');
    const workflowsResponse = await axios.get(`${API_BASE_URL}/routes/workflows`);
    
    if (!workflowsResponse.data.success) {
      console.error('Workflows route test failed');
      return false;
    }
    
    console.log('Workflows route test passed.');
    
    console.log('All left menu navigation tests passed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing left menu navigation:', error);
    return false;
  }
}

// Test unique URL generation for documents
async function testUniqueUrlGeneration() {
  console.log('\nTesting unique URL generation for documents...');
  
  try {
    // 1. Create a test file
    console.log('Creating test file...');
    const testFileContent = 'This is a test file for unique URL generation.';
    await writeFile(path.join(TEST_FILES_DIR, 'unique_url_test.txt'), testFileContent);
    
    const formData = new FormData();
    formData.append('file', new Blob([testFileContent], { type: 'text/plain' }), 'unique_url_test.txt');
    formData.append('path', '/');
    
    const uploadResponse = await axios.post(`${API_BASE_URL}/files/upload`, formData);
    
    if (!uploadResponse.data.success) {
      console.error('File upload for unique URL test failed:', uploadResponse.data.error);
      return false;
    }
    
    const fileId = uploadResponse.data.file.id;
    console.log('Test file created successfully.');
    
    // 2. Generate unique URL
    console.log('Testing unique URL generation...');
    const urlResponse = await axios.post(`${API_BASE_URL}/files/${fileId}/share`);
    
    if (!urlResponse.data.success || !urlResponse.data.shareUrl) {
      console.error('Unique URL generation test failed');
      return false;
    }
    
    const shareUrl = urlResponse.data.shareUrl;
    console.log('Unique URL generation test passed.');
    
    // 3. Access file via unique URL
    console.log('Testing file access via unique URL...');
    const accessResponse = await axios.get(shareUrl);
    
    if (!accessResponse.data.success || accessResponse.data.file.content !== testFileContent) {
      console.error('File access via unique URL test failed');
      return false;
    }
    
    console.log('File access via unique URL test passed.');
    
    // 4. Clean up
    console.log('Cleaning up...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/files/${fileId}`);
    
    if (!deleteResponse.data.success) {
      console.error('File deletion for cleanup failed:', deleteResponse.data.error);
      return false;
    }
    
    console.log('Cleanup successful.');
    
    console.log('All unique URL generation tests passed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing unique URL generation:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting tests to verify existing features are preserved...');
  
  try {
    // Ensure test files directory exists
    if (!fs.existsSync(TEST_FILES_DIR)) {
      await mkdir(TEST_FILES_DIR);
    }
    
    // Test document section
    const documentResult = await testDocumentSection();
    if (!documentResult) {
      console.error('Document section tests failed.');
      return false;
    }
    
    // Test workflow section
    const workflowResult = await testWorkflowSection();
    if (!workflowResult) {
      console.error('Workflow section tests failed.');
      return false;
    }
    
    // Test left menu navigation
    const navigationResult = await testLeftMenuNavigation();
    if (!navigationResult) {
      console.error('Left menu navigation tests failed.');
      return false;
    }
    
    // Test unique URL generation
    const urlResult = await testUniqueUrlGeneration();
    if (!urlResult) {
      console.error('Unique URL generation tests failed.');
      return false;
    }
    
    console.log('\nAll tests passed successfully! Existing features are preserved.');
    return true;
  } catch (error) {
    console.error('Error running tests:', error);
    return false;
  }
}

// Run tests
runTests()
  .then(result => {
    if (result) {
      console.log('Existing features verified and preserved.');
    } else {
      console.error('Some existing features may be broken.');
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
  });
