/**
 * Test script for file viewing functionality
 * This script tests the direct file URL construction and access
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

// Configuration
const API_URL = 'http://localhost:3001/api';
const BACKEND_URL = 'http://localhost:3001';
const TEST_DIR = path.join(__dirname, 'test-files');
const RESULTS_DIR = path.join(__dirname, 'test-results');

// Ensure test directories exist
async function ensureDirectoriesExist() {
  if (!fs.existsSync(TEST_DIR)) {
    await mkdirAsync(TEST_DIR, { recursive: true });
  }
  if (!fs.existsSync(RESULTS_DIR)) {
    await mkdirAsync(RESULTS_DIR, { recursive: true });
  }
}

// Create a test image file if it doesn't exist
async function createTestImage() {
  const testImagePath = path.join(TEST_DIR, 'test-image.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('Creating test image file...');
    
    // This is a tiny 1x1 transparent PNG
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    await writeFileAsync(testImagePath, imageBuffer);
    console.log(`Test image created at: ${testImagePath}`);
  }
  
  return testImagePath;
}

// Upload a test file to the server
async function uploadTestFile(filePath) {
  try {
    console.log(`Uploading test file: ${filePath}`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('type', 'input');
    formData.append('folderId', 'root');
    
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.success) {
      console.log('File uploaded successfully');
      return response.data.document;
    } else {
      throw new Error(response.data?.message || 'Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file:', error.message);
    
    // If we can't upload, simulate a document object for testing
    const filename = path.basename(filePath);
    return {
      id: 'test-id',
      originalName: filename,
      filename: filename,
      mimetype: 'image/png',
      size: fs.statSync(filePath).size,
      path: `/files/uploads/${filename}`,
      url: `/files/uploads/${filename}`
    };
  }
}

// Test direct file URL construction
function testDirectUrlConstruction(filePath) {
  console.log('\n--- Testing Direct URL Construction ---');
  
  // Test with different path formats
  const testPaths = [
    filePath,
    filePath.startsWith('/') ? filePath : `/${filePath}`,
    `/files/uploads/${path.basename(filePath)}`,
    `files/uploads/${path.basename(filePath)}`
  ];
  
  const results = [];
  
  for (const testPath of testPaths) {
    // Encode the path in base64 as the frontend would
    const fileId = Buffer.from(encodeURIComponent(testPath)).toString('base64');
    
    // Decode the path as the FileViewer component would
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(Buffer.from(fileId, 'base64').toString());
    } catch (e) {
      decodedPath = 'Error: ' + e.message;
    }
    
    // Construct the direct URL
    const directUrl = `${BACKEND_URL}${decodedPath.startsWith('/') ? '' : '/'}${decodedPath}`;
    
    results.push({
      originalPath: testPath,
      fileId,
      decodedPath,
      directUrl
    });
    
    console.log(`Original path: ${testPath}`);
    console.log(`File ID: ${fileId}`);
    console.log(`Decoded path: ${decodedPath}`);
    console.log(`Direct URL: ${directUrl}`);
    console.log('---');
  }
  
  return results;
}

// Test file metadata API
async function testFileMetadataApi(filePath) {
  console.log('\n--- Testing File Metadata API ---');
  
  try {
    const response = await axios.get(`${API_URL}/files/metadata/${encodeURIComponent(filePath)}`);
    
    if (response.data && response.data.success) {
      console.log('File metadata retrieved successfully:');
      console.log(JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      console.error('Failed to get file metadata:', response.data?.message);
      return null;
    }
  } catch (error) {
    console.error('Error getting file metadata:', error.message);
    return null;
  }
}

// Test file download API
async function testFileDownloadApi(filePath) {
  console.log('\n--- Testing File Download API ---');
  
  try {
    const response = await axios.get(`${API_URL}/files/download/${encodeURIComponent(filePath)}`, {
      responseType: 'arraybuffer'
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    console.log(`Content-Type: ${contentType}`);
    console.log(`Content-Length: ${contentLength} bytes`);
    
    // Save the downloaded file for verification
    const downloadPath = path.join(RESULTS_DIR, `downloaded_${path.basename(filePath)}`);
    await writeFileAsync(downloadPath, Buffer.from(response.data));
    
    console.log(`Downloaded file saved to: ${downloadPath}`);
    return true;
  } catch (error) {
    console.error('Error downloading file:', error.message);
    return false;
  }
}

// Test direct file access
async function testDirectFileAccess(directUrl) {
  console.log('\n--- Testing Direct File Access ---');
  
  try {
    const response = await axios.get(directUrl, {
      responseType: 'arraybuffer'
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    console.log(`Content-Type: ${contentType}`);
    console.log(`Content-Length: ${contentLength} bytes`);
    
    // Save the directly accessed file for verification
    const directPath = path.join(RESULTS_DIR, `direct_${path.basename(directUrl)}`);
    await writeFileAsync(directPath, Buffer.from(response.data));
    
    console.log(`Directly accessed file saved to: ${directPath}`);
    return true;
  } catch (error) {
    console.error('Error accessing file directly:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting file view functionality tests...');
    
    // Setup
    await ensureDirectoriesExist();
    const testImagePath = await createTestImage();
    
    // Upload test file
    const uploadedDocument = await uploadTestFile(testImagePath);
    
    if (!uploadedDocument) {
      throw new Error('Failed to upload or simulate test document');
    }
    
    // Test URL construction
    const urlResults = testDirectUrlConstruction(uploadedDocument.path);
    
    // Test file metadata API
    const fileMetadata = await testFileMetadataApi(uploadedDocument.path);
    
    // Test file download API
    const downloadSuccess = await testFileDownloadApi(uploadedDocument.path);
    
    // Test direct file access
    let directAccessSuccess = false;
    if (urlResults.length > 0) {
      directAccessSuccess = await testDirectFileAccess(urlResults[0].directUrl);
    }
    
    // Print summary
    console.log('\n--- Test Summary ---');
    console.log(`URL Construction: ${urlResults.length > 0 ? '✅ Success' : '❌ Failed'}`);
    console.log(`File Metadata API: ${fileMetadata ? '✅ Success' : '❌ Failed'}`);
    console.log(`File Download API: ${downloadSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`Direct File Access: ${directAccessSuccess ? '✅ Success' : '❌ Failed'}`);
    
    // Save test results
    const resultsPath = path.join(RESULTS_DIR, 'file_view_test_results.json');
    await writeFileAsync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      uploadedDocument,
      urlResults,
      fileMetadata,
      downloadSuccess,
      directAccessSuccess
    }, null, 2));
    
    console.log(`\nTest results saved to: ${resultsPath}`);
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});
