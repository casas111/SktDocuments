import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// Label interface
interface LabelAttributes {
  id: string;
  name: string;
  color: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LabelCreationAttributes extends Optional<LabelAttributes, 'id'> {}

// Label model
class Label extends Model<LabelAttributes, LabelCreationAttributes> implements LabelAttributes {
  public id!: string;
  public name!: string;
  public color!: string;
  public ownerId!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Label.init(
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
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#0F4C81', // Default Simetrik blue
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
    modelName: 'Label',
    tableName: 'labels',
    timestamps: true,
  }
);

// Associations
Label.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

export default Label;
