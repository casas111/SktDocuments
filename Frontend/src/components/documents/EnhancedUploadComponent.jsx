import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Refresh as RetryIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import fileService from '../../services/fileService';

// Enhanced styled components for the upload zone
const DropzoneContainer = styled(Box)(({ theme, isDragActive, isDragAccept, isDragReject }) => ({
  border: `2px dashed ${
    isDragReject ? theme.palette.error.main :
    isDragAccept ? theme.palette.success.main :
    isDragActive ? theme.palette.primary.main : 
    theme.palette.divider
  }`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? 
    (isDragReject ? theme.palette.error.light : 
     isDragAccept ? theme.palette.success.light : 
     theme.palette.action.hover) : 
    'transparent',
  transition: 'all 0.3s ease',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200,
  cursor: 'pointer'
}));

const UploadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  boxShadow: 'none',
  fontWeight: 500,
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const FileProgressItem = styled(ListItem)(({ theme, status }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: 
    status === 'success' ? theme.palette.success.light :
    status === 'error' ? theme.palette.error.light :
    theme.palette.background.paper,
  transition: 'all 0.3s ease',
}));

/**
 * Enhanced Upload Component with improved UX
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPath - Current directory path
 * @param {Function} props.onUploadComplete - Callback when upload completes
 * @param {Function} props.onError - Callback for error handling
 */
const EnhancedUploadComponent = ({ currentPath, onUploadComplete, onError }) => {
  // State for tracking uploads
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadList, setShowUploadList] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Dropzone configuration
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Create upload queue items
      const newUploads = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: 'pending', // pending, uploading, success, error
        error: null
      }));
      
      setUploadQueue(prev => [...prev, ...newUploads]);
      setShowUploadList(true);
    }
  }, []);
  
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({ 
    onDrop,
    multiple: true
  });
  
  // Process upload queue
  useEffect(() => {
    const processUploads = async () => {
      if (uploadQueue.length > 0 && !isUploading) {
        setIsUploading(true);
        
        // Find pending uploads
        const pendingUploads = uploadQueue.filter(item => item.status === 'pending');
        
        if (pendingUploads.length > 0) {
          // Process uploads in parallel with individual progress tracking
          const uploadPromises = pendingUploads.map(async (item) => {
            try {
              // Update status to uploading
              setUploadQueue(prev => prev.map(qItem => 
                qItem.id === item.id ? { ...qItem, status: 'uploading' } : qItem
              ));
              
              // Create FormData
              const formData = new FormData();
              formData.append('folderPath', currentPath);
              formData.append('files', item.file);
              
              // Track progress for this file
              const progressCallback = (percentCompleted) => {
                setUploadQueue(prev => prev.map(qItem => 
                  qItem.id === item.id ? { ...qItem, progress: percentCompleted } : qItem
                ));
              };
              
              // Upload the file
              const response = await fileService.uploadFiles([item.file], currentPath, progressCallback);
              
              // Update status based on response
              if (response.data && response.data.success) {
                setUploadQueue(prev => prev.map(qItem => 
                  qItem.id === item.id ? { ...qItem, status: 'success', progress: 100 } : qItem
                ));
              } else {
                throw new Error(response.data?.error || 'Upload failed');
              }
              
              return { id: item.id, success: true };
            } catch (error) {
              setUploadQueue(prev => prev.map(qItem => 
                qItem.id === item.id ? { 
                  ...qItem, 
                  status: 'error', 
                  error: error.message || 'Upload failed' 
                } : qItem
              ));
              
              return { id: item.id, success: false, error };
            }
          });
          
          // Wait for all uploads to complete
          await Promise.all(uploadPromises);
        }
        
        setIsUploading(false);
        
        // Check if all uploads are complete
        const allComplete = uploadQueue.every(item => 
          item.status === 'success' || item.status === 'error'
        );
        
        if (allComplete) {
          const successCount = uploadQueue.filter(item => item.status === 'success').length;
          if (successCount > 0) {
            onUploadComplete && onUploadComplete(successCount);
          }
          
          const errorCount = uploadQueue.filter(item => item.status === 'error').length;
          if (errorCount > 0) {
            onError && onError(`Failed to upload ${errorCount} file(s)`);
          }
        }
      }
    };
    
    processUploads();
  }, [uploadQueue, isUploading, currentPath, onUploadComplete, onError]);
  
  // Calculate overall progress
  useEffect(() => {
    if (uploadQueue.length > 0) {
      const totalProgress = uploadQueue.reduce((sum, item) => sum + item.progress, 0);
      const overallPercent = Math.round(totalProgress / uploadQueue.length);
      setOverallProgress(overallPercent);
    } else {
      setOverallProgress(0);
    }
  }, [uploadQueue]);
  
  // Retry failed upload
  const handleRetry = (itemId) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'pending', progress: 0, error: null } : item
    ));
  };
  
  // Remove item from queue
  const handleRemove = (itemId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Clear completed uploads
  const handleClearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => 
      item.status !== 'success' && item.status !== 'error'
    ));
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropzone */}
      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        isDragAccept={isDragAccept}
        isDragReject={isDragReject}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, mb: 2, color: isDragActive ? 'primary.main' : 'text.secondary' }} />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? isDragReject
              ? "Some files are not supported"
              : "Drop files here..."
            : "Drag & drop files here"
          }
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or
        </Typography>
        
        <UploadButton
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={(e) => e.stopPropagation()}
        >
          Browse Files
        </UploadButton>
        
        <Typography variant="caption" color="textSecondary">
          Upload multiple files at once
        </Typography>
      </DropzoneContainer>
      
      {/* Upload Progress */}
      {uploadQueue.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              {isUploading 
                ? `Uploading ${uploadQueue.length} file(s)...` 
                : `${uploadQueue.filter(item => item.status === 'success').length} of ${uploadQueue.length} file(s) uploaded`
              }
            </Typography>
            
            <Box>
              <Button 
                size="small" 
                onClick={() => setShowUploadList(!showUploadList)}
                sx={{ mr: 1 }}
              >
                {showUploadList ? 'Hide' : 'Show'}
              </Button>
              
              {uploadQueue.some(item => item.status === 'success' || item.status === 'error') && (
                <Button 
                  size="small" 
                  onClick={handleClearCompleted}
                >
                  Clear Completed
                </Button>
              )}
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={overallProgress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Collapse in={showUploadList}>
            <List sx={{ mt: 2 }}>
              {uploadQueue.map((item) => (
                <FileProgressItem key={item.id} status={item.status}>
                  <ListItemIcon>
                    {item.status === 'uploading' ? (
                      <CircularProgress size={24} />
                    ) : item.status === 'success' ? (
                      <SuccessIcon color="success" />
                    ) : item.status === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <FileIcon />
                    )}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={item.file.name}
                    secondary={
                      <>
                        {formatFileSize(item.file.size)}
                        {item.status === 'error' && (
                          <Typography component="span" variant="body2" color="error">
                            {" - " + item.error}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  
                  {item.status === 'uploading' && (
                    <Box sx={{ width: '60px', mr: 2 }}>
                      <Typography variant="body2" align="right">
                        {item.progress}%
                      </Typography>
                    </Box>
                  )}
                  
                  <ListItemSecondaryAction>
                    {item.status === 'error' && (
                      <Tooltip title="Retry">
                        <IconButton edge="end" onClick={() => handleRetry(item.id)}>
                          <RetryIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove">
                      <IconButton edge="end" onClick={() => handleRemove(item.id)}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </FileProgressItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedUploadComponent;
