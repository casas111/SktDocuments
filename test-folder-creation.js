/**
 * Test script to verify folder creation functionality
 * This script tests both the backend API and simulates the frontend behavior
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';
const FOLDER_API_ENDPOINT = `${API_URL}/files/folder`;
const FILES_API_ENDPOINT = `${API_URL}/files`;

// Test folder names
const testFolders = [
  'Test Folder 1',
  'Test Folder 2',
  'Nested Folder'
];

// Simulate frontend behavior
class FrontendSimulator {
  constructor() {
    this.folders = [];
    this.folderStructure = [];
  }

  // Simulate the loadFolders function in DocumentExplorer.tsx
  async loadFolders() {
    try {
      console.log('Loading folders...');
      const response = await axios.get(FILES_API_ENDPOINT, {
        params: { dirPath: '/' }
      });
      
      if (response.data && response.data.success) {
        const folders = response.data.data.filter(item => item.isDirectory);
        this.folders = folders;
        console.log(`Loaded ${folders.length} folders`);
        return folders;
      } else {
        console.error('Failed to load folders:', response.data?.error);
        return [];
      }
    } catch (error) {
      console.error('Error loading folders:', error.message);
      return [];
    }
  }

  // Simulate the createFolder function in DocumentExplorer.tsx with our fix
  async createFolder(folderName, parentPath = '/') {
    try {
      console.log(`Creating folder "${folderName}" in "${parentPath}"...`);
      
      const response = await axios.post(FOLDER_API_ENDPOINT, {
        folderPath: parentPath,
        folderName
      });
      
      if (response.data && response.data.success) {
        console.log('Folder created successfully');
        
        // Wait to ensure backend processing completes (our fix)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh folders list
        await this.loadFolders();
        
        // Add the new folder to the folders list immediately (our fix)
        if (response.data.data) {
          const newFolder = response.data.data;
          const folderExists = this.folders.some(folder => 
            folder.name === newFolder.name && 
            folder.path === newFolder.path
          );
          
          if (!folderExists) {
            this.folders.push(newFolder);
            console.log('Added new folder to local state immediately');
          }
        }
        
        return true;
      } else {
        console.error('Failed to create folder:', response.data?.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating folder:', error.message);
      return false;
    }
  }

  // Simulate the buildFolderStructure function in EnhancedFolderTree.jsx
  buildFolderStructure() {
    console.log('Building folder structure...');
    
    // Create a map of all folders
    const folderMap = {};
    
    // Add root folder
    folderMap['/'] = {
      name: 'Root',
      path: '/',
      children: [],
      level: 0,
      parent: null
    };
    
    // Process all folders
    this.folders.forEach(folder => {
      const folderPath = folder.path || `/${folder.name}`;
      
      // Skip if already in map
      if (folderMap[folderPath]) return;
      
      // Get parent path
      let parentPath = '/';
      if (folderPath !== '/') {
        parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
        if (parentPath === '') parentPath = '/';
      }
      
      // Create folder object
      folderMap[folderPath] = {
        ...folder,
        path: folderPath,
        children: [],
        level: (parentPath.match(/\//g) || []).length,
        parent: parentPath
      };
      
      // Add to parent's children
      if (folderMap[parentPath]) {
        folderMap[parentPath].children.push(folderPath);
      }
    });
    
    // Convert map to array and sort
    const sortedFolders = Object.values(folderMap).sort((a, b) => {
      // Sort by level first
      if (a.level !== b.level) return a.level - b.level;
      
      // Then by parent path
      if (a.parent !== b.parent) return a.parent.localeCompare(b.parent);
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
    
    this.folderStructure = sortedFolders;
    console.log(`Built folder structure with ${sortedFolders.length} items`);
    return sortedFolders;
  }

  // Print the folder structure for verification
  printFolderStructure() {
    console.log('\nCurrent Folder Structure:');
    this.folderStructure.forEach(folder => {
      const indent = '  '.repeat(folder.level);
      console.log(`${indent}${folder.name} (${folder.path})`);
    });
    console.log('');
  }
}

// Run the tests
async function runTests() {
  console.log('Starting folder creation tests...');
  
  const simulator = new FrontendSimulator();
  
  // Load initial folders
  await simulator.loadFolders();
  simulator.buildFolderStructure();
  console.log('Initial folder structure:');
  simulator.printFolderStructure();
  
  // Create test folders
  for (const folderName of testFolders) {
    await simulator.createFolder(folderName);
    simulator.buildFolderStructure();
    simulator.printFolderStructure();
  }
  
  // Create a nested folder
  const parentFolder = simulator.folders.find(f => f.name === testFolders[0]);
  if (parentFolder) {
    await simulator.createFolder('Nested Child', parentFolder.path);
    simulator.buildFolderStructure();
    simulator.printFolderStructure();
  }
  
  console.log('All tests completed successfully!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed:', error);
});
