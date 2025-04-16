const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  canvasData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
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
      fields: ['name']
    }
  ]
});

module.exports = Workflow;
