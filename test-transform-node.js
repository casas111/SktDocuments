/**
 * Test script for the transform node functionality
 * This script tests all components of the transform node implementation
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
const TRANSFORMATIONS_DIR = path.join(__dirname, 'transformations');

// Ensure test directories exist
async function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  try {
    // Create test files directory if it doesn't exist
    if (!fs.existsSync(TEST_FILES_DIR)) {
      await mkdir(TEST_FILES_DIR);
    }
    
    // Create transformations directory if it doesn't exist
    if (!fs.existsSync(TRANSFORMATIONS_DIR)) {
      await mkdir(TRANSFORMATIONS_DIR);
    }
    
    // Create test files
    await createTestFiles();
    
    console.log('Test environment setup complete.');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
}

// Create test files for transformation
async function createTestFiles() {
  console.log('Creating test files...');
  
  // Create source document 1
  const sourceDoc1Content = `
# Company Overview
Founded in 2010, Acme Corporation is a leading provider of innovative solutions in the technology sector.
We specialize in cloud computing, artificial intelligence, and data analytics.

## Key Metrics
- Revenue: $50 million
- Employees: 250
- Offices: 5 global locations
- Customers: 1,000+

## Products
1. AcmeCloud - Cloud hosting and storage
2. AcmeAI - Artificial intelligence platform
3. AcmeAnalytics - Data analytics solution
`;
  
  // Create source document 2
  const sourceDoc2Content = `
# Financial Report 2024
This report provides a comprehensive overview of Acme Corporation's financial performance for the fiscal year 2024.

## Revenue Breakdown
- Product Sales: $35 million
- Services: $15 million
- Total Revenue: $50 million

## Expenses
- Research & Development: $10 million
- Sales & Marketing: $8 million
- General & Administrative: $7 million
- Total Expenses: $25 million

## Profitability
- Gross Profit: $25 million
- Net Income: $15 million
- Profit Margin: 30%
`;
  
  // Create template document (mock PDF content)
  const templateDocContent = `
%PDF-1.4
% Mock PDF Template for Quarterly Report
1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj
2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj
3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /Resources << /Font << /F1 4 0 R >>
               /ProcSet [/PDF /Text] >>
   /MediaBox [0 0 612 792]
   /Contents 5 0 R
>>
endobj
4 0 obj
<< /Type /Font
   /Subtype /Type1
   /Name /F1
   /BaseFont /Helvetica
>>
endobj
5 0 obj
<< /Length 1000 >>
stream
BT
/F1 24 Tf
72 720 Td
(Quarterly Report Template) Tj
/F1 12 Tf
0 -36 Td
(Company: [COMPANY_NAME]) Tj
0 -24 Td
(Quarter: [QUARTER]) Tj
0 -24 Td
(Year: [YEAR]) Tj
0 -48 Td
/F1 16 Tf
(1. Company Overview) Tj
/F1 12 Tf
0 -24 Td
([COMPANY_OVERVIEW]) Tj
0 -48 Td
/F1 16 Tf
(2. Financial Highlights) Tj
/F1 12 Tf
0 -24 Td
([FINANCIAL_HIGHLIGHTS]) Tj
0 -48 Td
/F1 16 Tf
(3. Products and Services) Tj
/F1 12 Tf
0 -24 Td
([PRODUCTS_SERVICES]) Tj
0 -48 Td
/F1 16 Tf
(4. Future Outlook) Tj
/F1 12 Tf
0 -24 Td
([FUTURE_OUTLOOK]) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000120 00000 n
0000000270 00000 n
0000000350 00000 n
trailer
<< /Size 6
   /Root 1 0 R
>>
startxref
1400
%%EOF
`;
  
  // Write test files
  await writeFile(path.join(TEST_FILES_DIR, 'company_overview.md'), sourceDoc1Content);
  await writeFile(path.join(TEST_FILES_DIR, 'financial_report.md'), sourceDoc2Content);
  await writeFile(path.join(TEST_FILES_DIR, 'quarterly_report_template.pdf'), templateDocContent);
  
  console.log('Test files created successfully.');
}

// Test file upload functionality
async function testFileUpload() {
  console.log('\nTesting file upload functionality...');
  
  try {
    // Read test files
    const sourceDoc1 = await readFile(path.join(TEST_FILES_DIR, 'company_overview.md'));
    const sourceDoc2 = await readFile(path.join(TEST_FILES_DIR, 'financial_report.md'));
    const templateDoc = await readFile(path.join(TEST_FILES_DIR, 'quarterly_report_template.pdf'));
    
    // Create form data for file upload
    const formData1 = new FormData();
    formData1.append('file', new Blob([sourceDoc1], { type: 'text/markdown' }), 'company_overview.md');
    formData1.append('path', '/');
    
    const formData2 = new FormData();
    formData2.append('file', new Blob([sourceDoc2], { type: 'text/markdown' }), 'financial_report.md');
    formData2.append('path', '/');
    
    const formData3 = new FormData();
    formData3.append('file', new Blob([templateDoc], { type: 'application/pdf' }), 'quarterly_report_template.pdf');
    formData3.append('path', '/');
    
    // Upload files
    const response1 = await axios.post(`${API_BASE_URL}/files/upload`, formData1);
    const response2 = await axios.post(`${API_BASE_URL}/files/upload`, formData2);
    const response3 = await axios.post(`${API_BASE_URL}/files/upload`, formData3);
    
    if (response1.data.success && response2.data.success && response3.data.success) {
      console.log('File upload tests passed.');
      return {
        sourceDoc1Id: response1.data.file.id,
        sourceDoc2Id: response2.data.file.id,
        templateDocId: response3.data.file.id
      };
    } else {
      console.error('File upload tests failed.');
      return null;
    }
  } catch (error) {
    console.error('Error testing file upload:', error);
    return null;
  }
}

// Test transformation functionality
async function testTransformation(fileIds) {
  console.log('\nTesting transformation functionality...');
  
  try {
    // Create transformation request
    const transformationRequest = {
      sourceDoc1Id: fileIds.sourceDoc1Id,
      sourceDoc2Id: fileIds.sourceDoc2Id,
      templateDocId: fileIds.templateDocId,
      instruction: 'Please create a quarterly report using the template format. Extract company information from the first document and financial data from the second document. Ensure all sections of the template are filled with appropriate content.',
      model: 'claude-3-haiku-20240307'
    };
    
    // Send transformation request
    const response = await axios.post(`${API_BASE_URL}/transformation/process`, transformationRequest);
    
    if (response.data.success) {
      console.log('Transformation test passed.');
      console.log('Transformed document saved to:', response.data.data.transformedDocument.path);
      return response.data.data.transformedDocument;
    } else {
      console.error('Transformation test failed:', response.data.error);
      return null;
    }
  } catch (error) {
    console.error('Error testing transformation:', error);
    return null;
  }
}

// Test transformations folder functionality
async function testTransformationsFolder(transformedDoc) {
  console.log('\nTesting transformations folder functionality...');
  
  try {
    // Get transformations folder contents
    const response = await axios.get(`${API_BASE_URL}/files/directory?path=/transformations`);
    
    if (response.data.success) {
      const files = response.data.contents;
      
      // Check if transformed document exists in the folder
      const foundFile = files.find(file => file.id === transformedDoc.id);
      
      if (foundFile) {
        console.log('Transformations folder test passed.');
        return true;
      } else {
        console.error('Transformed document not found in transformations folder.');
        return false;
      }
    } else {
      console.error('Failed to get transformations folder contents:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('Error testing transformations folder:', error);
    return false;
  }
}

// Test file deletion functionality
async function testFileDeletion(fileIds, transformedDoc) {
  console.log('\nTesting file deletion functionality...');
  
  try {
    // Delete test files
    const response1 = await axios.delete(`${API_BASE_URL}/files/${fileIds.sourceDoc1Id}`);
    const response2 = await axios.delete(`${API_BASE_URL}/files/${fileIds.sourceDoc2Id}`);
    const response3 = await axios.delete(`${API_BASE_URL}/files/${fileIds.templateDocId}`);
    const response4 = await axios.delete(`${API_BASE_URL}/files/${transformedDoc.id}`);
    
    if (response1.data.success && response2.data.success && response3.data.success && response4.data.success) {
      console.log('File deletion tests passed.');
      return true;
    } else {
      console.error('File deletion tests failed.');
      return false;
    }
  } catch (error) {
    console.error('Error testing file deletion:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting transform node functionality tests...');
  
  try {
    // Setup test environment
    await setupTestEnvironment();
    
    // Test file upload
    const fileIds = await testFileUpload();
    if (!fileIds) {
      console.error('File upload tests failed. Aborting remaining tests.');
      return false;
    }
    
    // Test transformation
    const transformedDoc = await testTransformation(fileIds);
    if (!transformedDoc) {
      console.error('Transformation test failed. Aborting remaining tests.');
      return false;
    }
    
    // Test transformations folder
    const transformationsFolderResult = await testTransformationsFolder(transformedDoc);
    if (!transformationsFolderResult) {
      console.error('Transformations folder test failed. Aborting remaining tests.');
      return false;
    }
    
    // Test file deletion
    const fileDeletionResult = await testFileDeletion(fileIds, transformedDoc);
    if (!fileDeletionResult) {
      console.error('File deletion tests failed.');
      return false;
    }
    
    console.log('\nAll tests passed successfully!');
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
      console.log('Transform node functionality verified.');
    } else {
      console.error('Transform node functionality tests failed.');
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
  });
