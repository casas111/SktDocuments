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

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error: string | null;
}

interface EnhancedUploadComponentProps {
  currentPath: string;
  onUploadComplete?: (successCount: number) => void;
  onError?: (errorMessage: string) => void;
}

// Enhanced styled components for the upload zone
const DropzoneContainer = styled(Box, {
  shouldForwardProp: (prop) => !['isDragActive', 'isDragAccept', 'isDragReject'].includes(prop as string)
})<{ isDragActive: boolean; isDragAccept: boolean; isDragReject: boolean }>(({ theme, isDragActive, isDragAccept, isDragReject }) => ({
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

const FileProgressItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status: UploadItem['status'] }>(({ theme, status }) => ({
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
 */
const EnhancedUploadComponent: React.FC<EnhancedUploadComponentProps> = ({ 
  currentPath, 
  onUploadComplete, 
  onError 
}) => {
  // State for tracking uploads
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadList, setShowUploadList] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  
  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Create upload queue items
      const newUploads = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: 'pending' as const,
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
              const progressCallback = (percentCompleted: number) => {
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
                  error: error instanceof Error ? error.message : 'Upload failed' 
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
  const handleRetry = (itemId: string) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'pending', progress: 0, error: null } : item
    ));
  };
  
  // Remove item from queue
  const handleRemove = (itemId: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Clear completed uploads
  const handleClearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => 
      item.status !== 'success' && item.status !== 'error'
    ));
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
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
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        <UploadButton
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
        >
          Select Files
        </UploadButton>
      </DropzoneContainer>
      
      {/* Upload Progress */}
      {uploadQueue.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Upload Progress
            </Typography>
            <Button
              size="small"
              onClick={handleClearCompleted}
              disabled={!uploadQueue.some(item => item.status === 'success' || item.status === 'error')}
            >
              Clear Completed
            </Button>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={overallProgress} 
            sx={{ mb: 2 }}
          />
          
          <List>
            {uploadQueue.map(item => (
              <FileProgressItem key={item.id} status={item.status}>
                <ListItemIcon>
                  {item.status === 'success' ? (
                    <SuccessIcon color="success" />
                  ) : item.status === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : item.status === 'uploading' ? (
                    <CircularProgress size={24} />
                  ) : (
                    <FileIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.file.name}
                  secondary={
                    item.status === 'error' ? item.error :
                    item.status === 'uploading' ? `${item.progress}%` :
                    formatFileSize(item.file.size)
                  }
                />
                <ListItemSecondaryAction>
                  {item.status === 'error' && (
                    <Tooltip title="Retry">
                      <IconButton
                        edge="end"
                        onClick={() => handleRetry(item.id)}
                        size="small"
                      >
                        <RetryIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Remove">
                    <IconButton
                      edge="end"
                      onClick={() => handleRemove(item.id)}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </FileProgressItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedUploadComponent; 