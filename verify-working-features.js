/**
 * Verification script for ensuring working features are preserved
 * 
 * This script verifies that the existing working features are still functioning
 * correctly after implementing the fixes.
 */

// Import required modules
const axios = require('axios');
const { API_BASE_URL } = require('../Frontend/src/config');

// Test workflow functionality (which should not be touched)
async function testWorkflowFunctionality() {
  console.log('=== Testing Workflow Functionality ===');
  
  try {
    // List all workflows
    console.log('Getting all workflows...');
    const workflowsResponse = await axios.get(`${API_BASE_URL}/workflow`);
    
    if (workflowsResponse.data && workflowsResponse.data.success) {
      console.log('✅ Successfully retrieved workflows');
      const workflows = workflowsResponse.data.data || [];
      console.log(`Found ${workflows.length} workflows`);
      
      // If there are workflows, test getting a specific one
      if (workflows.length > 0) {
        const testWorkflow = workflows[0];
        console.log(`Testing retrieval of workflow: ${testWorkflow.id}`);
        
        const workflowResponse = await axios.get(`${API_BASE_URL}/workflow/${testWorkflow.id}`);
        
        if (workflowResponse.data && workflowResponse.data.success) {
          console.log('✅ Successfully retrieved specific workflow');
        } else {
          console.error('❌ Failed to retrieve specific workflow');
          return false;
        }
      } else {
        console.log('No existing workflows to test. Creating a test workflow...');
        
        // Create a test workflow
        const testWorkflow = {
          name: 'Test Workflow',
          description: 'This is a test workflow to verify functionality',
          processes: []
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/workflow`, testWorkflow);
        
        if (createResponse.data && createResponse.data.success) {
          console.log('✅ Successfully created test workflow');
          
          // Clean up - delete the test workflow
          const workflowId = createResponse.data.data.id;
          console.log(`Cleaning up - deleting test workflow: ${workflowId}`);
          
          const deleteResponse = await axios.delete(`${API_BASE_URL}/workflow/${workflowId}`);
          
          if (deleteResponse.data && deleteResponse.data.success) {
            console.log('✅ Successfully deleted test workflow');
          } else {
            console.error('❌ Failed to delete test workflow');
          }
        } else {
          console.error('❌ Failed to create test workflow');
          return false;
        }
      }
    } else {
      console.error('❌ Failed to retrieve workflows');
      return false;
    }
    
    console.log('✅ Workflow functionality test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error testing workflow functionality:', error.message);
    return false;
  }
}

// Test document upload functionality
async function testDocumentUpload() {
  console.log('=== Testing Document Upload Functionality ===');
  
  try {
    // Create a test document
    const testDocument = {
      name: 'Test Document',
      content: 'This is a test document to verify upload functionality'
    };
    
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', new Blob([testDocument.content], { type: 'text/plain' }), 'test-document.txt');
    
    console.log('Uploading test document...');
    const uploadResponse = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (uploadResponse.data && uploadResponse.data.success) {
      console.log('✅ Successfully uploaded test document');
      
      const documentId = uploadResponse.data.document.id;
      console.log(`Document ID: ${documentId}`);
      
      // Verify the document was uploaded by retrieving it
      console.log('Verifying document was uploaded...');
      const getResponse = await axios.get(`${API_BASE_URL}/documents/${documentId}`);
      
      if (getResponse.data && getResponse.data.success) {
        console.log('✅ Successfully retrieved uploaded document');
        
        // Verify the document has a unique URL
        if (getResponse.data.document && getResponse.data.document.url) {
          console.log('✅ Document has a unique URL:', getResponse.data.document.url);
        } else {
          console.error('❌ Document does not have a unique URL');
          return false;
        }
        
        // Clean up - delete the test document
        console.log(`Cleaning up - deleting test document: ${documentId}`);
        const deleteResponse = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
        
        if (deleteResponse.data && deleteResponse.data.success) {
          console.log('✅ Successfully deleted test document');
        } else {
          console.error('❌ Failed to delete test document');
        }
      } else {
        console.error('❌ Failed to retrieve uploaded document');
        return false;
      }
    } else {
      console.error('❌ Failed to upload test document');
      return false;
    }
    
    console.log('✅ Document upload functionality test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error testing document upload functionality:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Starting Verification of Working Features ===');
  
  const workflowResult = await testWorkflowFunctionality();
  const uploadResult = await testDocumentUpload();
  
  if (workflowResult && uploadResult) {
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
