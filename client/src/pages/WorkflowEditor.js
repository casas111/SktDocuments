import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Publish as PublishIcon,
  GetApp as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

// Custom node types
import TransformationNode from '../components/nodes/TransformationNode';
import ComparisonNode from '../components/nodes/ComparisonNode';
import SimetrikIntegrationNode from '../components/nodes/SimetrikIntegrationNode';
import CommunicationNode from '../components/nodes/CommunicationNode';

// Node type components mapping
const nodeTypes = {
  transformation: TransformationNode,
  comparison: ComparisonNode,
  simetrik_integration: SimetrikIntegrationNode,
  communication: CommunicationNode
};

const WorkflowEditor = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    getWorkflowById, 
    updateWorkflow, 
    executeWorkflow,
    getNodesByWorkflow,
    getEdgesByWorkflow,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    error, 
    setError 
  } = useApp();

  // Local state
  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('draft');
  const [addNodeMenuAnchorEl, setAddNodeMenuAnchorEl] = useState(null);
  const [nodeConfigOpen, setNodeConfigOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Fetch workflow data
  useEffect(() => {
    const fetchWorkflowData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, these would be API calls
        // For this demo, we'll simulate the data loading with setTimeout
        setTimeout(() => {
          const workflowData = {
            id: 'wf1',
            name: 'Monthly Reconciliation',
            description: 'Automated workflow for monthly financial reconciliation',
            status: 'active',
            createdAt: '2025-03-10T09:00:00Z',
            updatedAt: '2025-04-15T11:20:00Z'
          };
          
          const nodesData = [
            { 
              id: 'node1', 
              type: 'transformation',
              position: { x: 250, y: 100 }, 
              data: { 
                label: 'Extract Data',
                nodeType: 'transformation',
                config: {
                  template: 'Extract all financial data from the document and format as JSON'
                }
              }
            },
            { 
              id: 'node2', 
              type: 'transformation',
              position: { x: 250, y: 250 }, 
              data: { 
                label: 'Normalize Data',
                nodeType: 'transformation',
                config: {
                  template: 'Normalize all currency values to USD'
                }
              }
            },
            { 
              id: 'node3', 
              type: 'comparison',
              position: { x: 250, y: 400 }, 
              data: { 
                label: 'Compare Reports',
                nodeType: 'comparison',
                config: {
                  instruction: 'Compare the financial data and identify discrepancies'
                }
              }
            },
            { 
              id: 'node4', 
              type: 'communication',
              position: { x: 250, y: 550 }, 
              data: { 
                label: 'Send Report',
                nodeType: 'communication',
                config: {
                  method: 'email',
                  recipients: ['finance@example.com'],
                  subject: 'Monthly Reconciliation Report'
                }
              }
            }
          ];
          
          const edgesData = [
            { id: 'edge1-2', source: 'node1', target: 'node2' },
            { id: 'edge2-3', source: 'node2', target: 'node3' },
            { id: 'edge3-4', source: 'node3', target: 'node4' }
          ];
          
          setWorkflow(workflowData);
          setWorkflowName(workflowData.name);
          setWorkflowDescription(workflowData.description);
          setWorkflowStatus(workflowData.status);
          setNodes(nodesData);
          setEdges(edgesData);
          setIsLoading(false);
          setSaveStatus('saved');
        }, 1000);
      } catch (err) {
        setError('Failed to load workflow');
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, [id, setError]);

  // Handle node changes
  const onNodesChange = (changes) => {
    setNodes(changes);
    setSaveStatus('unsaved');
  };

  // Handle edge changes
  const onEdgesChange = (changes) => {
    setEdges(changes);
    setSaveStatus('unsaved');
  };

  // Handle connections
  const onConnect = (params) => {
    setEdges((eds) => addEdge(params, eds));
    setSaveStatus('unsaved');
  };

  // Handle node click
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeConfigOpen(true);
  };

  // Handle add node menu open
  const handleAddNodeMenuOpen = (event) => {
    setAddNodeMenuAnchorEl(event.currentTarget);
  };

  // Handle add node menu close
  const handleAddNodeMenuClose = () => {
    setAddNodeMenuAnchorEl(null);
  };

  // Handle add node
  const handleAddNode = (nodeType) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position: { 
        x: 250, 
        y: nodes.length > 0 
          ? Math.max(...nodes.map(n => n.position.y)) + 150 
          : 100 
      },
      data: { 
        label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        nodeType: nodeType,
        config: {}
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSaveStatus('unsaved');
    handleAddNodeMenuClose();
  };

  // Handle node config close
  const handleNodeConfigClose = () => {
    setNodeConfigOpen(false);
    setSelectedNode(null);
  };

  // Handle node update
  const handleNodeUpdate = (nodeId, data) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } } 
          : node
      )
    );
    setSaveStatus('unsaved');
  };

  // Handle node delete
  const handleNodeDelete = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSaveStatus('unsaved');
    handleNodeConfigClose();
  };

  // Handle settings open
  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  // Handle settings close
  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Handle save workflow
  const handleSaveWorkflow = async () => {
    if (saveStatus === 'unsaved') {
      setIsSaving(true);
      setSaveStatus('saving');
      
      try {
        // In a real implementation, this would be an API call
        // For this demo, we'll simulate the save with setTimeout
        setTimeout(() => {
          setIsSaving(false);
          setSaveStatus('saved');
          setSnackbar({
            open: true,
            message: 'Workflow saved successfully',
            severity: 'success'
          });
        }, 1500);
      } catch (err) {
        setError('Failed to save workflow');
        setIsSaving(false);
        setSaveStatus('unsaved');
        setSnackbar({
          open: true,
          message: 'Failed to save workflow',
          severity: 'error'
        });
      }
    }
  };

  // Handle execute workflow
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    
    try {
      // In a real implementation, this would be an API call
      // For this demo, we'll simulate the execution with setTimeout
      setTimeout(() => {
        setIsExecuting(false);
        setSnackbar({
          open: true,
          message: 'Workflow execution started',
          severity: 'success'
        });
      }, 1500);
    } catch (err) {
      setError('Failed to execute workflow');
      setIsExecuting(false);
      setSnackbar({
        open: true,
        message: 'Failed to execute workflow',
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle workflow name change
  const handleWorkflowNameChange = (event) => {
    setWorkflowName(event.target.value);
    setSaveStatus('unsaved');
  };

  // Handle workflow description change
  const handleWorkflowDescriptionChange = (event) => {
    setWorkflowDescription(event.target.value);
    setSaveStatus('unsaved');
  };

  // Handle workflow status change
  const handleWorkflowStatusChange = (event) => {
    setWorkflowStatus(event.target.value);
    setSaveStatus('unsaved');
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        px: 2,
        py: 1,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" component="div">
          {isLoading ? 'Loading...' : workflowName}
        </Typography>
        <Box>
          <Tooltip title="Workflow Settings">
            <IconButton 
              onClick={handleSettingsOpen}
              sx={{ mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveWorkflow}
            disabled={saveStatus === 'saved' || isSaving}
            sx={{ mr: 1 }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: 'calc(100% - 48px)' }}>
          {/* Workflow canvas */}
          <Box sx={{ flexGrow: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              onInit={setReactFlowInstance}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
            
            {/* Add node button */}
            <Box sx={{ position: 'absolute', bottom: 20, right: 20 }}>
              <Tooltip title="Add Node">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddNodeMenuOpen}
                  sx={{ borderRadius: '50%', width: 56, height: 56, minWidth: 0 }}
                >
                  {!isMobile && 'Add Node'}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}

      {/* Add node menu */}
      <Menu
        anchorEl={addNodeMenuAnchorEl}
        open={Boolean(addNodeMenuAnchorEl)}
        onClose={handleAddNodeMenuClose}
      >
        <MenuItem onClick={() => handleAddNode('transformation')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Transformation Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('comparison')}>
          <ListItemIcon>
            <CompareIcon fontSize="small" />
          </ListItemIcon>
          Comparison Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('simetrik_integration')}>
          <ListItemIcon>
            <ApiIcon fontSize="small" />
          </ListItemIcon>
          Simetrik Integration Node
        </MenuItem>
        <MenuItem onClick={() => handleAddNode('communication')}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          Communication Node
        </MenuItem>
      </Menu>

      {/* Node configuration dialog */}
      <Dialog
        open={nodeConfigOpen}
        onClose={handleNodeConfigClose}
        maxWidth="md"
        fullWidth
      >
        {selectedNode && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Configure {selectedNode.data.label}
                </Typography>
                <IconButton onClick={handleNodeConfigClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Node Name"
                fullWidth
                value={selectedNode.data.label}
                onChange={(e) => handleNodeUpdate(selectedNode.id, { label: e.target.value })}
                margin="normal"
              />
              
              {/* Node type specific configuration */}
              {selectedNode.type === 'transformation' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Transformation Template
                  </Typography>
                  <TextField
                    label="Template"
                    fullWidth
                    multiline
                    rows={6}
                    value={selectedNode.data.config?.template || ''}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                      config: { ...selectedNode.data.config, template: e.target.value } 
                    })}
                    margin="normal"
                  />
                </Box>
              )}
              
              {selectedNode.type === 'comparison' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Comparison Instructions
                  </Typography>
                  <TextField
                    label="Instructions"
                    fullWidth
                    multiline
                    rows={6}
                    value={selectedNode.data.config?.instruction || ''}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                      config: { ...selectedNode.data.config, instruction: e.target.value } 
                    })}
                    margin="normal"
                  />
                </Box>
              )}
              
              {selectedNode.type === 'simetrik_integration' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Simetrik Integration Configuration
                  </Typography>
                  <TextField
                    label="Integration Type"
                    fullWidth
                    select
                    value={selectedNode.data.config?.integrationType || 'data_export'}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                      config: { ...selectedNode.data.config, integrationType: e.target.value } 
                    })}
                    margin="normal"
                  >
                    <MenuItem value="data_export">Data Export</MenuItem>
                    <MenuItem value="data_import">Data Import</MenuItem>
                    <MenuItem value="api_call">API Call</MenuItem>
                  </TextField>
                  <TextField
                    label="Endpoint"
                    fullWidth
                    value={selectedNode.data.config?.endpoint || ''}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                      config: { ...selectedNode.data.config, endpoint: e.target.value } 
                    })}
                    margin="normal"
                  />
                </Box>
              )}
              
              {selectedNode.type === 'communication' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Communication Configuration
                  </Typography>
                  <TextField
                    label="Method"
                    fullWidth
                    select
                    value={selectedNode.data.config?.method || 'email'}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                      config: { ...selectedNode.data.config, method: e.target.value } 
                    })}
                    margin="normal"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="webhook">Webhook</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                  </TextField>
                  {selectedNode.data.config?.method === 'email' && (
                    <>
                      <TextField
                        label="Recipients (comma separated)"
                        fullWidth
                        value={Array.isArray(selectedNode.data.config?.recipients) 
                          ? selectedNode.data.config.recipients.join(', ') 
                          : ''}
                        onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                          config: { 
                            ...selectedNode.data.config, 
                            recipients: e.target.value.split(',').map(r => r.trim()) 
                          } 
                        })}
                        margin="normal"
                      />
                      <TextField
                        label="Subject"
                        fullWidth
                        value={selectedNode.data.config?.subject || ''}
                        onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                          config: { ...selectedNode.data.config, subject: e.target.value } 
                        })}
                        margin="normal"
                      />
                    </>
                  )}
                  {selectedNode.data.config?.method === 'webhook' && (
                    <TextField
                      label="Webhook URL"
                      fullWidth
                      value={selectedNode.data.config?.webhookUrl || ''}
                      onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                        config: { ...selectedNode.data.config, webhookUrl: e.target.value } 
                      })}
                      margin="normal"
                    />
                  )}
                  {selectedNode.data.config?.method === 'api' && (
                    <>
                      <TextField
                        label="API Endpoint"
                        fullWidth
                        value={selectedNode.data.config?.apiEndpoint || ''}
                        onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                          config: { ...selectedNode.data.config, apiEndpoint: e.target.value } 
                        })}
                        margin="normal"
                      />
                      <TextField
                        label="API Method"
                        fullWidth
                        select
                        value={selectedNode.data.config?.apiMethod || 'POST'}
                        onChange={(e) => handleNodeUpdate(selectedNode.id, { 
                          config: { ...selectedNode.data.config, apiMethod: e.target.value } 
                        })}
                        margin="normal"
                      >
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                      </TextField>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => handleNodeDelete(selectedNode.id)}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete Node
              </Button>
              <Button 
                onClick={handleNodeConfigClose}
                variant="contained"
              >
                Done
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Workflow settings drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Workflow Settings
            </Typography>
            <IconButton onClick={handleSettingsClose} data-testid="CloseIcon">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            label="Workflow Name"
            fullWidth
            value={workflowName}
            onChange={handleWorkflowNameChange}
            margin="normal"
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={workflowDescription}
            onChange={handleWorkflowDescriptionChange}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={workflowStatus}
              onChange={handleWorkflowStatusChange}
              label="Status"
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Workflow Information
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {workflow ? new Date(workflow.createdAt).toLocaleString() : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Last Modified
              </Typography>
              <Typography variant="body2">
                {workflow ? new Date(workflow.updatedAt).toLocaleString() : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Nodes
              </Typography>
              <Typography variant="body2">
                {nodes.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Mock icons for the component to work
const CompareIcon = () => <span>Compare</span>;
const ApiIcon = () => <span>API</span>;
const EmailIcon = () => <span>Email</span>;
const FormControl = ({ children, ...props }) => <div {...props}>{children}</div>;
const InputLabel = ({ children }) => <label>{children}</label>;
const Select = ({ children, ...props }) => <select {...props}>{children}</select>;
const Drawer = ({ children, open, ...props }) => open ? <div {...props}>{children}</div> : null;

export default WorkflowEditor;
