const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NodeExecution = sequelize.define('NodeExecution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nodeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Nodes',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  inputDocuments: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  outputDocuments: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  executionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Execution time in milliseconds'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['nodeId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = NodeExecution;
