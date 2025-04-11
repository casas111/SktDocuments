import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import styled from '@emotion/styled';
import unifiedDocumentService from '../../services/unifiedDocumentService';

const TranslationsContainer = styled(Paper)`
  padding: 16px;
  margin: 16px 0;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const FileItem = styled(ListItem)`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: #757575;
`;

interface TranslationsOutputProps {
  nodeId: string;
  refreshTrigger?: number;
  onFileSelect?: (file: any) => void;
}

const TranslationsOutput: React.FC<TranslationsOutputProps> = ({ 
  nodeId, 
  refreshTrigger = 0,
  onFileSelect 
}) => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Load translations folder contents
  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if translations folder exists, if not create it
        try {
          await unifiedDocumentService.createFolder('translations', '/');
          console.log('Translations folder created or already exists');
        } catch (folderError) {
          console.warn('Error with translations folder:', folderError);
          // Continue anyway as it might already exist
        }
        
        const response = await unifiedDocumentService.getDirectoryContents('/translations');
        
        if (response.success && response.data) {
          // Filter to only show files, not folders
          const filesList = response.data.filter(item => item.type !== 'folder');
          setFiles(filesList);
        } else {
          setError('Failed to load translations');
          setFiles([]);
        }
      } catch (err) {
        console.error('Error fetching translations:', err);
        setError('Error loading translations. Please try again.');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTranslations();
  }, [refreshTrigger]);
  
  // Handle file preview
  const handlePreview = async (file: any) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
    setPreviewLoading(true);
    
    try {
      const response = await unifiedDocumentService.getFileContent(file.path);
      
      if (response.success && response.data) {
        setPreviewContent(response.data.content);
      } else {
        setPreviewContent('Error loading file content');
      }
    } catch (err) {
      console.error('Error fetching file content:', err);
      setPreviewContent('Error loading file content');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Handle file download
  const handleDownload = async (file: any) => {
    try {
      const response = await unifiedDocumentService.getFileDownloadUrl(file.path);
      
      if (response.success && response.data) {
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('Failed to generate download link');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error downloading file. Please try again.');
    }
  };
  
  // Handle file selection
  const handleSelect = (file: any) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Render file icon based on mime type
  const getFileIcon = (file: any) => {
    const mimeType = file.mimeType || '';
    
    if (mimeType === 'application/pdf') {
      return <PictureAsPdfIcon sx={{ color: '#F44336' }} />;
    } else if (mimeType.includes('document') || mimeType.includes('text')) {
      return <DescriptionIcon sx={{ color: '#2196F3' }} />;
    } else {
      return <DescriptionIcon sx={{ color: '#9E9E9E' }} />;
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    // This will trigger the useEffect to reload the files
    if (onFileSelect) {
      onFileSelect(null); // Clear selection
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
          <FolderIcon sx={{ mr: 1, color: '#FFC107' }} />
          Translations Output
        </Typography>
        <Tooltip title="Refresh translations">
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <TranslationsContainer elevation={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : files.length === 0 ? (
          <EmptyState>
            <DescriptionIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" gutterBottom>
              No translated documents yet
            </Typography>
            <Typography variant="body2">
              Processed documents will appear here
            </Typography>
          </EmptyState>
        ) : (
          <List>
            {files.map((file) => (
              <FileItem key={file.path} button onClick={() => handleSelect(file)}>
                <ListItemIcon>
                  {getFileIcon(file)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <React.Fragment>
                      <Typography variant="caption" component="span" color="text.secondary">
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'} • 
                      </Typography>
                      <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                        {formatDate(file.createdAt || file.updatedAt)}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Preview">
                    <IconButton edge="end" onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(file);
                    }}>
                      <PreviewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton edge="end" onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </FileItem>
            ))}
          </List>
        )}
      </TranslationsContainer>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFile?.name || 'Document Preview'}
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace', 
              fontSize: '0.9rem',
              p: 2,
              maxHeight: '60vh',
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              borderRadius: 1
            }}>
              {previewContent}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {selectedFile && (
            <Button 
              onClick={() => handleDownload(selectedFile)} 
              color="primary"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranslationsOutput;
