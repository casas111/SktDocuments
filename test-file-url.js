/**
 * Test script to verify file URL viewing/download functionality
 * This script tests both the backend API and simulates the frontend behavior
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

// Simulate the FileService.getFileUrl method
function getFileUrl(filePath) {
  // Base64 encode the file path to create a unique identifier
  const fileId = Buffer.from(encodeURIComponent(filePath)).toString('base64');
  return `/file/${fileId}`;
}

// Simulate the FileViewer component's decoding logic
function decodeFileId(fileId) {
  try {
    return decodeURIComponent(Buffer.from(fileId, 'base64').toString());
  } catch (e) {
    throw new Error('Invalid file ID format');
  }
}

// Test file metadata API
async function testFileMetadata(filePath) {
  try {
    console.log(`Testing file metadata API for: ${filePath}`);
    
    // Encode the file path for the URL
    const encodedPath = encodeURIComponent(filePath);
    
    // Call the metadata API
    const response = await axios.get(`${API_URL}/files/metadata/${encodedPath}`);
    
    if (response.data && response.data.success) {
      console.log('File metadata retrieved successfully:');
      console.log(JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      console.error('Failed to get file metadata:', response.data?.message);
      return null;
    }
  } catch (error) {
    console.error('Error testing file metadata:', error.message);
    return null;
  }
}

// Test file download API
async function testFileDownload(filePath) {
  try {
    console.log(`Testing file download API for: ${filePath}`);
    
    // Encode the file path for the URL
    const encodedPath = encodeURIComponent(filePath);
    
    // Call the download API
    const response = await axios.get(`${API_URL}/files/download/${encodedPath}`, {
      responseType: 'arraybuffer'
    });
    
    // Save the downloaded file
    const filename = path.basename(filePath);
    const downloadPath = path.join(TEST_DOWNLOAD_DIR, `downloaded_${filename}`);
    await writeFileAsync(downloadPath, response.data);
    
    console.log(`File downloaded successfully to: ${downloadPath}`);
    return downloadPath;
  } catch (error) {
    console.error('Error testing file download:', error.message);
    return null;
  }
}

// Test the full file URL flow
async function testFileUrlFlow(filePath) {
  try {
    console.log('\n--- Testing full file URL flow ---');
    
    // 1. Generate a file URL (frontend)
    const fileUrl = getFileUrl(filePath);
    console.log(`Generated file URL: ${fileUrl}`);
    
    // 2. Extract fileId from URL
    const fileId = fileUrl.split('/').pop();
    console.log(`Extracted fileId: ${fileId}`);
    
    // 3. Decode fileId (as done in FileViewer component)
    const decodedPath = decodeFileId(fileId);
    console.log(`Decoded file path: ${decodedPath}`);
    
    // 4. Verify the decoded path matches the original
    if (decodedPath === filePath) {
      console.log('✅ Path decoding successful!');
    } else {
      console.error('❌ Path decoding failed!');
      console.error(`Expected: ${filePath}`);
      console.error(`Actual: ${decodedPath}`);
      return false;
    }
    
    // 5. Get file metadata using the decoded path
    const metadata = await testFileMetadata(decodedPath);
    if (!metadata) {
      console.error('❌ Metadata retrieval failed!');
      return false;
    }
    
    // 6. Download the file using the decoded path
    const downloadPath = await testFileDownload(decodedPath);
    if (!downloadPath) {
      console.error('❌ File download failed!');
      return false;
    }
    
    console.log('✅ Full file URL flow test passed!');
    return true;
  } catch (error) {
    console.error('Error in file URL flow test:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting file URL viewing/download tests...');
    
    // Ensure test directories exist
    await ensureDirectoriesExist();
    
    // Create test files of different types
    const textFilePath = await createTestFile('test.txt', 'This is a test text file.');
    const jsonFilePath = await createTestFile('test.json', JSON.stringify({ test: 'data', number: 123 }, null, 2));
    const htmlFilePath = await createTestFile('test.html', '<html><body><h1>Test HTML</h1><p>This is a test HTML file.</p></body></html>');
    
    // Test each file
    const results = [];
    results.push(await testFileUrlFlow(textFilePath.replace(__dirname, '')));
    results.push(await testFileUrlFlow(jsonFilePath.replace(__dirname, '')));
    results.push(await testFileUrlFlow(htmlFilePath.replace(__dirname, '')));
    
    // Print summary
    console.log('\n--- Test Summary ---');
    const passedTests = results.filter(r => r).length;
    console.log(`Passed: ${passedTests}/${results.length} tests`);
    
    if (passedTests === results.length) {
      console.log('✅ All tests passed! The file URL viewing/download feature is working correctly.');
    } else {
      console.log('❌ Some tests failed. Please check the logs for details.');
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});
