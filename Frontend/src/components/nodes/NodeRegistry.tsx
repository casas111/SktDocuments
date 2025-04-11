import React from 'react';
import { NodeTypes } from 'reactflow';
import CommunicationNode from './CommunicationNode';
import ComparisonNode from './ComparisonNode';
import SimetrikNode from './SimetrikNode';
import RedNode from './RedNode';
import EnhancedTranslationNode from './EnhancedTranslationNode';

// Node type constants
export const NODE_TYPES = {
  communicationNode: 'communicationNode',
  translationNode: 'translationNode',
  simetrikNode: 'simetrikNode',
  comparisonNode: 'comparisonNode',
  redNode: 'redNode',
};

// Node type components mapping
export const nodeTypes: NodeTypes = {
  [NODE_TYPES.communicationNode]: CommunicationNode,
  [NODE_TYPES.translationNode]: EnhancedTranslationNode, // Updated to use EnhancedTranslationNode
  [NODE_TYPES.simetrikNode]: SimetrikNode,
  [NODE_TYPES.comparisonNode]: ComparisonNode,
  [NODE_TYPES.redNode]: RedNode,
};

// Base node configuration
export const baseNode = {
  style: {
    width: 250,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  data: {
    label: 'Node',
    description: 'Node description',
    icon: 'default',
    capabilities: [],
  },
};

// Get node defaults based on type
export const getNodeDefaults = (type: string, position: { x: number, y: number }, label?: string) => {
  const id = Math.random().toString(36).substring(2, 9);
  
  switch (type) {
    case NODE_TYPES.communicationNode:
      return {
        id,
        type,
        position,
        style: {
          ...baseNode.style,
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
        },
        data: {
          ...baseNode.data,
          label: label || getDefaultLabel(type),
          icon: 'communication',
          description: 'Handles external communication',
          capabilities: ['API', 'Webhook', 'Email'],
        },
      };
    
    case NODE_TYPES.translationNode:
      return {
        id,
        type,
        position,
        style: {
          ...baseNode.style,
          backgroundColor: '#e8f5e9',
          borderColor: '#4caf50',
        },
        data: {
          ...baseNode.data,
          label: label || getDefaultLabel(type),
          icon: 'translate',
          description: 'Transforms documents using a template format with Claude AI',
          capabilities: ['Document Transformation', 'Template Processing', 'AI Integration'],
        },
      };
    
    case NODE_TYPES.simetrikNode:
      return {
        id,
        type,
        position,
        style: {
          ...baseNode.style,
          backgroundColor: '#f3e5f5',
          borderColor: '#9c27b0',
        },
        data: {
          ...baseNode.data,
          label: label || getDefaultLabel(type),
          icon: 'cloud',
          description: 'Connects to Simetrik SaaS platform',
          capabilities: ['Integration', 'Data Processing', 'Analytics'],
        },
      };
    
    case NODE_TYPES.comparisonNode:
      return {
        id,
        type,
        position,
        style: {
          ...baseNode.style,
          backgroundColor: '#fff3e0',
          borderColor: '#ff9800',
        },
        data: {
          ...baseNode.data,
          label: label || getDefaultLabel(type),
          icon: 'compare',
          description: 'Compares and validates data',
          capabilities: ['Validation', 'Comparison', 'Verification'],
        },
      };
    
    case NODE_TYPES.redNode:
      return {
        id,
        type,
        position,
        style: {
          ...baseNode.style,
          backgroundColor: '#ffebee',
          borderColor: '#f44336',
        },
        data: {
          ...baseNode.data,
          icon: 'priority',
          description: 'High priority processing node',
          capabilities: ['Priority', 'Alert', 'Critical'],
        },
      };
    
    default:
      return baseNode;
  }
};

// Get default label based on node type
const getDefaultLabel = (type: string): string => {
  switch (type) {
    case NODE_TYPES.communicationNode:
      return 'Communication Node';
    case NODE_TYPES.translationNode:
      return 'Document Translation';
    case NODE_TYPES.simetrikNode:
      return 'Simetrik SaaS Node';
    case NODE_TYPES.comparisonNode:
      return 'Comparison Node';
    case NODE_TYPES.redNode:
      return 'Red Node';
    default:
      return 'Node';
  }
};

// Workflow templates
export const WORKFLOW_TEMPLATES = {
  basic: {
    name: 'Basic Workflow',
    description: 'A simple workflow with one of each node type',
    nodes: [
      getNodeDefaults(NODE_TYPES.communicationNode, { x: 100, y: 100 }, 'API Gateway'),
      getNodeDefaults(NODE_TYPES.translationNode, { x: 350, y: 100 }, 'Document Translator'),
      getNodeDefaults(NODE_TYPES.simetrikNode, { x: 600, y: 100 }, 'Simetrik Connector'),
      getNodeDefaults(NODE_TYPES.comparisonNode, { x: 850, y: 100 }, 'Data Validator'),
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  advanced: {
    name: 'Advanced Workflow',
    description: 'A complex workflow with multiple paths and connections',
    nodes: [
      getNodeDefaults(NODE_TYPES.communicationNode, { x: 100, y: 100 }, 'REST API'),
      getNodeDefaults(NODE_TYPES.communicationNode, { x: 100, y: 250 }, 'WebSocket'),
      getNodeDefaults(NODE_TYPES.translationNode, { x: 350, y: 175 }, 'Document Transformer'),
      getNodeDefaults(NODE_TYPES.simetrikNode, { x: 600, y: 100 }, 'Simetrik API'),
      getNodeDefaults(NODE_TYPES.simetrikNode, { x: 600, y: 250 }, 'Simetrik Database'),
      getNodeDefaults(NODE_TYPES.comparisonNode, { x: 850, y: 175 }, 'Result Validator'),
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  translationWorkflow: {
    name: 'Document Translation Workflow',
    description: 'A workflow focused on document translation with Claude AI',
    nodes: [
      getNodeDefaults(NODE_TYPES.communicationNode, { x: 100, y: 150 }, 'Document Source'),
      getNodeDefaults(NODE_TYPES.translationNode, { x: 350, y: 150 }, 'Document Translator'),
      getNodeDefaults(NODE_TYPES.simetrikNode, { x: 600, y: 150 }, 'Output Processor'),
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },
};

// Validation function for workflows
export const validateWorkflow = (nodes: any[], edges: any[]) => {
  const errors: string[] = [];
  
  // Check if workflow has nodes
  if (nodes.length === 0) {
    return { valid: true, errors: [] }; // Empty workflow is valid but not useful
  }
  
  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  
  if (disconnectedNodes.length > 0) {
    errors.push(`${disconnectedNodes.length} disconnected node(s) found`);
  }
  
  // Check for circular references
  const nodeMap = new Map();
  
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      visited: false,
      inStack: false,
      connections: edges
        .filter(edge => edge.source === node.id)
        .map(edge => edge.target)
    });
  });
  
  const hasCycle = (nodeId: string, visited = new Set(), stack = new Set()) => {
    if (!nodeMap.has(nodeId)) return false;
    
    if (stack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    stack.add(nodeId);
    
    const node = nodeMap.get(nodeId);
    for (const targetId of node.connections) {
      if (hasCycle(targetId, visited, stack)) {
        return true;
      }
    }
    
    stack.delete(nodeId);
    return false;
  };
  
  // Convert Map.keys() to array to avoid iteration issues
  const nodeIds = Array.from(nodeMap.keys());
  for (const nodeId of nodeIds) {
    if (hasCycle(nodeId)) {
      errors.push('Workflow contains circular references, which may cause infinite loops');
      break;
    }
  }
  
  // Check for missing required node types
  const nodeTypes = nodes.map(node => node.type);
  const hasCommNode = nodeTypes.includes(NODE_TYPES.communicationNode);
  const hasSimetrikNode = nodeTypes.includes(NODE_TYPES.simetrikNode);
  
  if (!hasCommNode) {
    errors.push('Workflow should include at least one Communication node');
  }
  
  if (!hasSimetrikNode) {
    errors.push('Workflow should include at least one Simetrik SaaS node');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
