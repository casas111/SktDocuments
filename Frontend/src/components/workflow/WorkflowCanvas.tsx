import React, { useCallback } from 'react';
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
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import EnhancedTranslationNode from '../nodes/EnhancedTranslationNode';
import WorkflowToolbar from './WorkflowToolbar';

// Define custom node types
const nodeTypes: NodeTypes = {
  translation: EnhancedTranslationNode
};

// Initial nodes and edges
const initialNodes = [];
const initialEdges = [];

const WorkflowCanvas: React.FC = () => {
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
