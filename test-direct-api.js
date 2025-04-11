/**
 * Test script to verify file URL viewing/download functionality with direct API calls
 * This script tests the backend API endpoints directly
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration
const API_URL = 'http://localhost:3001/api';
const TEST_DIR = path.join(__dirname, 'test-files');
const TEST_DOWNLOAD_DIR = path.join(__dirname, 'test-downloads');

// Ensure test directories exist
async function ensureDirectoriesExist() {
  if (!fs.existsSync(TEST_DIR)) {
    await mkdirAsync(TEST_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEST_DOWNLOAD_DIR)) {
    await mkdirAsync(TEST_DOWNLOAD_DIR, { recursive: true });
  }
}

// Create a test file
async function createTestFile(filename, content) {
  const filePath = path.join(TEST_DIR, filename);
  await writeFileAsync(filePath, content);
  console.log(`Created test file: ${filePath}`);
  return filePath;
}

// Test direct API endpoints
async function testDirectApiEndpoints() {
  try {
    console.log('\n--- Testing Direct API Endpoints ---');
    
    // Create test files
    const textFilePath = await createTestFile('test-direct.txt', 'This is a direct test text file.');
    const relativePath = 'test-files/test-direct.txt';
    
    // Test metadata endpoint directly
    console.log(`Testing metadata endpoint for: ${relativePath}`);
    try {
      const metadataResponse = await axios.get(`${API_URL}/files/metadata/${encodeURIComponent(relativePath)}`);
      console.log('Metadata response:', metadataResponse.data);
      
      if (metadataResponse.data && metadataResponse.data.success) {
        console.log('✅ Metadata endpoint test passed!');
      } else {
        console.error('❌ Metadata endpoint test failed!');
      }
    } catch (error) {
      console.error('Error testing metadata endpoint:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
    // Test download endpoint directly
    console.log(`\nTesting download endpoint for: ${relativePath}`);
    try {
      const downloadResponse = await axios.get(`${API_URL}/files/download/${encodeURIComponent(relativePath)}`, {
        responseType: 'arraybuffer'
      });
      
      // Save the downloaded file
      const downloadPath = path.join(TEST_DOWNLOAD_DIR, 'downloaded-direct.txt');
      await writeFileAsync(downloadPath, downloadResponse.data);
      console.log(`File downloaded successfully to: ${downloadPath}`);
      console.log('✅ Download endpoint test passed!');
    } catch (error) {
      console.error('Error testing download endpoint:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Error in direct API test:', error);
  }
}

// Run the test
async function runTest() {
  try {
    console.log('Starting direct API endpoint tests...');
    await ensureDirectoriesExist();
    await testDirectApiEndpoints();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Test execution failed:', error);
});
