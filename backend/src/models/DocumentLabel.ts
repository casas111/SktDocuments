import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Document from './Document';
import Label from './Label';

// DocumentLabel interface
interface DocumentLabelAttributes {
  documentId: string;
  labelId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// DocumentLabel model
class DocumentLabel extends Model<DocumentLabelAttributes> implements DocumentLabelAttributes {
  public documentId!: string;
  public labelId!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentLabel.init(
  {
    documentId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'documents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    labelId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'labels',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'DocumentLabel',
    tableName: 'document_labels',
    timestamps: true,
  }
);

// Associations
Document.belongsToMany(Label, { through: DocumentLabel, foreignKey: 'documentId', as: 'labels' });
Label.belongsToMany(Document, { through: DocumentLabel, foreignKey: 'labelId', as: 'documents' });

export default DocumentLabel;
