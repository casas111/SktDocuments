/**
 * Modified fileMetadataController.js to work with the test files
 * This version uses a more direct approach to file access
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);
const mime = require('mime-types');

/**
 * Get metadata for a specific file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFileMetadata = async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    console.log('Getting metadata for file:', filePath);
    
    // Try different path resolutions to find the file
    const possiblePaths = [
      // Direct path as provided
      filePath,
      // Path relative to project root
      path.join(__dirname, '..', '..', filePath),
      // Path relative to backend
      path.join(__dirname, '..', filePath),
      // Just the filename in test-files
      path.join(__dirname, '..', 'test-files', path.basename(filePath))
    ];
    
    let fullPath = null;
    let fileExists = false;
    
    // Try each possible path
    for (const testPath of possiblePaths) {
      console.log('Checking path:', testPath);
      if (fs.existsSync(testPath)) {
        fullPath = testPath;
        fileExists = true;
        console.log('File found at:', fullPath);
        break;
      }
    }
    
    if (!fileExists) {
      console.log('File not found in any of the checked locations');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get file stats
    const stats = await statAsync(fullPath);
    
    // Get file mime type
    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
    
    // Return file metadata
    res.json({
      success: true,
      data: {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        type: mimeType,
        modifiedAt: stats.mtime,
        createdAt: stats.ctime
      }
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metadata',
      error: error.message
    });
  }
};

/**
 * Download a specific file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.downloadFile = async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    console.log('Downloading file:', filePath);
    
    // Try different path resolutions to find the file
    const possiblePaths = [
      // Direct path as provided
      filePath,
      // Path relative to project root
      path.join(__dirname, '..', '..', filePath),
      // Path relative to backend
      path.join(__dirname, '..', filePath),
      // Just the filename in test-files
      path.join(__dirname, '..', 'test-files', path.basename(filePath))
    ];
    
    let fullPath = null;
    let fileExists = false;
    
    // Try each possible path
    for (const testPath of possiblePaths) {
      console.log('Checking path:', testPath);
      if (fs.existsSync(testPath)) {
        fullPath = testPath;
        fileExists = true;
        console.log('File found at:', fullPath);
        break;
      }
    }
    
    if (!fileExists) {
      console.log('File not found in any of the checked locations');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get file stats
    const stats = await statAsync(fullPath);
    
    // Get file mime type
    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
    
    // Set response headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};
