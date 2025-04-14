import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Node, 
  Edge, 
  Connection 
} from 'react-flow-renderer';
import { Add as AddIcon, Transform as TransformIcon, Compare as CompareIcon, Link as IntegrationIcon, Send as CommunicationIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectCurrentWorkflow } from '../../store/slices/workflowsSlice';

// Custom node types will be implemented in separate components
const nodeTypes = {};

const WorkflowsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentWorkflow = useAppSelector(selectCurrentWorkflow);
  
  // State for workflow elements
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // State for node creation dialog
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeInstruction, setNodeInstruction] = useState('');
  
  // State for workflow creation dialog
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  
  // State for toolbar position
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });

  const handleCreateWorkflow = () => {
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowDialogClose = () => {
    setWorkflowDialogOpen(false);
    setWorkflowName('');
    setWorkflowDescription('');
  };

  const handleWorkflowDialogSubmit = () => {
    // This will be implemented when backend is ready
    console.log('Creating workflow:', workflowName, workflowDescription);
    handleWorkflowDialogClose();
  };

  const handleOpenNodeDialog = (type: string) => {
    setNodeType(type);
    setNodeDialogOpen(true);
  };

  const handleNodeDialogClose = () => {
    setNodeDialogOpen(false);
    setNodeType(null);
    setNodeName('');
    setNodeInstruction('');
  };

  const handleNodeDialogSubmit = () => {
    // This will be implemented when backend is ready
    console.log('Creating node:', nodeType, nodeName, nodeInstruction);
    
    // Add a placeholder node to the canvas
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType as string,
      position: { x: 250, y: 250 },
      data: { 
        label: nodeName,
        instruction: nodeInstruction,
        config: {}
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    handleNodeDialogClose();
  };

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {currentWorkflow ? currentWorkflow.name : 'Workflows'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateWorkflow}
        >
          New Workflow
        </Button>
      </Box>

      {/* Workflow Canvas */}
      <Paper 
        elevation={3} 
        sx={{ 
          height: 'calc(100% - 60px)', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.type === 'transformation') return '#0F4C81';
              if (n.type === 'comparison') return '#FF9800';
              if (n.type === 'simetrik_integration') return '#4CAF50';
              if (n.type === 'communication') return '#F44336';
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.type === 'transformation') return '#0F4C81';
              if (n.type === 'comparison') return '#FF9800';
              if (n.type === 'simetrik_integration') return '#4CAF50';
              if (n.type === 'communication') return '#F44336';
              return '#fff';
            }}
            nodeBorderRadius={2}
          />
          <Background color="#aaa" gap={16} />
        </ReactFlow>

        {/* Node Creation Toolbar */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: toolbarPosition.y,
            left: toolbarPosition.x,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 10,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>Add Node</Typography>
          <IconButton 
            color="primary" 
            onClick={() => handleOpenNodeDialog('transformation')}
            title="Transformation Node"
          >
            <TransformIcon />
          </IconButton>
          <IconButton 
            color="secondary" 
            onClick={() => handleOpenNodeDialog('comparison')}
            title="Comparison Node"
          >
            <CompareIcon />
          </IconButton>
          <IconButton 
            sx={{ color: 'success.main' }} 
            onClick={() => handleOpenNodeDialog('simetrik_integration')}
            title="Simetrik Integration Node"
          >
            <IntegrationIcon />
          </IconButton>
          <IconButton 
            sx={{ color: 'error.main' }} 
            onClick={() => handleOpenNodeDialog('communication')}
            title="Communication Node"
          >
            <CommunicationIcon />
          </IconButton>
        </Paper>
      </Paper>

      {/* Create Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={handleWorkflowDialogClose}>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Workflow Name"
            type="text"
            fullWidth
            variant="outlined"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWorkflowDialogClose}>Cancel</Button>
          <Button onClick={handleWorkflowDialogSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Node Dialog */}
      <Dialog open={nodeDialogOpen} onClose={handleNodeDialogClose}>
        <DialogTitle>
          {nodeType === 'transformation' && 'Create Transformation Node'}
          {nodeType === 'comparison' && 'Create Comparison Node'}
          {nodeType === 'simetrik_integration' && 'Create Simetrik Integration Node'}
          {nodeType === 'communication' && 'Create Communication Node'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="nodeName"
            label="Node Name"
            type="text"
            fullWidth
            variant="outlined"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="instruction"
            label="Instruction"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={nodeInstruction}
            onChange={(e) => setNodeInstruction(e.target.value)}
          />
          {nodeType === 'transformation' && (
            <TextField
              margin="dense"
              id="outputTemplate"
              label="Output Template URL"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNodeDialogClose}>Cancel</Button>
          <Button onClick={handleNodeDialogSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowsPage;
