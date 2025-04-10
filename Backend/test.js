#!/usr/bin/env node

/**
 * Test script for the workflow backend
 * This script tests the main functionality of the backend
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = 'http://localhost:3001/api';
const TEST_FILE_PATH = path.join(__dirname, 'test-files');
const TEST_DOCUMENT_PATH = path.join(TEST_FILE_PATH, 'test-document.txt');
const TEST_EXAMPLE_PATH = path.join(TEST_FILE_PATH, 'test-example.txt');

// Ensure test files directory exists
fs.ensureDirSync(TEST_FILE_PATH);

// Create test files if they don't exist
if (!fs.existsSync(TEST_DOCUMENT_PATH)) {
  fs.writeFileSync(
    TEST_DOCUMENT_PATH,
    'This is a test document that needs to be translated. It contains some sample text that will be processed by the translation node.'
  );
}

if (!fs.existsSync(TEST_EXAMPLE_PATH)) {
  fs.writeFileSync(
    TEST_EXAMPLE_PATH,
    'TRANSLATED DOCUMENT\n\nThis is an example of how the translated document should look like.\nIt has a specific format that should be followed.'
  );
}

// Test functions
const testUploadDocument = async () => {
  console.log('Testing document upload...');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(TEST_DOCUMENT_PATH));
  formData.append('nodeId', 'test-node');
  formData.append('nodeType', 'translation');
  formData.append('inputId', 'input-1');
  formData.append('description', 'Test document for translation');
  
  try {
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Document upload successful');
    console.log('Document ID:', response.data.document.id);
    return response.data.document.id;
  } catch (error) {
    console.error('❌ Document upload failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const testUploadExampleDocument = async () => {
  console.log('Testing example document upload...');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(TEST_EXAMPLE_PATH));
  formData.append('nodeId', 'test-node');
  formData.append('nodeType', 'translation');
  formData.append('inputId', 'example-format');
  formData.append('description', 'Example format for translation');
  
  try {
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Example document upload successful');
    console.log('Example Document ID:', response.data.document.id);
    return response.data.document.id;
  } catch (error) {
    console.error('❌ Example document upload failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const testGetAllDocuments = async () => {
  console.log('Testing get all documents...');
  
  try {
    const response = await axios.get(`${API_URL}/documents`);
    console.log('✅ Get all documents successful');
    console.log('Document count:', response.data.count);
    return response.data.documents;
  } catch (error) {
    console.error('❌ Get all documents failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const testGetDocumentById = async (documentId) => {
  console.log(`Testing get document by ID (${documentId})...`);
  
  try {
    const response = await axios.get(`${API_URL}/documents/${documentId}`);
    console.log('✅ Get document by ID successful');
    return response.data.document;
  } catch (error) {
    console.error('❌ Get document by ID failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const testProcessTranslation = async (documentId, exampleDocumentId) => {
  console.log('Testing process translation...');
  
  try {
    const response = await axios.post(`${API_URL}/workflow/translate`, {
      documentId,
      exampleDocumentId
    });
    
    console.log('✅ Process translation started successfully');
    console.log('Process ID:', response.data.process.id);
    return response.data.process.id;
  } catch (error) {
    console.error('❌ Process translation failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const testGetProcessStatus = async (processId) => {
  console.log(`Testing get process status (${processId})...`);
  
  try {
    const response = await axios.get(`${API_URL}/workflow/status/${processId}`);
    console.log('✅ Get process status successful');
    console.log('Process status:', response.data.process.status);
    return response.data.process;
  } catch (error) {
    console.error('❌ Get process status failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

const waitForProcessCompletion = async (processId, maxAttempts = 10, interval = 1000) => {
  console.log(`Waiting for process ${processId} to complete...`);
  
  let attempts = 0;
  while (attempts < maxAttempts) {
    const process = await testGetProcessStatus(processId);
    
    if (process.status === 'completed') {
      console.log('✅ Process completed successfully');
      return process;
    } else if (process.status === 'failed') {
      console.error('❌ Process failed:', process.error);
      throw new Error('Process failed');
    }
    
    attempts++;
    console.log(`Waiting... (${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Process timed out');
};

const testDeleteDocument = async (documentId) => {
  console.log(`Testing delete document (${documentId})...`);
  
  try {
    const response = await axios.delete(`${API_URL}/documents/${documentId}`);
    console.log('✅ Delete document successful');
    return response.data;
  } catch (error) {
    console.error('❌ Delete document failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  console.log('=== Starting Workflow Backend Tests ===');
  
  try {
    // Upload test documents
    const documentId = await testUploadDocument();
    const exampleDocumentId = await testUploadExampleDocument();
    
    // Get all documents
    await testGetAllDocuments();
    
    // Get document by ID
    await testGetDocumentById(documentId);
    
    // Process translation
    const processId = await testProcessTranslation(documentId, exampleDocumentId);
    
    // Wait for process completion
    const completedProcess = await waitForProcessCompletion(processId);
    
    // Get translated document
    if (completedProcess.result && completedProcess.result.documentId) {
      await testGetDocumentById(completedProcess.result.documentId);
    }
    
    // Clean up (optional)
    // await testDeleteDocument(documentId);
    // await testDeleteDocument(exampleDocumentId);
    
    console.log('=== All tests completed successfully ===');
  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
};

// Run tests
runTests();
