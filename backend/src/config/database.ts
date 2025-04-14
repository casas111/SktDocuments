import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'simetrik_documents',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');
    
    // Create default folders if they don't exist
    const [results] = await sequelize.query(`
      INSERT INTO folders (id, name, parent_id, owner_id, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'Documents', NULL, '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
        (gen_random_uuid(), 'Transformations', NULL, '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
        (gen_random_uuid(), 'Comparisons', NULL, '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
        (gen_random_uuid(), 'Integrations', NULL, '00000000-0000-0000-0000-000000000000', NOW(), NOW()),
        (gen_random_uuid(), 'Communications', NULL, '00000000-0000-0000-0000-000000000000', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Default folders created');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
