const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Node = sequelize.define('Node', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('transformation', 'comparison', 'simetrik_integration', 'communication'),
    allowNull: false
  },
  position: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { x: 0, y: 0 }
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Workflows',
      key: 'id'
    }
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
      fields: ['workflowId']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Node;
