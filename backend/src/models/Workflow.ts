import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// Workflow interface
interface WorkflowAttributes {
  id: string;
  name: string;
  description: string;
  canvasState: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkflowCreationAttributes extends Optional<WorkflowAttributes, 'id'> {}

// Workflow model
class Workflow extends Model<WorkflowAttributes, WorkflowCreationAttributes> implements WorkflowAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public canvasState!: string;
  public ownerId!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workflow.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    canvasState: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '{}',
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
    modelName: 'Workflow',
    tableName: 'workflows',
    timestamps: true,
  }
);

// Associations
Workflow.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

export default Workflow;
