import React, { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { styled } from '@mui/material/styles';
import EnhancedTranslationNode from '../translation/EnhancedTranslationNode';
import WorkflowToolbar from './WorkflowToolbar';
import { TranslationNodeData } from '../translation/types';
import { BaseNodeData } from './types';

// Types
type NodeData = BaseNodeData | TranslationNodeData;
type WorkflowNode = Node<NodeData>;

interface WorkflowCanvasProps {
  initialNodes: WorkflowNode[];
  initialEdges: Edge[];
  onSave: () => Promise<void>;
  readOnly: boolean;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  translation: EnhancedTranslationNode
};

// Initial nodes and edges
const defaultNodes: WorkflowNode[] = [];
const defaultEdges: Edge[] = [];

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onSave,
  readOnly
}) => {
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle edge connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WorkflowToolbar />
      
      <Box sx={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default WorkflowCanvas;
