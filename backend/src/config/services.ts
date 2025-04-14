import dotenv from 'dotenv';
import { initializeS3 } from './config/s3';
import { testConnection, initializeDatabase } from './config/database';

dotenv.config();

// Initialize AWS S3 and RDS
export const initializeServices = async (): Promise<void> => {
  try {
    console.log('Initializing services...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Initialize database
    await initializeDatabase();
    
    // Initialize S3
    await initializeS3();
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
};
