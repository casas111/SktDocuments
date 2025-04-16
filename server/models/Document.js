const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  folderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Folders',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
    },
    {
      fields: ['folderId']
    }
  ]
});

module.exports = Document;
