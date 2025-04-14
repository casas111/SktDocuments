import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeServices } from './config/services';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import folderRoutes from './routes/folderRoutes';
import documentRoutes from './routes/documentRoutes';
import labelRoutes from './routes/labelRoutes';
import workflowRoutes from './routes/workflowRoutes';
import nodeRoutes from './routes/nodeRoutes';

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/nodes', nodeRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize services (S3 and RDS)
    await initializeServices();
    
    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
