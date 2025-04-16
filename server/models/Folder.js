const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Folder = sequelize.define('Folder', {
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
    allowNull: false
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Folders',
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
      fields: ['name']
    },
    {
      fields: ['parentId']
    }
  ]
});

// Self-referencing relationship for folder hierarchy
Folder.hasMany(Folder, { as: 'subfolders', foreignKey: 'parentId' });
Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });

module.exports = Folder;
