const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fileStorageService = require('./fileStorageService');

class DocumentService {
  constructor() {
    this.baseUploadDir = path.join(__dirname, '../../uploads');
    this.ensureDirectoryExists(this.baseUploadDir);
  }
  
  // Ensure directory exists, create if it doesn't
  ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  
  // Generate a unique URL for a document
  generateDocumentUrl(documentId) {
    return `/api/documents/${documentId}`;
  }
  
  // Extract text content from a file based on its type
  async extractTextContent(filePath, fileType) {
    try {
      // For text files, simply read the content
      if (['txt', 'csv', 'md', 'json', 'xml', 'html'].includes(fileType.toLowerCase())) {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          success: true,
          content
        };
      }
      
      // For other file types, we would need specialized libraries
      // This is a placeholder for future implementation
      return {
        success: false,
        error: `Text extraction not supported for ${fileType} files yet`
      };
    } catch (error) {
      console.error('Error extracting text content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create a document record with file information
  prepareDocumentRecord(file, name, folderId) {
    const documentId = uuidv4();
    
    return {
      id: documentId,
      name: name || file.originalname,
      path: file.path,
      type: path.extname(file.originalname).substring(1),
      size: file.size,
      folderId: folderId || null,
      url: this.generateDocumentUrl(documentId)
    };
  }
  
  // Process uploaded file and extract content if possible
  async processUploadedFile(file, name, folderId) {
    try {
      const documentRecord = this.prepareDocumentRecord(file, name, folderId);
      
      // Try to extract text content
      const fileType = path.extname(file.originalname).substring(1);
      const contentResult = await this.extractTextContent(file.path, fileType);
      
      if (contentResult.success) {
        documentRecord.content = contentResult.content;
      }
      
      return {
        success: true,
        document: documentRecord
      };
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create a document from text content
  async createDocumentFromText(content, name, folderId, type = 'txt') {
    try {
      const documentId = uuidv4();
      const fileName = `${documentId}.${type}`;
      const filePath = path.join(this.baseUploadDir, fileName);
      
      // Write content to file
      fs.writeFileSync(filePath, content);
      
      // Get file stats
      const stats = fs.statSync(filePath);
      
      const documentRecord = {
        id: documentId,
        name: name || fileName,
        path: filePath,
        type,
        size: stats.size,
        content,
        folderId: folderId || null,
        url: this.generateDocumentUrl(documentId)
      };
      
      return {
        success: true,
        document: documentRecord
      };
    } catch (error) {
      console.error('Error creating document from text:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Delete a document file
  deleteDocumentFile(filePath) {
    return fileStorageService.deleteFile(filePath);
  }
  
  // Move a document file
  moveDocumentFile(sourcePath, destinationPath) {
    return fileStorageService.moveFile(sourcePath, destinationPath);
  }
  
  // Copy a document file
  copyDocumentFile(sourcePath, destinationPath) {
    return fileStorageService.copyFile(sourcePath, destinationPath);
  }
  
  // Read a document file
  readDocumentFile(filePath) {
    return fileStorageService.readFile(filePath);
  }
}

module.exports = new DocumentService();
