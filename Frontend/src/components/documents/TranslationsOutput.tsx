import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import styled from '@emotion/styled';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { UnifiedDocumentService } from '../../services/unifiedDocumentService';

// Styled components
const TranslationsContainer = styled(Paper)`
  padding: 0;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: #757575;
`;

const FileItem = styled(ListItem)`
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

// Types
interface FileItem {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TranslationsOutputProps {
  onFileSelect?: (file: FileItem | null) => void;
  unifiedDocumentService: UnifiedDocumentService;
}

const TranslationsOutput: React.FC<TranslationsOutputProps> = ({
  onFileSelect,
  unifiedDocumentService
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Load translations on component mount
  useEffect(() => {
    loadTranslations();
  }, []);
  
  // Load translations from the translations folder
  const loadTranslations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/directory`, {
        params: { path: '/translations' }
      });
      
      if (response.data.success && response.data.contents) {
        // Filter to only show files, not folders
        const filesList = response.data.contents.filter((item: FileItem) => item.type !== 'folder');
        setFiles(filesList);
      } else {
        setError('Failed to load translations');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      setError('Error loading translations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleSelect = (file: FileItem) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  // Handle file preview
  const handlePreview = async (file: FileItem) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
    setPreviewLoading(true);
    setPreviewContent('');
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/content`, {
        params: { path: file.path }
      });
      
      if (response.data.success && response.data.content) {
        setPreviewContent(response.data.content);
      } else {
        setPreviewContent('Failed to load file content');
      }
    } catch (error) {
      console.error('Error loading file content:', error);
      setPreviewContent('Error loading file content. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Handle file download
  const handleDownload = async (file: FileItem) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/download`, {
        params: { path: file.path }
      });
      
      if (response.data.success && response.data.downloadUrl) {
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get file icon based on mime type
  const getFileIcon = (file: FileItem) => {
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
    
    loadTranslations();
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
              <FileItem 
                key={file.path} 
                onClick={() => handleSelect(file)}
                sx={{ cursor: 'pointer' }}
              >
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
              onClick={() => selectedFile && handleDownload(selectedFile)} 
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
