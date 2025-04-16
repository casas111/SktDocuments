import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  IconButton,
  TextField,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  AccountTree as WorkflowIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// This is a placeholder Workflows page that would be connected to the backend API
const Workflows = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Dialog states
  const [newWorkflowDialog, setNewWorkflowDialog] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  
  // Menu states
  const [workflowMenuAnchor, setWorkflowMenuAnchor] = useState(null);
  const [workflowMenuTarget, setWorkflowMenuTarget] = useState(null);
  
  // Simulate loading data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // In a real implementation, this would call the backend API
      setTimeout(() => {
        setWorkflows([
          { 
            id: 'wf1', 
            name: 'Monthly Reconciliation', 
            description: 'Automated workflow for monthly financial reconciliation',
            nodeCount: 4,
            status: 'active',
            lastRun: '2025-04-15T11:20:00Z',
            createdAt: '2025-03-10T09:00:00Z',
            updatedAt: '2025-04-15T11:20:00Z'
          },
          { 
            id: 'wf2', 
            name: 'Invoice Processing', 
            description: 'Extract data from invoices and validate against records',
            nodeCount: 3,
            status: 'active',
            lastRun: '2025-04-14T09:30:00Z',
            createdAt: '2025-03-15T14:30:00Z',
            updatedAt: '2025-04-14T09:30:00Z'
          },
          { 
            id: 'wf3', 
            name: 'Data Validation', 
            description: 'Validate data integrity across multiple sources',
            nodeCount: 5,
            status: 'draft',
            lastRun: null,
            createdAt: '2025-04-01T16:45:00Z',
            updatedAt: '2025-04-10T16:45:00Z'
          },
          { 
            id: 'wf4', 
            name: 'Customer Onboarding', 
            description: 'Process new customer documentation and setup',
            nodeCount: 6,
            status: 'active',
            lastRun: '2025-04-05T10:15:00Z',
            createdAt: '2025-02-20T11:30:00Z',
            updatedAt: '2025-04-05T10:15:00Z'
          },
          { 
            id: 'wf5', 
            name: 'Compliance Check', 
            description: 'Verify documents against compliance requirements',
            nodeCount: 4,
            status: 'inactive',
            lastRun: '2025-03-20T14:45:00Z',
            createdAt: '2025-01-15T09:20:00Z',
            updatedAt: '2025-03-20T14:45:00Z'
          }
        ]);
        
        setLoading(false);
      }, 800);
    };
    
    fetchData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter workflows based on tab
  const filteredWorkflows = workflows.filter(workflow => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return workflow.status === 'active';
    if (tabValue === 2) return workflow.status === 'draft';
    if (tabValue === 3) return workflow.status === 'inactive';
    return true;
  });
  
  // Handle workflow click
  const handleWorkflowClick = (workflow) => {
    navigate(`/workflows/${workflow.id}`);
  };
  
  // Handle workflow menu open
  const handleWorkflowMenuOpen = (event, workflow) => {
    event.stopPropagation();
    setWorkflowMenuAnchor(event.currentTarget);
    setWorkflowMenuTarget(workflow);
  };
  
  // Handle workflow menu close
  const handleWorkflowMenuClose = () => {
    setWorkflowMenuAnchor(null);
    setWorkflowMenuTarget(null);
  };
  
  // Handle new workflow dialog open
  const handleNewWorkflowDialogOpen = () => {
    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setNewWorkflowDialog(true);
  };
  
  // Handle new workflow dialog close
  const handleNewWorkflowDialogClose = () => {
    setNewWorkflowDialog(false);
  };
  
  // Handle new workflow creation
  const handleCreateNewWorkflow = () => {
    if (!newWorkflowName.trim()) return;
    
    // In a real implementation, this would call the backend API
    const newWorkflow = {
      id: `wf${Date.now()}`,
      name: newWorkflowName,
      description: newWorkflowDescription,
      nodeCount: 0,
      status: 'draft',
      lastRun: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setWorkflows([...workflows, newWorkflow]);
    setNewWorkflowDialog(false);
    
    // Navigate to the new workflow editor
    navigate(`/workflows/${newWorkflow.id}`);
  };
  
  // Handle duplicate workflow
  const handleDuplicateWorkflow = () => {
    if (!workflowMenuTarget) return;
    
    // In a real implementation, this would call the backend API
    const duplicatedWorkflow = {
      ...workflowMenuTarget,
      id: `wf${Date.now()}`,
      name: `${workflowMenuTarget.name} (Copy)`,
      status: 'draft',
      lastRun: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setWorkflows([...workflows, duplicatedWorkflow]);
    handleWorkflowMenuClose();
  };
  
  // Handle delete workflow
  const handleDeleteWorkflow = () => {
    if (!workflowMenuTarget) return;
    
    // In a real implementation, this would call the backend API
    setWorkflows(workflows.filter(wf => wf.id !== workflowMenuTarget.id));
    handleWorkflowMenuClose();
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Workflows
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewWorkflowDialogOpen}
        >
          New Workflow
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Draft" />
          <Tab label="Inactive" />
        </Tabs>
      </Paper>
      
      {filteredWorkflows.length > 0 ? (
        <Grid container spacing={3}>
          {filteredWorkflows.map((workflow) => (
            <Grid item xs={12} sm={6} md={4} key={workflow.id}>
              <Card 
                className="document-card"
                onClick={() => handleWorkflowClick(workflow)}
                sx={{ cursor: 'pointer', height: '100%' }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkflowIcon sx={{ color: 'secondary.main', mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {workflow.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleWorkflowMenuOpen(e, workflow)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {workflow.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Nodes: {workflow.nodeCount}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: workflow.status === 'active' ? 'success.main' : 
                                 workflow.status === 'draft' ? 'info.main' : 'text.disabled',
                          fontWeight: 'medium'
                        }}
                      >
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last run: {formatDate(workflow.lastRun)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Updated: {formatDate(workflow.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No workflows found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleNewWorkflowDialogOpen}
            sx={{ mt: 2 }}
          >
            Create Your First Workflow
          </Button>
        </Paper>
      )}
      
      {/* Workflow Menu */}
      <Menu
        anchorEl={workflowMenuAnchor}
        open={Boolean(workflowMenuAnchor)}
        onClose={handleWorkflowMenuClose}
      >
        <MenuItem onClick={() => {
          handleWorkflowMenuClose();
          if (workflowMenuTarget) {
            navigate(`/workflows/${workflowMenuTarget.id}`);
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateWorkflow}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {workflowMenuTarget?.status === 'active' && (
          <MenuItem onClick={handleWorkflowMenuClose}>
            <ListItemIcon>
              <PlayIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Run</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteWorkflow}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* New Workflow Dialog */}
      <Dialog open={newWorkflowDialog} onClose={handleNewWorkflowDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            type="text"
            fullWidth
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newWorkflowDescription}
            onChange={(e) => setNewWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewWorkflowDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateNewWorkflow} 
            variant="contained"
            disabled={!newWorkflowName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workflows;
