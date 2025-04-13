// API configuration
export const API_BASE_URL = 'http://localhost:3001/api';

// API endpoints
export const API_ENDPOINTS = {
  // Document endpoints
  DOCUMENTS: `${API_BASE_URL}/documents`,
  FILES: `${API_BASE_URL}/files`,
  FOLDERS: `${API_BASE_URL}/folders`,
  
  // Workflow endpoints
  WORKFLOWS: `${API_BASE_URL}/workflows`,
  NODES: `${API_BASE_URL}/nodes`,
  
  // Transformation endpoints
  TRANSFORMATION: `${API_BASE_URL}/transformation`,
  
  // Claude AI endpoints
  CLAUDE: `${API_BASE_URL}/claude`
};

// API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// File upload headers
export const UPLOAD_HEADERS = {
  'Accept': 'application/json'
};

// Maximum file size for uploads (in bytes)
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
