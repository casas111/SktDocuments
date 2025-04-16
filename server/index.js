const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Test database connection
async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database
    // In production, you would use migrations instead
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// API routes
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/workflows', require('./routes/workflowRoutes'));
app.use('/api/nodes', require('./routes/nodeRoutes'));
app.use('/api/labels', require('./routes/labelRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testDbConnection();
});

module.exports = app;
