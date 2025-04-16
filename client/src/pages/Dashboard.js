import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Description as DocumentIcon,
  AccountTree as WorkflowIcon,
  FolderOpen as FolderIcon,
  Label as LabelIcon
} from '@mui/icons-material';

// This is a placeholder dashboard that would be connected to the backend API
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    documents: 0,
    workflows: 0,
    folders: 0,
    labels: 0
  });
  
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  
  // Simulate loading data from API
  useEffect(() => {
    const fetchData = async () => {
      // In a real implementation, this would call the backend API
      setTimeout(() => {
        setStats({
          documents: 24,
          workflows: 5,
          folders: 8,
          labels: 12
        });
        
        setRecentDocuments([
          { id: 1, name: 'Financial Report Q1 2025', type: 'pdf', updatedAt: '2025-04-15T10:30:00Z' },
          { id: 2, name: 'Customer Reconciliation', type: 'xlsx', updatedAt: '2025-04-14T16:45:00Z' },
          { id: 3, name: 'Vendor Agreements', type: 'docx', updatedAt: '2025-04-13T09:15:00Z' },
          { id: 4, name: 'Transaction Log April', type: 'csv', updatedAt: '2025-04-12T14:20:00Z' }
        ]);
        
        setRecentWorkflows([
          { id: 1, name: 'Monthly Reconciliation', updatedAt: '2025-04-15T11:20:00Z', nodeCount: 4 },
          { id: 2, name: 'Invoice Processing', updatedAt: '2025-04-14T09:30:00Z', nodeCount: 3 },
          { id: 3, name: 'Data Validation', updatedAt: '2025-04-10T16:45:00Z', nodeCount: 5 }
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get icon for document type
  const getDocumentTypeIcon = (type) => {
    return <DocumentIcon />;
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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <DocumentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {stats.documents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Documents
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <WorkflowIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {stats.workflows}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Workflows
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <FolderIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {stats.folders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Folders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140 }}>
            <LabelIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {stats.labels}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Labels
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Documents */}
      <Typography variant="h5" gutterBottom>
        Recent Documents
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {recentDocuments.map((doc) => (
          <Grid item xs={12} sm={6} md={3} key={doc.id}>
            <Card className="document-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getDocumentTypeIcon(doc.type)}
                  <Typography variant="subtitle1" component="div" sx={{ ml: 1 }}>
                    {doc.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Type: {doc.type.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated: {formatDate(doc.updatedAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Recent Workflows */}
      <Typography variant="h5" gutterBottom>
        Recent Workflows
      </Typography>
      <Grid container spacing={2}>
        {recentWorkflows.map((workflow) => (
          <Grid item xs={12} sm={6} md={4} key={workflow.id}>
            <Card className="document-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkflowIcon sx={{ color: 'secondary.main' }} />
                  <Typography variant="subtitle1" component="div" sx={{ ml: 1 }}>
                    {workflow.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Nodes: {workflow.nodeCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated: {formatDate(workflow.updatedAt)}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                >
                  Open Workflow
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
