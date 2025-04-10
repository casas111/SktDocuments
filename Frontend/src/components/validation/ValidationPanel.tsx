import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Collapse,
  Stack
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { styled } from '@mui/material/styles';
import { validateWorkflow } from '../nodes/NodeRegistry';

const ValidationItem = styled(ListItem)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: '0 4px 4px 0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  '&.error': {
    borderLeftColor: theme.palette.error.main,
  },
  '&.warning': {
    borderLeftColor: theme.palette.warning.main,
  },
  '&.info': {
    borderLeftColor: theme.palette.info.main,
  },
  '&.success': {
    borderLeftColor: theme.palette.success.main,
  },
}));

interface ValidationProps {
  nodes: any[];
  edges: any[];
  onFixIssue?: (issueType: string, nodeId?: string) => void;
}

const ValidationPanel: React.FC<ValidationProps> = ({ nodes, edges, onFixIssue }) => {
  const [expanded, setExpanded] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleOpenDetails = () => {
    // Run validation
    const results = validateWorkflow(nodes, edges);
    setValidationResults(results);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Custom validation rules beyond the basic ones in NodeRegistry
  const runCustomValidation = () => {
    const issues = [];
    
    // Check for nodes without names
    const nodesWithoutNames = nodes.filter(node => 
      !node.data?.label || node.data.label.trim() === ''
    );
    
    if (nodesWithoutNames.length > 0) {
      issues.push({
        type: 'warning',
        message: `${nodesWithoutNames.length} node(s) without proper names`,
        details: 'Nodes should have descriptive names for better workflow clarity',
        nodeIds: nodesWithoutNames.map((n: any) => n.id)
      });
    }
    
    // Check for potential bottlenecks (nodes with multiple incoming connections)
    const potentialBottlenecks = nodes.filter(node => {
      const incomingConnections = edges.filter(edge => edge.target === node.id);
      return incomingConnections.length > 2;
    });
    
    if (potentialBottlenecks.length > 0) {
      issues.push({
        type: 'info',
        message: `${potentialBottlenecks.length} potential bottleneck(s) detected`,
        details: 'Nodes with many incoming connections may create processing bottlenecks',
        nodeIds: potentialBottlenecks.map((n: any) => n.id)
      });
    }
    
    // Check for isolated node groups
    const connectedGroups = findConnectedGroups(nodes, edges);
    if (connectedGroups.length > 1 && nodes.length > 0) {
      issues.push({
        type: 'warning',
        message: `${connectedGroups.length} disconnected workflow groups detected`,
        details: 'Your workflow contains multiple disconnected groups of nodes',
        nodeIds: []
      });
    }
    
    return issues;
  };
  
  // Helper function to find connected groups in the workflow
  const findConnectedGroups = (nodes: any[], edges: any[]) => {
    if (nodes.length === 0) return [];
    
    const nodeMap = new Map();
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        connections: [],
        visited: false
      });
    });
    
    // Build connection map
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (sourceNode) {
        sourceNode.connections.push(edge.target);
      }
      
      if (targetNode) {
        targetNode.connections.push(edge.source);
      }
    });
    
    // DFS to find connected components
    const groups: string[][] = [];
    
    const dfs = (nodeId: string, group: string[]) => {
      const node = nodeMap.get(nodeId);
      if (!node || node.visited) return;
      
      node.visited = true;
      group.push(nodeId);
      
      node.connections.forEach((connectedId: string) => {
        dfs(connectedId, group);
      });
    };
    
    // Find all connected components
    nodes.forEach(node => {
      if (!nodeMap.get(node.id).visited) {
        const group: string[] = [];
        dfs(node.id, group);
        if (group.length > 0) {
          groups.push(group);
        }
      }
    });
    
    return groups;
  };
  
  // Run basic validation from NodeRegistry
  const basicValidation = validateWorkflow(nodes, edges);
  
  // Run custom validation
  const customIssues = runCustomValidation();
  
  // Combine all validation results
  const allIssues = [
    ...(!basicValidation.valid ? basicValidation.errors.map((error: string) => ({
      type: 'error',
      message: error,
      details: error,
      nodeIds: []
    })) : []),
    ...customIssues
  ];
  
  // Determine overall validation status
  const hasErrors = allIssues.some(issue => issue.type === 'error');
  const hasWarnings = allIssues.some(issue => issue.type === 'warning');
  
  let validationStatus = 'success';
  let statusMessage = 'Workflow validation passed';
  
  if (hasErrors) {
    validationStatus = 'error';
    statusMessage = 'Workflow validation failed';
  } else if (hasWarnings) {
    validationStatus = 'warning';
    statusMessage = 'Workflow has warnings';
  } else if (allIssues.length > 0) {
    validationStatus = 'info';
    statusMessage = 'Workflow has suggestions';
  }
  
  // If no nodes, show a different message
  if (nodes.length === 0) {
    validationStatus = 'info';
    statusMessage = 'Add nodes to validate workflow';
  }
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ mb: 3 }}>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="h2">
              Workflow Validation
            </Typography>
            <Chip 
              label={nodes.length > 0 ? `${allIssues.length} issue(s)` : 'No nodes'}
              color={validationStatus as any}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
          <IconButton onClick={toggleExpanded} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          <Alert 
            severity={validationStatus as any}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleOpenDetails}
                disabled={nodes.length === 0}
              >
                View Details
              </Button>
            }
          >
            <AlertTitle>{statusMessage}</AlertTitle>
            {nodes.length === 0 ? (
              'Start by adding nodes to your workflow'
            ) : (
              allIssues.length === 0 ? 
                'Your workflow looks good and follows best practices' : 
                `Found ${allIssues.length} issue(s) that may need attention`
            )}
          </Alert>
          
          {allIssues.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Top Issues:
              </Typography>
              <List dense>
                {allIssues.slice(0, 2).map((issue, index) => (
                  <ValidationItem key={index} className={issue.type}>
                    <ListItemIcon>
                      {issue.type === 'error' && <ErrorOutlineIcon color="error" />}
                      {issue.type === 'warning' && <WarningAmberIcon color="warning" />}
                      {issue.type === 'info' && <InfoIcon color="info" />}
                      {issue.type === 'success' && <CheckCircleOutlineIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                    />
                    {issue.nodeIds && issue.nodeIds.length > 0 && onFixIssue && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color={issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warning' : 'primary'}
                        onClick={() => onFixIssue(issue.type, issue.nodeIds[0])}
                      >
                        Fix
                      </Button>
                    )}
                  </ValidationItem>
                ))}
                {allIssues.length > 2 && (
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={handleOpenDetails}
                    startIcon={<ExpandMoreIcon />}
                    sx={{ mt: 1 }}
                  >
                    Show All Issues
                  </Button>
                )}
              </List>
            </Box>
          )}
        </Collapse>
      </Box>
      
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Workflow Validation Results
            <IconButton onClick={handleCloseDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {allIssues.length === 0 ? (
            <Alert severity="success">
              <AlertTitle>All Validation Checks Passed</AlertTitle>
              Your workflow follows all best practices and has no issues.
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Found {allIssues.length} issue(s) in your workflow
              </Typography>
              <List>
                {allIssues.map((issue, index) => (
                  <ValidationItem key={index} className={issue.type}>
                    <ListItemIcon>
                      {issue.type === 'error' && <ErrorOutlineIcon color="error" />}
                      {issue.type === 'warning' && <WarningAmberIcon color="warning" />}
                      {issue.type === 'info' && <InfoIcon color="info" />}
                      {issue.type === 'success' && <CheckCircleOutlineIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      secondary={issue.details}
                    />
                    {issue.nodeIds && issue.nodeIds.length > 0 && onFixIssue && (
                      <Tooltip title="Focus on this issue">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color={issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warning' : 'primary'}
                          onClick={() => {
                            onFixIssue(issue.type, issue.nodeIds[0]);
                            handleCloseDetails();
                          }}
                        >
                          Fix
                        </Button>
                      </Tooltip>
                    )}
                  </ValidationItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {allIssues.length > 0 && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCloseDetails}
            >
              Acknowledge Issues
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ValidationPanel;
