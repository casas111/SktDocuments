const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentLabel = sequelize.define('DocumentLabel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Documents',
      key: 'id'
    }
  },
  labelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Labels',
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
      fields: ['documentId']
    },
    {
      fields: ['labelId']
    },
    {
      fields: ['documentId', 'labelId'],
      unique: true
    }
  ]
});

module.exports = DocumentLabel;
