import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Description as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import unifiedDocumentService from '../../services/unifiedDocumentService';

// Styled components
const FileViewerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1200px',
  margin: '0 auto'
}));

/**
 * Enhanced File Viewer Component
 * 
 * This component displays file information and provides viewing and downloading
 * functionality for files using the unified document service.
 */
const EnhancedFileViewer = () => {
  // Get file ID from URL
  const { fileId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Load file info on mount
  useEffect(() => {
    if (fileId) {
      loadFileInfo();
    }
  }, [fileId]);
  
  // Auto-download file if enabled
  useEffect(() => {
    if (fileInfo && autoDownload) {
      handleDownload();
    }
  }, [fileInfo, autoDownload]);
  
  // Load file information
  const loadFileInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.getFileInfo(fileId);
      
      if (response.success && response.data) {
        setFileInfo(response.data);
        
        // Check localStorage for auto-download preference
        const shouldAutoDownload = localStorage.getItem('autoDownloadFiles') === 'true';
        setAutoDownload(shouldAutoDownload);
        
        // If auto-download is enabled, the useEffect will trigger the download
      } else {
        setError(response.error || 'Failed to load file information');
      }
    } catch (error) {
      console.error('Error loading file information:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file download
  const handleDownload = () => {
    if (!fileInfo || !fileInfo.downloadUrl) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileInfo.downloadUrl;
    link.setAttribute('download', fileInfo.name);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Show notification
    setNotification({
      open: true,
      message: `Downloading ${fileInfo.name}...`,
      severity: 'info'
    });
  };
  
  // Toggle auto-download preference
  const toggleAutoDownload = () => {
    const newValue = !autoDownload;
    setAutoDownload(newValue);
    
    // Save preference to localStorage
    localStorage.setItem('autoDownloadFiles', newValue.toString());
    
    // Show notification
    setNotification({
      open: true,
      message: newValue ? 'Auto-download enabled' : 'Auto-download disabled',
      severity: 'info'
    });
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileIcon fontSize="large" />;
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon fontSize="large" color="primary" />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon fontSize="large" color="error" />;
    } else if (fileType.startsWith('text/') || fileType === 'application/json') {
      return <TextIcon fontSize="large" color="info" />;
    } else if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) {
      return <CodeIcon fontSize="large" color="secondary" />;
    }
    
    return <FileIcon fontSize="large" />;
  };
  
  // Check if file is viewable in browser
  const isViewable = (fileType) => {
    if (!fileType) return false;
    
    return (
      fileType.startsWith('image/') ||
      fileType === 'application/pdf' ||
      fileType.startsWith('text/') ||
      fileType === 'application/json'
    );
  };
  
  // Close notification
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Get direct URL for file
  const directUrl = fileInfo?.previewUrl || '';
  
  return (
    <FileViewerContainer>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => navigate('/documents')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Back to Documents
        </MuiLink>
        <Typography color="text.primary">File Viewer</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : fileInfo ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {getFileIcon(fileInfo.type)}
              <Typography variant="h5" sx={{ ml: 2 }}>
                {fileInfo.name}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  File Details
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Type:</strong> {fileInfo.type}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Modified:</strong> {new Date(fileInfo.modifiedAt).toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    color="primary"
                  >
                    Download
                  </Button>
                  
                  {isViewable(fileInfo.type) && (
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in New Tab
                    </Button>
                  )}
                  
                  <Button
                    variant="text"
                    onClick={toggleAutoDownload}
                    color={autoDownload ? "secondary" : "inherit"}
                  >
                    {autoDownload ? 'Disable Auto-Download' : 'Enable Auto-Download'}
                  </Button>
                </Box>
              </Box>
            </Box>
            
            {isViewable(fileInfo.type) && (
              <Card sx={{ mt: 3, overflow: 'hidden', borderRadius: 2 }}>
                {fileInfo.type.startsWith('image/') ? (
                  <CardMedia
                    component="img"
                    image={directUrl}
                    alt={fileInfo.name}
                    sx={{ 
                      maxHeight: '600px',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                ) : fileInfo.type === 'application/pdf' ? (
                  <Box sx={{ height: '600px' }}>
                    <iframe
                      src={directUrl}
                      title={fileInfo.name}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                    />
                  </Box>
                ) : (
                  <CardContent>
                    <Typography variant="body2">
                      Preview not available for this file type. Please download the file to view it.
                    </Typography>
                  </CardContent>
                )}
              </Card>
            )}
          </Box>
        ) : (
          <Alert severity="warning">
            No file information available
          </Alert>
        )}
      </Paper>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </FileViewerContainer>
  );
};

export default EnhancedFileViewer;
