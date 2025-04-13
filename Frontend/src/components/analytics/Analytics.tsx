import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300,
  marginTop: theme.spacing(2),
}));

const nodeTypeData = [
  { name: 'Communication', value: 0, color: '#2196f3' },
  { name: 'Transformation', value: 0, color: '#4caf50' },
  { name: 'Simetrik SaaS', value: 0, color: '#9c27b0' },
  { name: 'Comparison', value: 0, color: '#ff9800' },
];

const connectionData = [
  { name: 'Direct', value: 0 },
  { name: 'Complex', value: 0 },
];

interface AnalyticsProps {
  nodes: any[];
  edges: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ nodes, edges }) => {
  const [nodeStats, setNodeStats] = useState(nodeTypeData);
  const [connectionStats, setConnectionStats] = useState(connectionData);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [reportName, setReportName] = useState('Workflow Analysis Report');
  
  useEffect(() => {
    // Calculate node type statistics
    const nodeCounts = {
      communicationNode: 0,
      transformationNode: 0,
      simetrikNode: 0,
      comparisonNode: 0,
    };
    
    nodes.forEach(node => {
      if (node.type && nodeCounts.hasOwnProperty(node.type)) {
        nodeCounts[node.type as keyof typeof nodeCounts]++;
      }
    });
    
    const updatedNodeStats = [
      { name: 'Communication', value: nodeCounts.communicationNode, color: '#2196f3' },
      { name: 'Transformation', value: nodeCounts.transformationNode, color: '#4caf50' },
      { name: 'Simetrik SaaS', value: nodeCounts.simetrikNode, color: '#9c27b0' },
      { name: 'Comparison', value: nodeCounts.comparisonNode, color: '#ff9800' },
    ];
    
    setNodeStats(updatedNodeStats);
    
    // Calculate connection statistics
    const directConnections = edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return sourceNode && targetNode;
    }).length;
    
    const complexConnections = edges.length - directConnections;
    
    setConnectionStats([
      { name: 'Direct', value: directConnections },
      { name: 'Complex', value: complexConnections },
    ]);
    
  }, [nodes, edges]);
  
  const handleOpenReportDialog = () => {
    setReportDialogOpen(true);
  };
  
  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
  };
  
  const handleGenerateReport = () => {
    // In a real application, this would generate and download a report
    console.log('Generating report:', reportName, 'of type:', reportType);
    setReportDialogOpen(false);
    
    // Simulate report generation
    alert(`Report "${reportName}" generated successfully!`);
  };
  
  const totalNodes = nodes.length;
  const totalConnections = edges.length;
  const completionPercentage = totalNodes > 0 ? Math.min(100, (totalConnections / totalNodes) * 100) : 0;
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Workflow Analytics
        </Typography>
        <Box>
          <Tooltip title="Refresh Analytics">
            <IconButton size="small" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Report">
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleOpenReportDialog}
              size="small"
            >
              Report
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Box flex={1}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Nodes
              </Typography>
              <Typography variant="h3" component="div">
                {totalNodes}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalNodes > 0 ? `${Math.round((nodeStats[0].value / totalNodes) * 100)}% Communication` : 'No nodes'}
              </Typography>
            </CardContent>
          </StyledCard>
        </Box>
        
        <Box flex={1}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Connections
              </Typography>
              <Typography variant="h3" component="div">
                {totalConnections}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalConnections > 0 ? `${Math.round((connectionStats[0].value / totalConnections) * 100)}% Direct` : 'No connections'}
              </Typography>
            </CardContent>
          </StyledCard>
        </Box>
        
        <Box flex={1}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Workflow Complexity
              </Typography>
              <Typography variant="h3" component="div">
                {totalNodes > 0 ? (totalConnections / totalNodes).toFixed(1) : '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connections per node
              </Typography>
            </CardContent>
          </StyledCard>
        </Box>
        
        <Box flex={1}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completion
              </Typography>
              <Typography variant="h3" component="div">
                {completionPercentage.toFixed(0)}%
              </Typography>
              <Box mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  color={completionPercentage < 50 ? "error" : completionPercentage < 80 ? "warning" : "success"}
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Stack>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box flex={1}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Node Distribution</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={nodeStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {nodeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Paper>
        </Box>
        
        <Box flex={1}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PieChartIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Node Type Distribution</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nodeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {nodeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Paper>
        </Box>
      </Stack>
      
      <Box mt={3}>
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <TimelineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Workflow Insights</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {totalNodes === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No nodes in workflow" 
                  secondary="Add nodes to see workflow insights" 
                />
              </ListItem>
            ) : (
              <>
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label={nodeStats.reduce((max, item) => item.value > max.value ? item : max, nodeStats[0]).name} 
                      color="primary" 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Most used node type" 
                    secondary="This node type is dominant in your workflow" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label={completionPercentage < 50 ? "Low" : completionPercentage < 80 ? "Medium" : "High"} 
                      color={completionPercentage < 50 ? "error" : completionPercentage < 80 ? "warning" : "success"} 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Workflow connectivity" 
                    secondary={completionPercentage < 50 
                      ? "Your workflow has low connectivity, consider adding more connections" 
                      : completionPercentage < 80 
                        ? "Your workflow has medium connectivity" 
                        : "Your workflow has high connectivity"
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Chip 
                      label={(totalConnections / totalNodes) < 1 ? "Simple" : (totalConnections / totalNodes) < 2 ? "Moderate" : "Complex"} 
                      color="secondary" 
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Workflow complexity" 
                    secondary={`Based on the ratio of connections (${totalConnections}) to nodes (${totalNodes})`} 
                  />
                </ListItem>
              </>
            )}
          </List>
        </Paper>
      </Box>
      
      <Dialog open={reportDialogOpen} onClose={handleCloseReportDialog}>
        <DialogTitle>Generate Analytics Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="report-name"
            label="Report Name"
            type="text"
            fullWidth
            variant="outlined"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type"
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="summary">Summary Report</MenuItem>
              <MenuItem value="detailed">Detailed Analysis</MenuItem>
              <MenuItem value="executive">Executive Dashboard</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained" color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analytics;
