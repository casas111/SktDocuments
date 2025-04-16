import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

// This is a placeholder DocumentViewer page that would be connected to the backend API
const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { processDocumentWithClaude, error, setError } = useApp();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processedContent, setProcessedContent] = useState('');
  const [instruction, setInstruction] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, this would call the backend API via the context
        // const response = await api.document.getDocumentById(id);
        // setDocument(response.data.document);
        
        // Simulated document data
        setTimeout(() => {
          setDocument({
            id,
            name: 'Financial Report Q1 2025.pdf',
            type: 'pdf',
            size: '2.4 MB',
            content: 'This is a sample financial report for Q1 2025. It contains financial data and analysis for the first quarter of the year 2025.',
            createdAt: '2025-04-15T10:30:00Z',
            updatedAt: '2025-04-15T10:30:00Z',
            labels: [
              { id: 'label1', name: 'Financial', color: '#1976d2' },
              { id: 'label2', name: 'Report', color: '#9c27b0' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id, setError]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle process document with Claude
  const handleProcessDocument = async () => {
    if (!instruction.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an instruction for processing',
        severity: 'error'
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      // In a real implementation, this would call the backend API via the context
      // const result = await processDocumentWithClaude(id, instruction);
      // setProcessedContent(result.result);
      
      // Simulated processing
      setTimeout(() => {
        setProcessedContent(`Processed content based on instruction: "${instruction}"\n\nAnalysis of the financial report for Q1 2025 shows strong performance in key metrics. Revenue increased by 15% compared to Q1 2024, with particularly strong growth in the technology and healthcare sectors. Operating expenses were well-controlled, resulting in a 20% increase in operating profit. The company maintains a strong cash position and is well-positioned for continued growth in the remainder of 2025.`);
        setProcessing(false);
        setSnackbar({
          open: true,
          message: 'Document processed successfully',
          severity: 'success'
        });
      }, 2000);
    } catch (err) {
      console.error('Error processing document:', err);
      setError('Failed to process document. Please try again.');
      setProcessing(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/documents')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {document?.name || 'Document Viewer'}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {/* Document metadata */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              {document?.type?.toUpperCase() || 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Size
            </Typography>
            <Typography variant="body1">
              {document?.size || 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1">
              {document?.createdAt ? formatDate(document.createdAt) : 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Updated
            </Typography>
            <Typography variant="body1">
              {document?.updatedAt ? formatDate(document.updatedAt) : 'Unknown'}
            </Typography>
          </Grid>
        </Grid>
        
        {document?.labels && document.labels.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LabelIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
                Labels:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {document.labels.map((label) => (
                  <Box 
                    key={label.id}
                    sx={{ 
                      bgcolor: `${label.color}20`, 
                      color: label.color,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {label.name}
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="View" />
          <Tab label="Process with Claude" />
        </Tabs>
      </Paper>
      
      {/* Tab content */}
      {tabValue === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {document?.content || 'No content available'}
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Process Document with Claude
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter instructions for Claude to process this document. For example, you can ask Claude to summarize the document, extract specific information, or analyze the content.
            </Typography>
            <TextField
              label="Instructions for Claude"
              multiline
              rows={4}
              fullWidth
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Summarize this document, Extract all financial metrics, Analyze the sentiment of this report"
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handleProcessDocument}
              disabled={processing || !instruction.trim()}
            >
              {processing ? 'Processing...' : 'Process Document'}
            </Button>
          </Paper>
          
          {(processing || processedContent) && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              {processing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    Processing document with Claude...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {processedContent}
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}
      
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

export default DocumentViewer;
