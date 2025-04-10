import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DocumentStore from '../../utils/DocumentStore';
import { Document } from '../../types/document';
import { uploadDocument } from '../../services/api';

interface FileUploaderProps {
  nodeId: string;
  inputId: string;
  label?: string;
  multiple?: boolean;
  acceptedFileTypes?: string;
  folderId?: string;
  onUploadComplete?: (document: Document) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  nodeId, 
  inputId, 
  label = 'Upload Document', 
  multiple = false,
  acceptedFileTypes = '*',
  folderId = 'root',
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const documentStore = DocumentStore.getInstance();
  
  // Load documents on component mount and when nodeId or inputId changes
  useEffect(() => {
    const loadDocuments = async () => {
      const docs = documentStore.getNodeInputDocuments(nodeId, inputId);
      setDocuments(docs);
    };
    
    loadDocuments();
  }, [nodeId, inputId]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const files = Array.from(event.target.files);
      const uploadPromises = files.map(async (file) => {
        // First try to upload to the server
        try {
          const metadata = {
            nodeId,
            inputId,
            folderId,
            type: 'input',
            description: `Uploaded for ${nodeId}/${inputId}`
          };
          
          const response = await uploadDocument(file, metadata);
          
          if (response.success && response.data) {
            // If server upload successful, add to document store
            return documentStore.addDocument(file, nodeId, inputId);
          } else {
            // If server upload fails, fall back to local storage
            showNotification('Server upload failed, storing locally', 'warning');
            return documentStore.addDocument(file, nodeId, inputId);
          }
        } catch (error) {
          console.error('Error uploading to server:', error);
          showNotification('Server upload failed, storing locally', 'warning');
          return documentStore.addDocument(file, nodeId, inputId);
        }
      });
      
      const newDocuments = await Promise.all(uploadPromises);
      
      // If not multiple, replace existing documents
      if (!multiple) {
        // Remove old documents
        documents.forEach(doc => {
          if (doc.id) {
            documentStore.removeDocument(doc.id);
          }
        });
        setDocuments(newDocuments);
      } else {
        // Add to existing documents
        setDocuments([...documents, ...newDocuments]);
      }
      
      showNotification('Document(s) uploaded successfully', 'success');
      
      // Call the onUploadComplete callback if provided
      if (onUploadComplete && newDocuments.length > 0) {
        onUploadComplete(newDocuments[0]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Error uploading file', 'error');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      event.target.value = '';
    }
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = await documentStore.deleteDocument(documentId);
      
      if (success) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
        showNotification('Document deleted successfully', 'success');
      } else {
        showNotification('Failed to delete document', 'error');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('Error deleting document', 'error');
    }
  };
  
  const handleDownloadDocument = (documentId: string) => {
    try {
      documentStore.downloadDocument(documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification('Error downloading document', 'error');
    }
  };
  
  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsDialogOpen(true);
  };
  
  const handleClosePreview = () => {
    setIsDialogOpen(false);
    setPreviewDocument(null);
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <AttachFileIcon color="primary" />;
    } else if (fileType.startsWith('application/pdf')) {
      return <AttachFileIcon color="error" />;
    } else if (fileType.startsWith('text/')) {
      return <AttachFileIcon color="success" />;
    } else {
      return <AttachFileIcon />;
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const renderPreview = () => {
    if (!previewDocument) return null;
    
    if (previewDocument.type.startsWith('image/')) {
      return (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <img 
            src={previewDocument.url} 
            alt={previewDocument.originalName}
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </Box>
      );
    } else if (previewDocument.type.startsWith('text/')) {
      // For text files, we need to extract the base64 content
      const content = previewDocument.content as string;
      const base64Content = content.split(',')[1];
      const decodedContent = atob(base64Content);
      
      return (
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 2, 
            maxHeight: '400px', 
            overflow: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '0.875rem'
          }}
        >
          {decodedContent}
        </Paper>
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Preview not available for this file type.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadDocument(previewDocument.id)}
            sx={{ mt: 2 }}
          >
            Download to view
          </Button>
        </Box>
      );
    }
  };
  
  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Box>
      <input
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
        id={`file-upload-${nodeId}-${inputId}`}
        type="file"
        multiple={multiple}
        onChange={handleFileChange}
      />
      <label htmlFor={`file-upload-${nodeId}-${inputId}`}>
        <Button
          variant="outlined"
          component="span"
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={isUploading || (!multiple && documents.length > 0)}
          size="small"
          fullWidth
        >
          {label}
        </Button>
      </label>
      
      {documents.length > 0 && (
        <List dense sx={{ mt: 1, maxHeight: '150px', overflow: 'auto' }}>
          {documents.map((doc) => (
            <ListItem key={doc.id} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getFileIcon(doc.type)}
              </ListItemIcon>
              <ListItemText
                primary={doc.originalName}
                secondary={formatFileSize(doc.size)}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Preview">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => handlePreviewDocument(doc)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => handleDownloadDocument(doc.id)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      
      <Dialog 
        open={isDialogOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDocument?.originalName}
          <Typography variant="caption" display="block" color="text.secondary">
            {previewDocument?.type} • {previewDocument && formatFileSize(previewDocument.size)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {renderPreview()}
        </DialogContent>
        <DialogActions>
          {previewDocument && (
            <Button 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDocument(previewDocument.id)}
            >
              Download
            </Button>
          )}
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUploader;
