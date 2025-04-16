const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Edge = sequelize.define('Edge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sourceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Nodes',
      key: 'id'
    }
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Nodes',
      key: 'id'
    }
  },
  sourceHandle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetHandle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Workflows',
      key: 'id'
    }
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true
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
      fields: ['sourceId']
    },
    {
      fields: ['targetId']
    },
    {
      fields: ['workflowId']
    }
  ]
});

module.exports = Edge;
