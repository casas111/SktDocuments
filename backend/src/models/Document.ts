import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Folder from './Folder';

// Document interface
interface DocumentAttributes {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id'> {}

// Document model
class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public name!: string;
  public type!: string;
  public size!: number;
  public url!: string;
  public folderId!: string;
  public ownerId!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    folderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'folders',
        key: 'id',
      },
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
  }
);

// Associations
Document.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });

export default Document;
