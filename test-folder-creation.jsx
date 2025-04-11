import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';

// Test script for folder creation functionality
const testFolderCreation = async () => {
  console.log('Starting folder creation test...');
  const API_URL = 'http://localhost:3001/api';
  
  try {
    // Test folder creation
    console.log('--- Testing folder creation ---');
    const testFolderName = `Test Folder ${Date.now()}`;
    
    console.log(`Creating folder: ${testFolderName}`);
    const createResponse = await axios.post(`${API_URL}/documents/folders`, {
      name: testFolderName,
      parentId: 'root'
    });
    
    if (createResponse.data.success) {
      console.log('✅ Folder created successfully:', createResponse.data.data);
      
      // Test folder retrieval
      console.log('--- Testing folder retrieval ---');
      const folderId = createResponse.data.data.id;
      
      // Wait a moment to ensure backend processing completes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Getting all folders to verify folder appears in list');
      const foldersResponse = await axios.get(`${API_URL}/documents/folders`);
      
      if (foldersResponse.data.success) {
        const folders = foldersResponse.data.data;
        const foundFolder = folders.find(folder => folder.id === folderId);
        
        if (foundFolder) {
          console.log('✅ Folder found in folders list:', foundFolder);
        } else {
          console.log('❌ Folder not found in folders list');
        }
      } else {
        console.log('❌ Failed to get folders:', foldersResponse.data.error);
      }
      
      // Test subfolder creation
      console.log('--- Testing subfolder creation ---');
      const subfolderName = `Subfolder ${Date.now()}`;
      
      console.log(`Creating subfolder: ${subfolderName} in folder: ${folderId}`);
      const subfolderResponse = await axios.post(`${API_URL}/documents/folders`, {
        name: subfolderName,
        parentId: folderId
      });
      
      if (subfolderResponse.data.success) {
        console.log('✅ Subfolder created successfully:', subfolderResponse.data.data);
        
        // Test subfolder retrieval
        console.log('--- Testing subfolder retrieval ---');
        const subfolderId = subfolderResponse.data.data.id;
        
        // Wait a moment to ensure backend processing completes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Getting all folders to verify subfolder appears in list');
        const allFoldersResponse = await axios.get(`${API_URL}/documents/folders`);
        
        if (allFoldersResponse.data.success) {
          const allFolders = allFoldersResponse.data.data;
          const foundSubfolder = allFolders.find(folder => folder.id === subfolderId);
          
          if (foundSubfolder) {
            console.log('✅ Subfolder found in folders list:', foundSubfolder);
            console.log('✅ Subfolder has correct parentId:', foundSubfolder.parentId === folderId);
          } else {
            console.log('❌ Subfolder not found in folders list');
          }
        } else {
          console.log('❌ Failed to get all folders:', allFoldersResponse.data.error);
        }
      } else {
        console.log('❌ Failed to create subfolder:', subfolderResponse.data.error);
      }
    } else {
      console.log('❌ Failed to create folder:', createResponse.data.error);
    }
  } catch (error) {
    console.error('Error during folder creation test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
  
  console.log('Folder creation test completed');
};

// Component to display test results
const FolderCreationTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  
  const runTest = async () => {
    setTesting(true);
    setResults([]);
    
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      setResults(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };
    
    try {
      await testFolderCreation();
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      // Restore console.log
      console.log = originalLog;
      setTesting(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Folder Creation Functionality Test
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={runTest}
        disabled={testing}
        sx={{ mb: 3 }}
      >
        {testing ? <CircularProgress size={24} /> : 'Run Test'}
      </Button>
      
      <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Test Results:
        </Typography>
        
        {results.length > 0 ? (
          results.map((result, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                color: result.includes('❌') ? 'error.main' : 
                       result.includes('✅') ? 'success.main' : 'text.primary'
              }}
            >
              {result}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {testing ? 'Running tests...' : 'Click "Run Test" to start testing'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default FolderCreationTest;

// For direct execution in Node.js
if (typeof window === 'undefined') {
  testFolderCreation();
}
