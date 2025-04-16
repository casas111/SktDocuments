const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileStorageService {
  constructor() {
    this.baseUploadDir = path.join(__dirname, '../../uploads');
    this.ensureDirectoryExists(this.baseUploadDir);
    
    // Create standard directories
    this.transformationsDir = path.join(this.baseUploadDir, 'transformations');
    this.comparisonsDir = path.join(this.baseUploadDir, 'comparisons');
    this.simetrikIntegrationsDir = path.join(this.baseUploadDir, 'simetrik_integrations');
    this.communicationsDir = path.join(this.baseUploadDir, 'communications');
    
    this.ensureDirectoryExists(this.transformationsDir);
    this.ensureDirectoryExists(this.comparisonsDir);
    this.ensureDirectoryExists(this.simetrikIntegrationsDir);
    this.ensureDirectoryExists(this.communicationsDir);
  }
  
  // Ensure directory exists, create if it doesn't
  ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  
  // Create folder in the file system
  createFolder(folderPath) {
    const fullPath = path.join(this.baseUploadDir, folderPath);
    this.ensureDirectoryExists(fullPath);
    return fullPath;
  }
  
  // Save file to disk
  saveFile(file, customPath = null) {
    try {
      // If file is from multer upload
      if (file.buffer) {
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = customPath 
          ? path.join(customPath, fileName)
          : path.join(this.baseUploadDir, fileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(path.dirname(filePath));
        
        // Write file to disk
        fs.writeFileSync(filePath, file.buffer);
        
        return {
          success: true,
          path: filePath,
          fileName,
          size: file.size,
          type: path.extname(file.originalname).substring(1)
        };
      } 
      // If file is a string content
      else if (typeof file === 'string') {
        const fileName = `${uuidv4()}.txt`;
        const filePath = customPath 
          ? path.join(customPath, fileName)
          : path.join(this.baseUploadDir, fileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(path.dirname(filePath));
        
        // Write file to disk
        fs.writeFileSync(filePath, file);
        
        return {
          success: true,
          path: filePath,
          fileName,
          size: Buffer.byteLength(file),
          type: 'txt'
        };
      }
      // If file is an object with path and content
      else if (file.content) {
        const fileName = file.name || `${uuidv4()}${file.extension || '.txt'}`;
        const filePath = customPath 
          ? path.join(customPath, fileName)
          : path.join(this.baseUploadDir, fileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(path.dirname(filePath));
        
        // Write file to disk
        fs.writeFileSync(filePath, file.content);
        
        return {
          success: true,
          path: filePath,
          fileName,
          size: Buffer.byteLength(file.content),
          type: path.extname(fileName).substring(1) || 'txt'
        };
      }
      
      return {
        success: false,
        error: 'Invalid file format'
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Read file from disk
  readFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File not found'
        };
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);
      
      return {
        success: true,
        content,
        size: stats.size,
        type: path.extname(filePath).substring(1) || 'txt',
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Delete file from disk
  deleteFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File not found'
        };
      }
      
      fs.unlinkSync(filePath);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Move file to a different location
  moveFile(sourcePath, destinationPath) {
    try {
      if (!fs.existsSync(sourcePath)) {
        return {
          success: false,
          error: 'Source file not found'
        };
      }
      
      // Ensure destination directory exists
      this.ensureDirectoryExists(path.dirname(destinationPath));
      
      // Move file
      fs.renameSync(sourcePath, destinationPath);
      
      return {
        success: true,
        path: destinationPath
      };
    } catch (error) {
      console.error('Error moving file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Copy file to a different location
  copyFile(sourcePath, destinationPath) {
    try {
      if (!fs.existsSync(sourcePath)) {
        return {
          success: false,
          error: 'Source file not found'
        };
      }
      
      // Ensure destination directory exists
      this.ensureDirectoryExists(path.dirname(destinationPath));
      
      // Copy file
      fs.copyFileSync(sourcePath, destinationPath);
      
      return {
        success: true,
        path: destinationPath
      };
    } catch (error) {
      console.error('Error copying file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get file stats
  getFileStats(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File not found'
        };
      }
      
      const stats = fs.statSync(filePath);
      
      return {
        success: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // List files in a directory
  listFiles(directoryPath) {
    try {
      const fullPath = directoryPath.startsWith(this.baseUploadDir) 
        ? directoryPath 
        : path.join(this.baseUploadDir, directoryPath);
      
      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          error: 'Directory not found'
        };
      }
      
      const files = fs.readdirSync(fullPath);
      const fileDetails = files.map(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          path: filePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          created: stats.birthtime,
          modified: stats.mtime,
          type: stats.isDirectory() ? 'directory' : path.extname(file).substring(1) || 'unknown'
        };
      });
      
      return {
        success: true,
        files: fileDetails
      };
    } catch (error) {
      console.error('Error listing files:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create a transformation output file
  createTransformationOutput(nodeName, content) {
    const nodeDir = path.join(this.transformationsDir, nodeName);
    this.ensureDirectoryExists(nodeDir);
    
    const fileName = `${nodeName}-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const filePath = path.join(nodeDir, fileName);
    
    return this.saveFile({
      name: fileName,
      content: content
    }, nodeDir);
  }
  
  // Create a comparison output file
  createComparisonOutput(nodeName, content) {
    const nodeDir = path.join(this.comparisonsDir, nodeName);
    this.ensureDirectoryExists(nodeDir);
    
    const fileName = `${nodeName}-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const filePath = path.join(nodeDir, fileName);
    
    return this.saveFile({
      name: fileName,
      content: content
    }, nodeDir);
  }
  
  // Create a Simetrik integration output file
  createSimetrikIntegrationOutput(nodeName, content, extension = '.csv') {
    const nodeDir = path.join(this.simetrikIntegrationsDir, nodeName);
    this.ensureDirectoryExists(nodeDir);
    
    const fileName = `${nodeName}-${new Date().toISOString().replace(/:/g, '-')}${extension}`;
    const filePath = path.join(nodeDir, fileName);
    
    return this.saveFile({
      name: fileName,
      content: content,
      extension: extension
    }, nodeDir);
  }
  
  // Create a communication output file
  createCommunicationOutput(nodeName, content) {
    const nodeDir = path.join(this.communicationsDir, nodeName);
    this.ensureDirectoryExists(nodeDir);
    
    const fileName = `${nodeName}-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    const filePath = path.join(nodeDir, fileName);
    
    return this.saveFile({
      name: fileName,
      content: content
    }, nodeDir);
  }
}

module.exports = new FileStorageService();
