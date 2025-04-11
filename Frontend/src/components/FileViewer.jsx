import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardMedia,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

/**
 * FileViewer component for handling unique file URLs
 * This component decodes the file ID from the URL and either displays or downloads the file
 */
const FileViewer = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [autoDownload, setAutoDownload] = useState(false);
  const [directUrl, setDirectUrl] = useState(null);
  
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Decode the file path from the base64 fileId
        let filePath;
        try {
          filePath = decodeURIComponent(atob(fileId));
        } catch (e) {
          throw new Error('Invalid file ID format');
        }
        
        console.log('Decoded file path:', filePath);
        
        // Get file metadata
        const response = await axios.get(`${API_URL}/files/metadata/${encodeURIComponent(filePath)}`);
        
        if (response.data && response.data.success) {
          setFileInfo(response.data.data);
          
          // Create direct URL to the file
          // This is the key fix - constructing the proper URL to the static file
          const directFileUrl = `${BACKEND_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
          setDirectUrl(directFileUrl);
          
          console.log('Direct file URL:', directFileUrl);
          
          // Auto-download the file if setting is enabled
          if (autoDownload) {
            downloadFile(filePath, response.data.data.name);
          }
        } else {
          throw new Error(response.data?.message || 'Failed to get file information');
        }
      } catch (err) {
        console.error('Error fetching file:', err);
        setError(err.message || 'Error fetching file');
      } finally {
        setLoading(false);
      }
    };
    
    if (fileId) {
      fetchFileInfo();
    }
  }, [fileId, autoDownload]);
  
  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await axios.get(`${API_URL}/files/download/${encodeURIComponent(filePath)}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error downloading file: ' + err.message);
    }
  };
  
  const handleDownload = () => {
    if (fileInfo) {
      downloadFile(fileInfo.path, fileInfo.name);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const toggleAutoDownload = () => {
    const newValue = !autoDownload;
    setAutoDownload(newValue);
    localStorage.setItem('autoDownloadFiles', newValue.toString());
  };
  
  // Determine if file is viewable in browser
  const isViewable = (mimetype) => {
    return mimetype && (
      mimetype.startsWith('image/') ||
      mimetype === 'application/pdf' ||
      mimetype.startsWith('text/') ||
      mimetype === 'application/json'
    );
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (mimetype) => {
    if (mimetype?.startsWith('image/')) {
      return <ImageIcon fontSize="large" />;
    } else if (mimetype === 'application/pdf') {
      return <PdfIcon fontSize="large" />;
    } else {
      return <FileIcon fontSize="large" />;
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Back
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
            
            {/* Debug information - can be removed in production */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" component="div">
                  <strong>Debug Info:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  Path: {fileInfo.path}
                </Typography>
                <Typography variant="caption" component="div">
                  Direct URL: {directUrl}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="warning">
            No file information available
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default FileViewer;
