import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Workflow from './Workflow';

// Node interface
interface NodeAttributes {
  id: string;
  workflowId: string;
  type: 'transformation' | 'comparison' | 'simetrik_integration' | 'communication';
  name: string;
  positionX: number;
  positionY: number;
  config: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NodeCreationAttributes extends Optional<NodeAttributes, 'id'> {}

// Node model
class Node extends Model<NodeAttributes, NodeCreationAttributes> implements NodeAttributes {
  public id!: string;
  public workflowId!: string;
  public type!: 'transformation' | 'comparison' | 'simetrik_integration' | 'communication';
  public name!: string;
  public positionX!: number;
  public positionY!: number;
  public config!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Node.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workflowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workflows',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('transformation', 'comparison', 'simetrik_integration', 'communication'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    positionX: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    positionY: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    config: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
    },
  },
  {
    sequelize,
    modelName: 'Node',
    tableName: 'nodes',
    timestamps: true,
  }
);

// Associations
Node.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });
Workflow.hasMany(Node, { foreignKey: 'workflowId', as: 'nodes' });

export default Node;
