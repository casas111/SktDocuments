import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon
} from '@mui/icons-material';

// Import custom node types
import TransformationNode from './nodes/TransformationNode';
import ComparisonNode from './nodes/ComparisonNode';
import SimetrikIntegrationNode from './nodes/SimetrikIntegrationNode';
import CommunicationNode from './nodes/CommunicationNode';

// Define custom node types
const nodeTypes: NodeTypes = {
  transformation: TransformationNode,
  comparison: ComparisonNode,
  simetrik_integration: SimetrikIntegrationNode,
  communication: CommunicationNode
};

interface WorkflowCanvasProps {
  workflowId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onRun?: () => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflowId,
  onSave,
  onRun
}) => {
  // Initial nodes and edges
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // State for node counter (to generate unique IDs)
  const [nodeCount, setNodeCount] = useState(0);
  
  // Reference to the ReactFlow instance
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(
      { 
        ...params, 
        type: 'smoothstep', 
        animated: true,
        style: { stroke: '#0F4C81' }
      }, 
      eds
    )),
    [setEdges]
  );
  
  // Handle dropping new nodes onto the canvas
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is valid
      if (!type) return;
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Generate a unique node ID
      const newNodeId = `${type}-${nodeCount}`;
      setNodeCount(nodeCount + 1);
      
      // Create a new node
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          config: {}
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodeCount, setNodes]
  );
  
  // Handle saving the workflow
  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };
  
  // Handle running the workflow
  const handleRun = () => {
    if (onRun) {
      onRun();
    }
  };
  
  // Handle deleting selected elements
  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  };
  
  // Handle zooming
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };
  
  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  };
  
  // Handle drag start for node palette items
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', border: '1px solid #ddd' }}>
      {/* Node Palette */}
      <Paper 
        elevation={2} 
        sx={{ 
          width: 250, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0,
          borderRight: '1px solid #ddd'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Node Palette
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Drag nodes to the canvas
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Paper
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
            onDragStart={(event) => onDragStart(event, 'transformation')}
            draggable
          >
            <Typography variant="body2">Transformation Node</Typography>
            <Typography variant="caption" color="text.secondary">
              Transform documents using AI
            </Typography>
          </Paper>
          
          <Paper
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
            onDragStart={(event) => onDragStart(event, 'comparison')}
            draggable
          >
            <Typography variant="body2">Comparison Node</Typography>
            <Typography variant="caption" color="text.secondary">
              Compare documents and generate reports
            </Typography>
          </Paper>
          
          <Paper
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
            onDragStart={(event) => onDragStart(event, 'simetrik_integration')}
            draggable
          >
            <Typography variant="body2">Simetrik Integration Node</Typography>
            <Typography variant="caption" color="text.secondary">
              Connect with Simetrik services
            </Typography>
          </Paper>
          
          <Paper
            sx={{
              p: 2,
              cursor: 'grab',
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
            onDragStart={(event) => onDragStart(event, 'communication')}
            draggable
          >
            <Typography variant="body2">Communication Node</Typography>
            <Typography variant="caption" color="text.secondary">
              Send notifications and alerts
            </Typography>
          </Paper>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ mb: 1 }}
          >
            Save Workflow
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth 
            startIcon={<RunIcon />}
            onClick={handleRun}
          >
            Run Workflow
          </Button>
        </Box>
      </Paper>
      
      {/* Flow Canvas */}
      <Box sx={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            connectionLineType={ConnectionLineType.SmoothStep}
            deleteKeyCode="Delete"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Zoom In">
                  <IconButton onClick={handleZoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton onClick={handleZoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Fit View">
                  <IconButton onClick={handleFitView}>
                    <FitScreenIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Selected">
                  <IconButton onClick={handleDelete} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
};

export default WorkflowCanvas;
