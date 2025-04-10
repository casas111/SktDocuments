/**
 * File Controller
 * Handles HTTP requests related to file and folder operations
 */

const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fileService = require('../services/fileService');

/**
 * Controller for file and folder operations
 */
class FileController {
  /**
   * Get all files and folders in a directory
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDirectoryContents(req, res) {
    try {
      const { dirPath = '' } = req.query;
      const contents = await fileService.getDirectoryContents(dirPath);
      
      return res.status(200).json({
        success: true,
        data: contents
      });
    } catch (error) {
      console.error('Error getting directory contents:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve directory contents',
        error: error.message
      });
    }
  }

  /**
   * Create a new folder
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createFolder(req, res) {
    try {
      const { folderPath, folderName } = req.body;
      
      if (!folderName) {
        return res.status(400).json({
          success: false,
          message: 'Folder name is required'
        });
      }

      const newFolder = await fileService.createFolder(folderPath, folderName);
      
      return res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: newFolder
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create folder',
        error: error.message
      });
    }
  }

  /**
   * Upload files
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadFiles(req, res) {
    try {
      const { folderPath = '' } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded'
        });
      }

      const uploadedFiles = await fileService.saveUploadedFiles(req.files, folderPath);
      
      return res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message
      });
    }
  }

  /**
   * Download a file
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadFile(req, res) {
    try {
      const { filePath } = req.params;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      const file = await fileService.getFile(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      return res.download(file.path, file.name);
    } catch (error) {
      console.error('Error downloading file:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }

  /**
   * Download multiple files as a zip
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadMultipleFiles(req, res) {
    try {
      const { filePaths } = req.body;
      
      if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File paths array is required'
        });
      }

      const zipFile = await fileService.createZipArchive(filePaths);
      
      res.setHeader('Content-Disposition', `attachment; filename="${zipFile.name}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      return res.download(zipFile.path, zipFile.name, (err) => {
        // Delete the temporary zip file after download
        if (zipFile.path) {
          fs.unlink(zipFile.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temporary zip file:', unlinkErr);
          });
        }
      });
    } catch (error) {
      console.error('Error downloading multiple files:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download files',
        error: error.message
      });
    }
  }

  /**
   * Rename a file or folder
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rename(req, res) {
    try {
      const { path: itemPath, newName } = req.body;
      
      if (!itemPath || !newName) {
        return res.status(400).json({
          success: false,
          message: 'Path and new name are required'
        });
      }

      const renamedItem = await fileService.rename(itemPath, newName);
      
      return res.status(200).json({
        success: true,
        message: 'Item renamed successfully',
        data: renamedItem
      });
    } catch (error) {
      console.error('Error renaming item:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to rename item',
        error: error.message
      });
    }
  }

  /**
   * Move a file or folder
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async move(req, res) {
    try {
      const { sourcePath, destinationPath } = req.body;
      
      if (!sourcePath || !destinationPath) {
        return res.status(400).json({
          success: false,
          message: 'Source and destination paths are required'
        });
      }

      const movedItem = await fileService.move(sourcePath, destinationPath);
      
      return res.status(200).json({
        success: true,
        message: 'Item moved successfully',
        data: movedItem
      });
    } catch (error) {
      console.error('Error moving item:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to move item',
        error: error.message
      });
    }
  }

  /**
   * Delete a file or folder
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async delete(req, res) {
    try {
      const { path: itemPath } = req.params;
      
      if (!itemPath) {
        return res.status(400).json({
          success: false,
          message: 'Path is required'
        });
      }

      await fileService.delete(itemPath);
      
      return res.status(200).json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete item',
        error: error.message
      });
    }
  }

  /**
   * Get file metadata
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMetadata(req, res) {
    try {
      const { path: itemPath } = req.params;
      
      if (!itemPath) {
        return res.status(400).json({
          success: false,
          message: 'Path is required'
        });
      }

      const metadata = await fileService.getMetadata(itemPath);
      
      return res.status(200).json({
        success: true,
        data: metadata
      });
    } catch (error) {
      console.error('Error getting metadata:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get metadata',
        error: error.message
      });
    }
  }

  /**
   * Preview a file
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async previewFile(req, res) {
    try {
      const { filePath } = req.params;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      const filePreview = await fileService.getFilePreview(filePath);
      
      return res.status(200).json({
        success: true,
        data: filePreview
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to preview file',
        error: error.message
      });
    }
  }
}

module.exports = new FileController();
