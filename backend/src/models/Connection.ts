import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Workflow from './Workflow';
import Node from './Node';

// Connection interface
interface ConnectionAttributes {
  id: string;
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConnectionCreationAttributes extends Optional<ConnectionAttributes, 'id'> {}

// Connection model
class Connection extends Model<ConnectionAttributes, ConnectionCreationAttributes> implements ConnectionAttributes {
  public id!: string;
  public workflowId!: string;
  public sourceNodeId!: string;
  public targetNodeId!: string;
  public sourceHandle!: string;
  public targetHandle!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
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
    sourceNodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'nodes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    targetNodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'nodes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sourceHandle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetHandle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Connection',
    tableName: 'connections',
    timestamps: true,
  }
);

// Associations
Connection.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });
Connection.belongsTo(Node, { foreignKey: 'sourceNodeId', as: 'sourceNode' });
Connection.belongsTo(Node, { foreignKey: 'targetNodeId', as: 'targetNode' });
Workflow.hasMany(Connection, { foreignKey: 'workflowId', as: 'connections' });
Node.hasMany(Connection, { foreignKey: 'sourceNodeId', as: 'outgoingConnections' });
Node.hasMany(Connection, { foreignKey: 'targetNodeId', as: 'incomingConnections' });

export default Connection;
