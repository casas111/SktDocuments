import { Node, Edge } from 'reactflow';
import { TranslationNodeData } from '../translation/types';

// Base node data interface
export interface BaseNodeData {
  label: string;
  description: string;
  icon: string;
  capabilities: string[];
}

// Union type for all possible node data types
export type NodeData = BaseNodeData | TranslationNodeData;

// Workflow node type
export type WorkflowNode = Node<NodeData>;

// Workflow data interface
export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: Edge[];
} 