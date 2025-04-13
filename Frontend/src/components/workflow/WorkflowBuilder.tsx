import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Node, Edge, XYPosition } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Button, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudIcon from '@mui/icons-material/Cloud';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import styled from 'styled-components';
import { NODE_TYPES, getNodeDefaults } from '../nodes/NodeRegistry';
import WorkflowCanvas from './WorkflowCanvas';
import { createWorkflow, updateWorkflow, getWorkflow, listWorkflows } from '../../services/api';
import { Process } from '../../types/process';
import { TransformationNodeData } from '../transformation/types';
import { BaseNodeData, WorkflowNode } from './types';
import TransformationNodeForm from '../transformation/TransformationNodeForm';
import { TransformationNodeFormData } from '../transformation/TransformationNodeForm';

// Props interface for WorkflowBuilder
interface WorkflowBuilderProps {
  onNodesChange?: (nodes: WorkflowNode[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  workflowId?: string;
}

// API response types
interface ApiWorkflow {
  id: string;
  name: string;
  description: string;
  processes: Process[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiWorkflowList {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow data interface
interface WorkflowData {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: Edge[];
}

// Conversion functions
const convertApiToWorkflowData = (apiWorkflow: ApiWorkflow): WorkflowData => {
  // Convert processes to nodes and edges
  const nodes: WorkflowNode[] = apiWorkflow.processes.map(process => ({
    id: process.id,
    type: process.type || 'default',
    position: { x: 0, y: 0 }, // Default position, will be updated by layout
    data: {
      label: process.metadata.description,
      description: process.metadata.description,
      icon: '',
      capabilities: []
    } as BaseNodeData
  }));

  // Create edges based on process dependencies
  const edges: Edge[] = [];
  // TODO: Implement edge creation based on process dependencies

  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    description: apiWorkflow.description,
    nodes,
    edges,
    createdAt: apiWorkflow.createdAt,
    updatedAt: apiWorkflow.updatedAt
  };
};

const convertWorkflowDataToApi = (workflowData: WorkflowData): Omit<ApiWorkflow, 'id' | 'createdAt' | 'updatedAt'> => {
  const processes: Process[] = workflowData.nodes.map(node => ({
    id: node.id,
    documentId: '', // This will be set when a document is actually processed
    type: node.type || '',
    status: 'pending',
    startTime: new Date(),
    endTime: null,
    progress: 0,
    error: null,
    metadata: {
      nodeId: node.id,
      nodeType: node.type || '',
      description: node.data.description || ''
    }
  }));

  return {
    name: workflowData.name,
    description: workflowData.description || '',
    processes
  };
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onNodesChange, onEdgesChange, workflowId }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [currentNodeType, setCurrentNodeType] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [communicationMode, setCommunicationMode] = useState<'send' | 'write'>('send');
  const [loading, setLoading] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowData[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | undefined>(workflowId);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const nodeIdCounter = useRef(1);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Load workflow if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  // Load workflow from localStorage on component mount
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('currentWorkflow');
    if (savedWorkflow && !workflowId) {
      try {
        const parsedWorkflow = JSON.parse(savedWorkflow);
        setNodes(parsedWorkflow.nodes || []);
        setEdges(parsedWorkflow.edges || []);
        setWorkflowName(parsedWorkflow.name || 'Untitled Workflow');
        setCurrentWorkflowId(parsedWorkflow.id);
        
        // Update node counter to be higher than any existing node id
        const highestId = Math.max(
          ...parsedWorkflow.nodes.map((node: Node) => {
            const idParts = node.id.split('-');
            return parseInt(idParts[idParts.length - 1]) || 0;
          }),
          0
        );
        nodeIdCounter.current = highestId + 1;
        
        showNotification('Workflow loaded from local storage', 'info');
      } catch (error) {
        console.error('Error loading workflow from localStorage:', error);
        showNotification('Error loading saved workflow', 'error');
      }
    }
  }, []);

  // Auto-save workflow to localStorage when nodes or edges change
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      // Save all nodes regardless of whether they are connected
      const workflowData = {
        id: currentWorkflowId,
        name: workflowName || 'Untitled Workflow',
        nodes,
        edges,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('currentWorkflow', JSON.stringify(workflowData));
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [nodes, edges, workflowName, currentWorkflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      setLoading(true);
      const response = await getWorkflow(id);
      if (response.success && response.data) {
        const workflowData = convertApiToWorkflowData(response.data);
        const workflowNodes: WorkflowNode[] = workflowData.nodes.map(node => {
          const baseData = node.data as BaseNodeData;
          return {
            ...node,
            type: node.type || 'default',
            data: {
              ...baseData,
              icon: baseData.icon || '',
              capabilities: baseData.capabilities || []
            } as BaseNodeData
          };
        });
        setNodes(workflowNodes);
        setEdges(workflowData.edges);
        setWorkflowName(workflowData.name);
        setCurrentWorkflowId(id);
        setSuccess('Workflow loaded successfully');
      } else {
        setError(response.error || 'Failed to load workflow');
      }
    } catch (error) {
      setError('Error loading workflow');
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedWorkflows = async () => {
    setLoading(true);
    try {
      const response = await listWorkflows();
      if (response.success && response.data) {
        // Convert API workflow list to WorkflowData format
        const workflows = response.data.map((apiWorkflow: ApiWorkflowList) => ({
          id: apiWorkflow.id,
          name: apiWorkflow.name,
          description: apiWorkflow.description,
          nodes: [], // We'll load these when the workflow is selected
          edges: [], // We'll load these when the workflow is selected
          createdAt: apiWorkflow.createdAt,
          updatedAt: apiWorkflow.updatedAt
        }));
        setSavedWorkflows(workflows);
      } else {
        showNotification('Failed to load saved workflows', 'error');
      }
    } catch (error) {
      console.error('Error loading saved workflows:', error);
      showNotification('Error loading saved workflows', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = (type: string) => {
    const newNode: WorkflowNode = {
      id: `node-${nodeIdCounter.current++}`,
      type: type || 'default',
      position: { x: 100, y: 100 },
      data: {
        label: type,
        description: '',
        icon: '',
        capabilities: []
      } as BaseNodeData
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  };

  const handleCreateNode = () => {
    if (!currentNodeType) {
      setError('Please select a node type');
      return;
    }

    const newNode: WorkflowNode = {
      id: `node-${nodeIdCounter.current++}`,
      type: currentNodeType,
      position: { x: 100, y: 100 },
      data: {
        label: nodeName || currentNodeType,
        description: '',
        icon: '',
        capabilities: []
      } as BaseNodeData
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    setNodeName('');
    setCurrentNodeType('');
    setIsDialogOpen(false);
  };

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    const updatedEdges = edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
    
    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
  }, [nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange]);

  const handleClearWorkflow = () => {
    if (window.confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes([]);
      setEdges([]);
      if (onNodesChange) {
        onNodesChange([]);
      }
      if (onEdgesChange) {
        onEdgesChange([]);
      }
      nodeIdCounter.current = 1;
      
      // Clear from localStorage
      localStorage.removeItem('currentWorkflow');
      setCurrentWorkflowId(undefined);
      setWorkflowName('');
      
      showNotification('Workflow cleared', 'info');
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      setError('Workflow name is required');
      return;
    }
    
    setLoading(true);
    try {
      const workflowData: WorkflowData = {
        id: currentWorkflowId || '',
        name: workflowName,
        description: '',
        nodes,
        edges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const apiWorkflowData = convertWorkflowDataToApi(workflowData);

      let response;
      if (currentWorkflowId) {
        // Update existing workflow
        response = await updateWorkflow(currentWorkflowId, apiWorkflowData);
      } else {
        // Create new workflow
        response = await createWorkflow(apiWorkflowData);
      }
      
      if (response.success && response.data) {
        setCurrentWorkflowId(response.data.id);
        setSuccess('Workflow saved successfully');
        // Refresh the list of workflows
        await loadSavedWorkflows();
      } else {
        setError(response.error || 'Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      setError('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleExportWorkflow = () => {
    const workflowData = {
      name: workflowName || 'Untitled Workflow',
      nodes,
      edges,
    };
    
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflowName || 'workflow'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Workflow exported successfully', 'success');
  };

  const handleImportWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedWorkflow = JSON.parse(content);
        
        if (importedWorkflow.nodes && importedWorkflow.edges) {
          setNodes(importedWorkflow.nodes);
          setEdges(importedWorkflow.edges);
          setWorkflowName(importedWorkflow.name || 'Imported Workflow');
          
          // Update node counter to be higher than any existing node id
          const highestId = Math.max(
            ...importedWorkflow.nodes.map((node: Node) => {
              const idParts = node.id.split('-');
              return parseInt(idParts[idParts.length - 1]) || 0;
            }),
            0
          );
          nodeIdCounter.current = highestId + 1;
          
          // Save to localStorage
          localStorage.setItem('currentWorkflow', JSON.stringify({
            name: importedWorkflow.name || 'Imported Workflow',
            nodes: importedWorkflow.nodes,
            edges: importedWorkflow.edges,
            lastSaved: new Date().toISOString()
          }));
          
          showNotification('Workflow imported successfully', 'success');
        } else {
          showNotification('Invalid workflow file format', 'error');
        }
      } catch (error) {
        console.error('Error importing workflow:', error);
        showNotification('Error importing workflow', 'error');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    fileInput.value = '';
  };

  const handleLoadWorkflow = () => {
    if (!selectedWorkflowId) {
      showNotification('Please select a workflow to load', 'warning');
      return;
    }
    
    loadWorkflow(selectedWorkflowId);
    setIsLoadDialogOpen(false);
  };

  const handleNodesChange = (newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    if (onNodesChange) {
      onNodesChange(newNodes);
    }
  };

  const handleEdgesChange = (newEdges: Edge[]) => {
    setEdges(newEdges);
    if (onEdgesChange) {
      onEdgesChange(newEdges);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            error={!workflowName.trim() && isSaveDialogOpen}
            helperText={!workflowName.trim() && isSaveDialogOpen ? 'Workflow name is required' : ''}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveWorkflow}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setIsLoadDialogOpen(true)}
              disabled={loading}
            >
              Load
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleExportWorkflow}
              disabled={nodes.length === 0 || loading}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              component="label"
              disabled={loading}
            >
              Import
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportWorkflow}
              />
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearWorkflow}
              disabled={nodes.length === 0 || loading}
            >
              Clear
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Add Communication Node">
            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              onClick={() => handleAddNode('communication')}
            >
              Communication
            </Button>
          </Tooltip>
          
          <Tooltip title="Add Transformation Node">
            <Button
              variant="contained"
              startIcon={<TranslateIcon />}
              onClick={() => handleAddNode('transformation')}
            >
              Transformation
            </Button>
          </Tooltip>
          
          <Tooltip title="Add Simetrik Node">
            <Button
              variant="contained"
              startIcon={<CloudIcon />}
              onClick={() => handleAddNode('simetrik')}
            >
              Simetrik
            </Button>
          </Tooltip>
          
          <Tooltip title="Add Custom Node">
            <Button
              variant="outlined"
              onClick={() => setIsDialogOpen(true)}
            >
              Custom Node
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onSave={handleSaveWorkflow}
            readOnly={false}
          />
        </ReactFlowProvider>
      </Box>
      
      {/* Add Node Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Add Custom Node</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 400 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Node Type</InputLabel>
              <Select
                value={currentNodeType}
                onChange={(e) => setCurrentNodeType(e.target.value)}
                label="Node Type"
              >
                <MenuItem value="communication">Communication Node</MenuItem>
                <MenuItem value="transformation">Transformation Node</MenuItem>
                <MenuItem value="simetrik">Simetrik Node</MenuItem>
                <MenuItem value="custom">Custom Node</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Node Name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNode} variant="contained">
            Add Node
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Load Workflow Dialog */}
      <Dialog open={isLoadDialogOpen} onClose={() => setIsLoadDialogOpen(false)}>
        <DialogTitle>Load Workflow</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 400 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Workflow</InputLabel>
                <Select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  label="Select Workflow"
                >
                  {savedWorkflows.map((workflow) => (
                    <MenuItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLoadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleLoadWorkflow} 
            variant="contained"
            disabled={!selectedWorkflowId || loading}
          >
            Load
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowBuilder;
