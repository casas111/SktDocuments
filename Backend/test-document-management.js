// Test script for document management functionality
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Test file paths
const TEST_FILE_PATH = path.join(__dirname, 'test-files');
const TEST_PDF = path.join(TEST_FILE_PATH, 'test.pdf');
const TEST_IMAGE = path.join(TEST_FILE_PATH, 'test.jpg');
const TEST_DOC = path.join(TEST_FILE_PATH, 'test.docx');

// Ensure test files directory exists
fs.ensureDirSync(TEST_FILE_PATH);

// Create test files if they don't exist
const createTestFiles = async () => {
  console.log('Creating test files...');
  
  // Create a simple text file
  if (!fs.existsSync(path.join(TEST_FILE_PATH, 'test.txt'))) {
    await fs.writeFile(path.join(TEST_FILE_PATH, 'test.txt'), 'This is a test file for document management testing.');
    console.log('Created test.txt');
  }
  
  // Create a simple PDF-like file (not a real PDF)
  if (!fs.existsSync(TEST_PDF)) {
    await fs.writeFile(TEST_PDF, '%PDF-1.5\nThis is a mock PDF file for testing purposes.\n%%EOF');
    console.log('Created test.pdf');
  }
  
  // Create a simple image-like file (not a real image)
  if (!fs.existsSync(TEST_IMAGE)) {
    await fs.writeFile(TEST_IMAGE, 'JFIF\nThis is a mock JPEG file for testing purposes.');
    console.log('Created test.jpg');
  }
  
  // Create a simple docx-like file (not a real docx)
  if (!fs.existsSync(TEST_DOC)) {
    await fs.writeFile(TEST_DOC, 'PK\nThis is a mock DOCX file for testing purposes.');
    console.log('Created test.docx');
  }
};

// Test document upload
const testDocumentUpload = async () => {
  console.log('\n--- Testing Document Upload ---');
  
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(path.join(TEST_FILE_PATH, 'test.txt')));
    form.append('type', 'document');
    form.append('folderId', 'root');
    
    const response = await axios.post(`${API_BASE_URL}/api/documents/upload`, form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    if (response.data.success) {
      console.log('✅ Document upload successful');
      console.log('Document ID:', response.data.document.id);
      return response.data.document.id;
    } else {
      console.log('❌ Document upload failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing document upload:', error.message);
    return null;
  }
};

// Test get all documents
const testGetAllDocuments = async () => {
  console.log('\n--- Testing Get All Documents ---');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/documents`);
    
    if (response.data.success) {
      console.log('✅ Get all documents successful');
      console.log('Document count:', response.data.documents.length);
      return response.data.documents;
    } else {
      console.log('❌ Get all documents failed:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error testing get all documents:', error.message);
    return [];
  }
};

// Test get document by ID
const testGetDocumentById = async (documentId) => {
  console.log('\n--- Testing Get Document By ID ---');
  
  if (!documentId) {
    console.log('❌ No document ID provided');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/documents/${documentId}`);
    
    if (response.data.success) {
      console.log('✅ Get document by ID successful');
      console.log('Document name:', response.data.document.originalName);
      return response.data.document;
    } else {
      console.log('❌ Get document by ID failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing get document by ID:', error.message);
    return null;
  }
};

// Test create folder
const testCreateFolder = async () => {
  console.log('\n--- Testing Create Folder ---');
  
  try {
    const folderName = `Test Folder ${Date.now()}`;
    const response = await axios.post(`${API_BASE_URL}/api/documents/folders`, {
      name: folderName,
      parentId: 'root'
    });
    
    if (response.data.success) {
      console.log('✅ Create folder successful');
      console.log('Folder ID:', response.data.folder.id);
      console.log('Folder name:', response.data.folder.name);
      return response.data.folder.id;
    } else {
      console.log('❌ Create folder failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing create folder:', error.message);
    return null;
  }
};

// Test move document to folder
const testMoveDocumentToFolder = async (documentId, folderId) => {
  console.log('\n--- Testing Move Document To Folder ---');
  
  if (!documentId || !folderId) {
    console.log('❌ Document ID or folder ID not provided');
    return false;
  }
  
  try {
    const response = await axios.put(`${API_BASE_URL}/api/documents/${documentId}/move/${folderId}`);
    
    if (response.data.success) {
      console.log('✅ Move document to folder successful');
      return true;
    } else {
      console.log('❌ Move document to folder failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing move document to folder:', error.message);
    return false;
  }
};

// Test get documents by folder
const testGetDocumentsByFolder = async (folderId) => {
  console.log('\n--- Testing Get Documents By Folder ---');
  
  if (!folderId) {
    console.log('❌ No folder ID provided');
    return [];
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/documents/folder/${folderId}`);
    
    if (response.data.success) {
      console.log('✅ Get documents by folder successful');
      console.log('Document count in folder:', response.data.documents.length);
      return response.data.documents;
    } else {
      console.log('❌ Get documents by folder failed:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error testing get documents by folder:', error.message);
    return [];
  }
};

// Test delete document
const testDeleteDocument = async (documentId) => {
  console.log('\n--- Testing Delete Document ---');
  
  if (!documentId) {
    console.log('❌ No document ID provided');
    return false;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/documents/${documentId}`);
    
    if (response.data.success) {
      console.log('✅ Delete document successful');
      return true;
    } else {
      console.log('❌ Delete document failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing delete document:', error.message);
    return false;
  }
};

// Test delete folder
const testDeleteFolder = async (folderId) => {
  console.log('\n--- Testing Delete Folder ---');
  
  if (!folderId) {
    console.log('❌ No folder ID provided');
    return false;
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/documents/folders/${folderId}`);
    
    if (response.data.success) {
      console.log('✅ Delete folder successful');
      return true;
    } else {
      console.log('❌ Delete folder failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing delete folder:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('=== Document Management Functionality Tests ===');
  
  // Create test files
  await createTestFiles();
  
  // Test document upload
  const documentId = await testDocumentUpload();
  
  // Test get all documents
  const documents = await testGetAllDocuments();
  
  // Test get document by ID
  if (documentId) {
    await testGetDocumentById(documentId);
  }
  
  // Test create folder
  const folderId = await testCreateFolder();
  
  // Test move document to folder
  if (documentId && folderId) {
    await testMoveDocumentToFolder(documentId, folderId);
  }
  
  // Test get documents by folder
  if (folderId) {
    await testGetDocumentsByFolder(folderId);
  }
  
  // Test delete document
  if (documentId) {
    await testDeleteDocument(documentId);
  }
  
  // Test delete folder
  if (folderId) {
    await testDeleteFolder(folderId);
  }
  
  console.log('\n=== Document Management Tests Completed ===');
};

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
