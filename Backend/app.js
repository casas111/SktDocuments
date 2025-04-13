require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Import routes
const documentRoutes = require('./routes/documentRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const claudeRoutes = require('./routes/claudeRoutes');
const fileRoutes = require('./routes/fileRoutes');
const fileMetadataRoutes = require('./routes/fileMetadataRoutes');
const directFileRoutes = require('./routes/directFileRoutes');
const tagRoutes = require('./routes/tagRoutes');
const transformationNodeRoutes = require('./routes/transformationNodeRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure storage directories exist
fs.ensureDirSync(path.join(__dirname, 'storage', 'uploads'));
fs.ensureDirSync(path.join(__dirname, 'storage', 'processed'));

// Static file serving for processed documents
app.use('/files', express.static(path.join(__dirname, 'storage')));

// Direct file routes
app.use('/files', directFileRoutes);

// API routes
app.use('/api/documents', documentRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/claude', claudeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/files', fileMetadataRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/transformation', transformationNodeRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Workflow Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = app;
