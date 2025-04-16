const { sequelize } = require('../config/database');
const Document = require('./Document');
const Folder = require('./Folder');
const Workflow = require('./Workflow');
const Node = require('./Node');
const Edge = require('./Edge');
const Label = require('./Label');
const DocumentLabel = require('./DocumentLabel');
const NodeExecution = require('./NodeExecution');

// Document and Folder relationships
Document.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });
Folder.hasMany(Document, { foreignKey: 'folderId', as: 'documents' });

// Workflow relationships
Workflow.hasMany(Node, { foreignKey: 'workflowId', as: 'nodes', onDelete: 'CASCADE' });
Node.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });

Workflow.hasMany(Edge, { foreignKey: 'workflowId', as: 'edges', onDelete: 'CASCADE' });
Edge.belongsTo(Workflow, { foreignKey: 'workflowId', as: 'workflow' });

// Edge relationships
Edge.belongsTo(Node, { foreignKey: 'sourceId', as: 'source' });
Edge.belongsTo(Node, { foreignKey: 'targetId', as: 'target' });
Node.hasMany(Edge, { foreignKey: 'sourceId', as: 'outgoingEdges' });
Node.hasMany(Edge, { foreignKey: 'targetId', as: 'incomingEdges' });

// Document and Label relationships through DocumentLabel
Document.belongsToMany(Label, { through: DocumentLabel, foreignKey: 'documentId', as: 'labels' });
Label.belongsToMany(Document, { through: DocumentLabel, foreignKey: 'labelId', as: 'documents' });

// Node execution history
Node.hasMany(NodeExecution, { foreignKey: 'nodeId', as: 'executions' });
NodeExecution.belongsTo(Node, { foreignKey: 'nodeId', as: 'node' });

// Export models
module.exports = {
  sequelize,
  Document,
  Folder,
  Workflow,
  Node,
  Edge,
  Label,
  DocumentLabel,
  NodeExecution
};
