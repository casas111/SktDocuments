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
  Link as MuiLink
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  const [autoDownload, setAutoDownload] = useState(true);
  
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
        
        // Get file metadata
        const response = await axios.get(`${API_URL}/files/metadata/${encodeURIComponent(filePath)}`);
        
        if (response.data && response.data.success) {
          setFileInfo(response.data.data);
          
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
      
      <Paper elevation={2} sx={{ p: 3 }}>
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
            <Typography variant="h5" gutterBottom>
              {fileInfo.name}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {fileInfo.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Size: {(fileInfo.size / 1024).toFixed(2)} KB
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Modified: {new Date(fileInfo.modifiedAt).toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download
              </Button>
              
              <Button
                variant="outlined"
                startIcon={autoDownload ? <ViewIcon /> : <DownloadIcon />}
                onClick={toggleAutoDownload}
              >
                {autoDownload ? 'Disable Auto-Download' : 'Enable Auto-Download'}
              </Button>
            </Box>
            
            {isViewable(fileInfo.type) && (
              <Box sx={{ mt: 3, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                {fileInfo.type.startsWith('image/') ? (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <img 
                      src={`${API_URL}/files/download/${encodeURIComponent(fileInfo.path)}`}
                      alt={fileInfo.name}
                      style={{ maxWidth: '100%', maxHeight: '500px' }}
                    />
                  </Box>
                ) : fileInfo.type === 'application/pdf' ? (
                  <Box sx={{ height: '600px' }}>
                    <iframe
                      src={`${API_URL}/files/download/${encodeURIComponent(fileInfo.path)}`}
                      title={fileInfo.name}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2">
                      Preview not available for this file type. Please download the file to view it.
                    </Typography>
                  </Box>
                )}
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
