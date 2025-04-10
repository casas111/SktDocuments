const fs = require('fs-extra');
const path = require('path');

/**
 * Utility functions for file operations
 */

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
const ensureDir = (dirPath) => {
  fs.ensureDirSync(dirPath);
};

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename);
};

/**
 * Get file mime type based on extension
 * @param {string} filename - Filename
 * @returns {string} Mime type
 */
const getMimeType = (filename) => {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Check if file is readable as text
 * @param {string} filename - Filename
 * @returns {boolean} True if file is readable as text
 */
const isTextFile = (filename) => {
  const ext = getFileExtension(filename).toLowerCase();
  const textExtensions = ['.txt', '.csv', '.json', '.xml', '.html', '.htm', '.md', '.js', '.ts', '.css'];
  
  return textExtensions.includes(ext);
};

/**
 * Read file as text
 * @param {string} filePath - File path
 * @returns {Promise<string>} File content
 */
const readFileAsText = async (filePath) => {
  return fs.readFile(filePath, 'utf8');
};

/**
 * Write text to file
 * @param {string} filePath - File path
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
const writeTextToFile = async (filePath, content) => {
  return fs.writeFile(filePath, content);
};

/**
 * Delete file
 * @param {string} filePath - File path
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  if (fs.existsSync(filePath)) {
    return fs.unlink(filePath);
  }
};

module.exports = {
  ensureDir,
  getFileExtension,
  getMimeType,
  isTextFile,
  readFileAsText,
  writeTextToFile,
  deleteFile
};
