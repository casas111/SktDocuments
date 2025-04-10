const path = require('path');

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Storage configuration
  storage: {
    uploadsDir: path.join(__dirname, '../storage/uploads'),
    processedDir: path.join(__dirname, '../storage/processed'),
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  
  // API configuration
  api: {
    baseUrl: '/api',
    documentEndpoint: '/documents',
    workflowEndpoint: '/workflow'
  },
  
  // AI service configuration
  ai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  }
};
