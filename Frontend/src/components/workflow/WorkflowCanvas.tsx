import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Panel,
  ConnectionLineType,
  MarkerType,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { NODE_TYPES } from '../nodes/NodeRegistry';

// Import node components
import CommunicationNode from '../nodes/CommunicationNode';
import TranslationNode from '../nodes/TranslationNode';
import SimetrikNode from '../nodes/SimetrikNode';
import ComparisonNode from '../nodes/ComparisonNode';
import RedNode from '../nodes/RedNode';

// Define node types for ReactFlow
const nodeTypes = {
  [NODE_TYPES.communicationNode]: CommunicationNode,
  [NODE_TYPES.translationNode]: TranslationNode,
  [NODE_TYPES.simetrikNode]: SimetrikNode,
  [NODE_TYPES.comparisonNode]: ComparisonNode,
  [NODE_TYPES.redNode]: RedNode,
};

// Define custom edge styles
const edgeOptions = {
  animated: true,
  style: {
    stroke: '#555',
    strokeWidth: 2,
  },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#555',
  },
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  initialNodes = [], 
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  readOnly = false
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { fitView } = useReactFlow();
  
  // Use memo to prevent unnecessary re-renders
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeOptions = useMemo(() => edgeOptions, []);

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Fit view when nodes change
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length, fitView]);

  // Handle node changes (position, selection, etc.) with debounce for smoother drag
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    
    // Always notify parent component of changes, even during dragging
    // This ensures all node states are preserved
    if (onNodesChange) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => onNodesChange(nodes));
    }
  }, [nodes, onNodesChange, onNodesChangeInternal]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    if (onEdgesChange) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => onEdgesChange(edges));
    }
  }, [edges, onEdgesChange, onEdgesChangeInternal]);

  // Handle new connections between nodes
  const handleConnect = useCallback((connection: Connection) => {
    // Create a unique ID for the edge
    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}-${connection.sourceHandle}-${connection.targetHandle}`,
      ...edgeOptions,
      data: {
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      }
    };
    
    const updatedEdges = addEdge(newEdge, edges);
    setEdges(updatedEdges);
    
    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
    
    showNotification('Connection created successfully', 'success');
  }, [edges, setEdges, onEdgesChange]);

  // Handle node selection
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle node deletion
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
      const updatedEdges = edges.filter(
        e => e.source !== selectedNode.id && e.target !== selectedNode.id
      );
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNode(null);
      
      if (onNodesChange) {
        onNodesChange(updatedNodes);
      }
      
      if (onEdgesChange) {
        onEdgesChange(updatedEdges);
      }
      
      showNotification('Node deleted successfully', 'success');
    }
  }, [selectedNode, nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  // Handle fit view
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Custom connection line style
  const connectionLineStyle = useMemo(() => ({
    stroke: '#2196f3',
    strokeWidth: 2,
    strokeDasharray: '5 5',
  }), []);

  // Optimize drag performance with these settings
  const proOptions = useMemo(() => ({ 
    hideAttribution: true,
    fitViewOnInit: true,
    autoPanOnConnect: true,
    elevateEdgesOnSelect: true,
    enablePanOnScroll: true,
    enablePanOnDrag: true,
    smoothConnections: true,
  }), []);

  return (
    <Box 
      ref={reactFlowWrapper}
      sx={{ 
        height: '100%', 
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        '& .react-flow__node': {
          width: 'auto !important',
          height: 'auto !important',
        }
      }}
    >
      {loading && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={!readOnly ? handleConnect : undefined}
        onNodeClick={handleNodeClick}
        nodeTypes={memoizedNodeTypes}
        fitView
        onInit={setReactFlowInstance}
        deleteKeyCode="Delete"
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Control"
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={memoizedEdgeOptions}
        proOptions={proOptions}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
        preventScrolling={false}
      >
        <Controls showInteractive={false} />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === NODE_TYPES.communicationNode) return '#2196f3';
            if (n.type === NODE_TYPES.translationNode) return '#4caf50';
            if (n.type === NODE_TYPES.simetrikNode) return '#9c27b0';
            if (n.type === NODE_TYPES.comparisonNode) return '#ff9800';
            if (n.type === NODE_TYPES.redNode) return '#f44336';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === NODE_TYPES.communicationNode) return '#e3f2fd';
            if (n.type === NODE_TYPES.translationNode) return '#e8f5e9';
            if (n.type === NODE_TYPES.simetrikNode) return '#f3e5f5';
            if (n.type === NODE_TYPES.comparisonNode) return '#fff3e0';
            if (n.type === NODE_TYPES.redNode) return '#ffebee';
            return '#fff';
          }}
          nodeBorderRadius={3}
        />
        <Background color="#f8f8f8" gap={16} />
        
        {!readOnly && (
          <Panel position="top-right">
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Delete Selected Node">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDeleteNode}
                  disabled={!selectedNode}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Tooltip>
              <Tooltip title="Zoom In">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleZoomIn}
                  sx={{ minWidth: '40px', padding: '5px' }}
                >
                  <ZoomInIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleZoomOut}
                  sx={{ minWidth: '40px', padding: '5px' }}
                >
                  <ZoomOutIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Fit View">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleFitView}
                  sx={{ minWidth: '40px', padding: '5px' }}
                >
                  <CenterFocusStrongIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          </Panel>
        )}
      </ReactFlow>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowCanvas;
