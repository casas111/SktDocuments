/**
 * File Service
 * Handles file system operations for the Documents Drive
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const mime = require('mime-types');

// Base directory for all file storage
const BASE_STORAGE_DIR = path.join(__dirname, '../storage/documents');

// Ensure the documents directory exists
fs.ensureDirSync(BASE_STORAGE_DIR);

/**
 * Service for file system operations
 */
class FileService {
  constructor() {
    // Initialize storage directory
    this._initializeStorage();
  }

  /**
   * Initialize storage directories
   * @private
   */
  _initializeStorage() {
    try {
      // Ensure base directories exist
      fs.ensureDirSync(BASE_STORAGE_DIR);
    } catch (error) {
      console.error('Error initializing storage directories:', error);
      throw new Error('Failed to initialize storage system');
    }
  }

  /**
   * Validate and normalize a path to ensure it's within the base storage directory
   * 
   * @param {string} relativePath - Relative path to validate
   * @returns {string} - Absolute path within the storage directory
   * @private
   */
  _getAbsolutePath(relativePath = '') {
    // Normalize the path to prevent directory traversal attacks
    const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(BASE_STORAGE_DIR, normalizedPath);
  }

  /**
   * Get contents of a directory
   * 
   * @param {string} dirPath - Relative path to the directory
   * @returns {Promise<Array>} - Array of file and folder objects
   */
  async getDirectoryContents(dirPath = '') {
    try {
      const absolutePath = this._getAbsolutePath(dirPath);
      
      // Ensure the directory exists
      await fs.ensureDir(absolutePath);
      
      // Get all items in the directory
      const items = await fs.readdir(absolutePath);
      
      // Get detailed information for each item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(absolutePath, item);
          const stats = await fs.stat(itemPath);
          
          return {
            name: item,
            path: path.relative(BASE_STORAGE_DIR, itemPath),
            isDirectory: stats.isDirectory(),
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            type: stats.isDirectory() ? 'folder' : mime.lookup(item) || 'application/octet-stream'
          };
        })
      );
      
      // Sort directories first, then files alphabetically
      return itemsWithDetails.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error getting directory contents:', error);
      throw new Error(`Failed to get contents of directory: ${error.message}`);
    }
  }

  /**
   * Create a new folder
   * 
   * @param {string} parentPath - Relative path to the parent directory
   * @param {string} folderName - Name of the new folder
   * @returns {Promise<Object>} - Folder object
   */
  async createFolder(parentPath = '', folderName) {
    try {
      const parentAbsolutePath = this._getAbsolutePath(parentPath);
      const newFolderPath = path.join(parentAbsolutePath, folderName);
      
      // Check if folder already exists
      if (await fs.pathExists(newFolderPath)) {
        throw new Error('A folder with this name already exists');
      }
      
      // Create the folder
      await fs.ensureDir(newFolderPath);
      
      // Get folder stats
      const stats = await fs.stat(newFolderPath);
      
      return {
        name: folderName,
        path: path.relative(BASE_STORAGE_DIR, newFolderPath),
        isDirectory: true,
        size: 0,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: 'folder'
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Save uploaded files to the specified directory
   * 
   * @param {Array} files - Array of uploaded files
   * @param {string} folderPath - Relative path to the destination folder
   * @returns {Promise<Array>} - Array of saved file objects
   */
  async saveUploadedFiles(files, folderPath = '') {
    try {
      const destinationPath = this._getAbsolutePath(folderPath);
      
      // Ensure the destination directory exists
      await fs.ensureDir(destinationPath);
      
      // Process each file
      const savedFiles = await Promise.all(
        files.map(async (file) => {
          // Generate a unique filename if needed
          const fileName = file.originalname;
          const filePath = path.join(destinationPath, fileName);
          
          // Handle duplicate filenames
          let finalPath = filePath;
          let finalName = fileName;
          let counter = 1;
          
          while (await fs.pathExists(finalPath)) {
            const ext = path.extname(fileName);
            const nameWithoutExt = path.basename(fileName, ext);
            finalName = `${nameWithoutExt} (${counter})${ext}`;
            finalPath = path.join(destinationPath, finalName);
            counter++;
          }
          
          // Save the file
          await fs.writeFile(finalPath, file.buffer);
          
          // Get file stats
          const stats = await fs.stat(finalPath);
          
          return {
            name: finalName,
            originalName: file.originalname,
            path: path.relative(BASE_STORAGE_DIR, finalPath),
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            type: mime.lookup(finalName) || 'application/octet-stream'
          };
        })
      );
      
      return savedFiles;
    } catch (error) {
      console.error('Error saving uploaded files:', error);
      throw new Error(`Failed to save uploaded files: ${error.message}`);
    }
  }

  /**
   * Get file content and metadata
   * 
   * @param {string} filePath - Relative path to the file
   * @returns {Promise<Object>} - File object with content and metadata
   */
  async getFile(filePath) {
    try {
      const absolutePath = this._getAbsolutePath(filePath);
      
      // Check if file exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error('File not found');
      }
      
      // Check if it's a file, not a directory
      const stats = await fs.stat(absolutePath);
      if (stats.isDirectory()) {
        throw new Error('Cannot download a directory');
      }
      
      // Read file content
      const content = await fs.readFile(absolutePath, 'utf8');
      
      // Get file metadata
      const metadata = {
        name: path.basename(absolutePath),
        path: filePath,
        size: stats.size,
        mimeType: mime.lookup(absolutePath) || 'application/octet-stream',
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
      
      return {
        content,
        metadata
      };
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Create a folder if it doesn't exist
   * 
   * @param {string} folderPath - Relative path to the folder
   * @returns {Promise<void>}
   */
  async createFolderIfNotExists(folderPath) {
    try {
      const absolutePath = this._getAbsolutePath(folderPath);
      await fs.ensureDir(absolutePath);
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Save a file with content
   * 
   * @param {string} filePath - Relative path to save the file
   * @param {string} content - File content
   * @param {string} mimeType - MIME type of the file
   * @param {string} userId - ID of the user saving the file
   * @returns {Promise<Object>} - Saved file object
   */
  async saveFile(filePath, content, mimeType, userId) {
    try {
      console.log('Saving file:', { filePath, mimeType, userId });
      const absolutePath = this._getAbsolutePath(filePath);
      
      // Ensure the directory exists
      await fs.ensureDir(path.dirname(absolutePath));
      
      // Save the file
      await fs.writeFile(absolutePath, content);
      
      // Get file stats
      const stats = await fs.stat(absolutePath);
      
      // Create metadata
      const metadata = {
        id: path.basename(absolutePath),
        name: path.basename(absolutePath),
        path: filePath,
        size: stats.size,
        mimeType: mimeType || 'text/plain',
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
      
      console.log('File saved successfully:', metadata);
      return {
        content,
        metadata
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Create a zip archive of multiple files
   * 
   * @param {Array} filePaths - Array of relative file paths
   * @returns {Promise<Object>} - Zip file object
   */
  async createZipArchive(filePaths) {
    try {
      // Create a temporary file for the zip
      const zipFileName = `download_${uuidv4()}.zip`;
      const zipFilePath = path.join(BASE_STORAGE_DIR, '../temp', zipFileName);
      
      // Ensure temp directory exists
      await fs.ensureDir(path.dirname(zipFilePath));
      
      // Create a write stream for the zip file
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression level
      });
      
      // Pipe the archive to the file
      archive.pipe(output);
      
      // Add each file to the archive
      for (const filePath of filePaths) {
        const absolutePath = this._getAbsolutePath(filePath);
        
        // Check if file exists
        if (await fs.pathExists(absolutePath)) {
          const stats = await fs.stat(absolutePath);
          
          if (stats.isDirectory()) {
            // Add directory contents recursively
            archive.directory(absolutePath, path.basename(absolutePath));
          } else {
            // Add file
            archive.file(absolutePath, { name: path.basename(absolutePath) });
          }
        }
      }
      
      // Finalize the archive
      await archive.finalize();
      
      // Return when the archive is fully written
      return new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve({
            name: zipFileName,
            path: zipFilePath,
            size: archive.pointer(),
            type: 'application/zip'
          });
        });
        
        archive.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      console.error('Error creating zip archive:', error);
      throw new Error(`Failed to create zip archive: ${error.message}`);
    }
  }

  /**
   * Rename a file or folder
   * 
   * @param {string} itemPath - Relative path to the item
   * @param {string} newName - New name for the item
   * @returns {Promise<Object>} - Renamed item object
   */
  async rename(itemPath, newName) {
    try {
      const absolutePath = this._getAbsolutePath(itemPath);
      
      // Check if item exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error('Item not found');
      }
      
      // Get the parent directory
      const parentDir = path.dirname(absolutePath);
      
      // Create the new path
      const newPath = path.join(parentDir, newName);
      
      // Check if destination already exists
      if (await fs.pathExists(newPath)) {
        throw new Error('An item with this name already exists');
      }
      
      // Rename the item
      await fs.rename(absolutePath, newPath);
      
      // Get item stats
      const stats = await fs.stat(newPath);
      const isDirectory = stats.isDirectory();
      
      return {
        name: newName,
        path: path.relative(BASE_STORAGE_DIR, newPath),
        isDirectory,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: isDirectory ? 'folder' : mime.lookup(newName) || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error renaming item:', error);
      throw new Error(`Failed to rename item: ${error.message}`);
    }
  }

  /**
   * Move a file or folder
   * 
   * @param {string} sourcePath - Relative path to the source item
   * @param {string} destinationPath - Relative path to the destination directory
   * @returns {Promise<Object>} - Moved item object
   */
  async move(sourcePath, destinationPath) {
    try {
      const sourceAbsolutePath = this._getAbsolutePath(sourcePath);
      const destinationAbsolutePath = this._getAbsolutePath(destinationPath);
      
      // Check if source exists
      if (!(await fs.pathExists(sourceAbsolutePath))) {
        throw new Error('Source item not found');
      }
      
      // Check if destination directory exists
      const destStats = await fs.stat(destinationAbsolutePath);
      if (!destStats.isDirectory()) {
        throw new Error('Destination must be a directory');
      }
      
      // Get the item name
      const itemName = path.basename(sourceAbsolutePath);
      
      // Create the new path
      const newPath = path.join(destinationAbsolutePath, itemName);
      
      // Check if destination already has an item with the same name
      if (await fs.pathExists(newPath)) {
        throw new Error('An item with the same name already exists in the destination');
      }
      
      // Move the item
      await fs.move(sourceAbsolutePath, newPath);
      
      // Get item stats
      const stats = await fs.stat(newPath);
      const isDirectory = stats.isDirectory();
      
      return {
        name: itemName,
        path: path.relative(BASE_STORAGE_DIR, newPath),
        isDirectory,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: isDirectory ? 'folder' : mime.lookup(itemName) || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error moving item:', error);
      throw new Error(`Failed to move item: ${error.message}`);
    }
  }

  /**
   * Delete a file or folder
   * 
   * @param {string} itemPath - Relative path to the item
   * @returns {Promise<void>}
   */
  async delete(itemPath) {
    try {
      const absolutePath = this._getAbsolutePath(itemPath);
      
      // Check if item exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error('Item not found');
      }
      
      // Delete the item (recursively if it's a directory)
      await fs.remove(absolutePath);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  }

  /**
   * Get metadata for a file or folder
   * 
   * @param {string} itemPath - Relative path to the item
   * @returns {Promise<Object>} - Metadata object
   */
  async getMetadata(itemPath) {
    try {
      const absolutePath = this._getAbsolutePath(itemPath);
      
      // Check if item exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error('Item not found');
      }
      
      // Get item stats
      const stats = await fs.stat(absolutePath);
      const isDirectory = stats.isDirectory();
      const name = path.basename(absolutePath);
      
      // Basic metadata
      const metadata = {
        name,
        path: path.relative(BASE_STORAGE_DIR, absolutePath),
        isDirectory,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        type: isDirectory ? 'folder' : mime.lookup(name) || 'application/octet-stream'
      };
      
      // If it's a directory, count items inside
      if (isDirectory) {
        const items = await fs.readdir(absolutePath);
        metadata.itemCount = items.length;
      }
      
      return metadata;
    } catch (error) {
      console.error('Error getting metadata:', error);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  /**
   * Get a preview for a file
   * 
   * @param {string} filePath - Relative path to the file
   * @returns {Promise<Object>} - Preview object
   */
  async getFilePreview(filePath) {
    try {
      const absolutePath = this._getAbsolutePath(filePath);
      
      // Check if file exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error('File not found');
      }
      
      // Check if it's a file, not a directory
      const stats = await fs.stat(absolutePath);
      if (stats.isDirectory()) {
        throw new Error('Cannot preview a directory');
      }
      
      const fileName = path.basename(absolutePath);
      const fileType = mime.lookup(fileName) || 'application/octet-stream';
      
      // Basic preview info
      const preview = {
        name: fileName,
        path: path.relative(BASE_STORAGE_DIR, absolutePath),
        size: stats.size,
        type: fileType,
        previewType: 'none',
        previewContent: null
      };
      
      // Generate preview based on file type
      if (fileType.startsWith('image/')) {
        // For images, return the file path for direct display
        preview.previewType = 'image';
        preview.previewUrl = `/files/documents/${path.relative(BASE_STORAGE_DIR, absolutePath)}`;
      } else if (fileType === 'application/pdf') {
        // For PDFs, return the file path for embedding
        preview.previewType = 'pdf';
        preview.previewUrl = `/files/documents/${path.relative(BASE_STORAGE_DIR, absolutePath)}`;
      } else if (fileType.startsWith('text/') || 
                fileType === 'application/json' || 
                fileType === 'application/xml') {
        // For text files, read the content (limit to first 100KB)
        preview.previewType = 'text';
        const content = await fs.readFile(absolutePath, 'utf8', { 
          length: 102400, // 100KB
          position: 0 
        });
        preview.previewContent = content;
      }
      
      return preview;
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw new Error(`Failed to get file preview: ${error.message}`);
    }
  }
}

// Create and export a single instance
const fileServiceInstance = new FileService();
module.exports = fileServiceInstance;
