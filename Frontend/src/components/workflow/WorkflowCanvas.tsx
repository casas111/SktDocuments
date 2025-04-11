import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeTypes,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import TemplateIcon from '@mui/icons-material/AutoAwesome';
import styled from '@emotion/styled';
import { nodeTypes, NODE_TYPES, getNodeDefaults, WORKFLOW_TEMPLATES, validateWorkflow } from '../nodes/NodeRegistry';

// Styled components
const WorkflowCanvasContainer = styled(Box)`
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const CanvasControls = styled(Box)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NodePalette = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PaletteItem = styled(Button)`
  text-transform: none;
  justify-content: flex-start;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const WorkflowInfo = styled(Box)`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
`;

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Initialize with a default workflow if empty
  useEffect(() => {
    if (initialNodes.length === 0 && initialEdges.length === 0) {
      // Use the translation workflow template as default
      const template = WORKFLOW_TEMPLATES.translationWorkflow;
      setNodes(template.nodes);
      setEdges(template.edges);
      setWorkflowName(template.name);
      setWorkflowDescription(template.description);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Validate workflow when nodes or edges change
  useEffect(() => {
    const result = validateWorkflow(nodes, edges);
    setValidationResult(result);
  }, [nodes, edges]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  const handleAddNode = (type: string) => {
    const position = reactFlowInstance.project({
      x: Math.random() * 400 + 50,
      y: Math.random() * 400 + 50,
    });
    
    const newNode = getNodeDefaults(type, position);
    setNodes((nds) => [...nds, newNode]);
    setMenuAnchor(null);
  };
  
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      // Also remove any connected edges
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };
  
  const handleOpenTemplateMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTemplateMenuAnchor(event.currentTarget);
  };
  
  const handleCloseTemplateMenu = () => {
    setTemplateMenuAnchor(null);
  };
  
  const handleLoadTemplate = (templateKey: keyof typeof WORKFLOW_TEMPLATES) => {
    const template = WORKFLOW_TEMPLATES[templateKey];
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    handleCloseTemplateMenu();
    
    setNotification({
      open: true,
      message: `Template "${template.name}" loaded successfully`,
      severity: 'success',
    });
  };
  
  const handleSaveWorkflow = () => {
    setSaveDialogOpen(true);
  };
  
  const handleSaveConfirm = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
    setSaveDialogOpen(false);
    
    setNotification({
      open: true,
      message: 'Workflow saved successfully',
      severity: 'success',
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleZoomIn = () => {
    reactFlowInstance.zoomIn();
  };
  
  const handleZoomOut = () => {
    reactFlowInstance.zoomOut();
  };
  
  const handleFitView = () => {
    reactFlowInstance.fitView();
  };
  
  return (
    <WorkflowCanvasContainer ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls showInteractive={false} />
        
        {!readOnly && (
          <NodePalette>
            <Typography variant="subtitle2" gutterBottom>
              Node Palette
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <PaletteItem
              variant="outlined"
              size="small"
              onClick={() => handleAddNode(NODE_TYPES.communicationNode)}
              sx={{ borderColor: '#2196f3', color: '#2196f3' }}
            >
              Communication Node
            </PaletteItem>
            <PaletteItem
              variant="outlined"
              size="small"
              onClick={() => handleAddNode(NODE_TYPES.translationNode)}
              sx={{ borderColor: '#4caf50', color: '#4caf50' }}
            >
              Translation Node
            </PaletteItem>
            <PaletteItem
              variant="outlined"
              size="small"
              onClick={() => handleAddNode(NODE_TYPES.simetrikNode)}
              sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
            >
              Simetrik SaaS Node
            </PaletteItem>
            <PaletteItem
              variant="outlined"
              size="small"
              onClick={() => handleAddNode(NODE_TYPES.comparisonNode)}
              sx={{ borderColor: '#ff9800', color: '#ff9800' }}
            >
              Comparison Node
            </PaletteItem>
          </NodePalette>
        )}
        
        <CanvasControls>
          {!readOnly && (
            <>
              <Tooltip title="Add Node">
                <IconButton
                  color="primary"
                  onClick={handleOpenMenu}
                  sx={{ bgcolor: 'white', boxShadow: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              
              {selectedNode && (
                <Tooltip title="Delete Selected Node">
                  <IconButton
                    color="error"
                    onClick={handleDeleteNode}
                    sx={{ bgcolor: 'white', boxShadow: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Save Workflow">
                <IconButton
                  color="success"
                  onClick={handleSaveWorkflow}
                  sx={{ bgcolor: 'white', boxShadow: 1 }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Load Template">
                <IconButton
                  color="secondary"
                  onClick={handleOpenTemplateMenu}
                  sx={{ bgcolor: 'white', boxShadow: 1 }}
                >
                  <TemplateIcon />
                </IconButton>
              </Tooltip>
              
              <Divider sx={{ my: 1 }} />
            </>
          )}
          
          <Tooltip title="Zoom In">
            <IconButton
              onClick={handleZoomIn}
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out">
            <IconButton
              onClick={handleZoomOut}
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fit View">
            <IconButton
              onClick={handleFitView}
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
        </CanvasControls>
        
        <WorkflowInfo>
          <Typography variant="subtitle2">{workflowName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {workflowDescription}
          </Typography>
          
          {!validationResult.valid && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="warning" sx={{ py: 0, fontSize: '0.75rem' }}>
                {validationResult.errors[0]}
              </Alert>
            </Box>
          )}
        </WorkflowInfo>
      </ReactFlow>
      
      {/* Add Node Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleAddNode(NODE_TYPES.communicationNode)}>
          Communication Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode(NODE_TYPES.translationNode)}>
          Translation Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode(NODE_TYPES.simetrikNode)}>
          Simetrik SaaS Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode(NODE_TYPES.comparisonNode)}>
          Comparison Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode(NODE_TYPES.redNode)}>
          Red Node
        </MenuItem>
      </Menu>
      
      {/* Template Menu */}
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={handleCloseTemplateMenu}
      >
        <MenuItem onClick={() => handleLoadTemplate('basic')}>
          Basic Workflow
        </MenuItem>
        <MenuItem onClick={() => handleLoadTemplate('advanced')}>
          Advanced Workflow
        </MenuItem>
        <MenuItem onClick={() => handleLoadTemplate('translationWorkflow')}>
          Document Translation Workflow
        </MenuItem>
      </Menu>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity as 'success' | 'info' | 'warning' | 'error'}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </WorkflowCanvasContainer>
  );
};

// Wrap with ReactFlowProvider for use outside of a ReactFlow context
const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWithProvider;
