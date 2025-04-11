/**
 * Application configuration
 */

// API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Backend base URL for direct file access
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// File upload size limit in bytes (10MB)
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Supported file types for preview
export const PREVIEWABLE_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml'
];

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 20;
