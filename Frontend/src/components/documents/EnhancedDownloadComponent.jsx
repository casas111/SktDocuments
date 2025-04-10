import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Checkbox,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  GetApp as DownloadIcon,
  InsertDriveFile as FileIcon,
  Folder as FolderIcon,
  Archive as ZipIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import fileService from '../../services/fileService';

// Styled components for enhanced UI
const DownloadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  boxShadow: 'none',
  fontWeight: 500,
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const DownloadListItem = styled(ListItem)(({ theme, status }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: 
    status === 'success' ? theme.palette.success.light :
    status === 'error' ? theme.palette.error.light :
    theme.palette.background.paper,
  transition: 'all 0.3s ease',
}));

/**
 * Enhanced Download Component with improved UX
 * 
 * @param {Object} props - Component props
 * @param {Array} props.selectedItems - Selected files/folders to download
 * @param {string} props.currentPath - Current directory path
 * @param {Function} props.onDownloadComplete - Callback when download completes
 * @param {Function} props.onError - Callback for error handling
 */
const EnhancedDownloadComponent = ({ 
  selectedItems, 
  currentPath, 
  onDownloadComplete, 
  onError 
}) => {
  // State for download dialog
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadAsZip, setDownloadAsZip] = useState(selectedItems.length > 1);
  
  // Open download dialog
  const handleOpenDownloadDialog = () => {
    // Initialize download queue from selected items
    const queue = selectedItems.map(item => ({
      id: Math.random().toString(36).substring(2, 9),
      item,
      status: 'pending', // pending, downloading, success, error
      error: null
    }));
    
    setDownloadQueue(queue);
    setDownloadDialogOpen(true);
  };
  
  // Close download dialog
  const handleCloseDownloadDialog = () => {
    if (!isDownloading) {
      setDownloadDialogOpen(false);
      setDownloadQueue([]);
    }
  };
  
  // Toggle download as zip option
  const handleToggleZip = () => {
    setDownloadAsZip(!downloadAsZip);
  };
  
  // Start download process
  const handleStartDownload = async () => {
    if (downloadQueue.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      if (downloadAsZip) {
        // Download all items as a single zip
        await downloadAsZipArchive();
      } else {
        // Download items individually
        await downloadIndividualItems();
      }
      
      onDownloadComplete && onDownloadComplete(downloadQueue.length);
    } catch (error) {
      console.error('Download error:', error);
      onError && onError('Failed to download some items');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Download all items as a zip archive
  const downloadAsZipArchive = async () => {
    try {
      // Update all items to downloading status
      setDownloadQueue(prev => prev.map(item => ({
        ...item,
        status: 'downloading'
      })));
      
      // Prepare file paths for the API
      const filePaths = downloadQueue.map(qItem => {
        const item = qItem.item;
        const itemPath = currentPath === '/' 
          ? `/${item.name}` 
          : `${currentPath}/${item.name}`;
        return itemPath;
      });
      
      // Download as zip
      await fileService.downloadMultipleFiles(filePaths);
      
      // Update all items to success status
      setDownloadQueue(prev => prev.map(item => ({
        ...item,
        status: 'success'
      })));
    } catch (error) {
      // Update all items to error status
      setDownloadQueue(prev => prev.map(item => ({
        ...item,
        status: 'error',
        error: error.message || 'Failed to download as ZIP'
      })));
      throw error;
    }
  };
  
  // Download items individually
  const downloadIndividualItems = async () => {
    // Process each item sequentially to avoid browser issues with multiple downloads
    for (const qItem of downloadQueue) {
      try {
        // Update status to downloading
        setDownloadQueue(prev => prev.map(item => 
          item.id === qItem.id ? { ...item, status: 'downloading' } : item
        ));
        
        const item = qItem.item;
        const itemPath = currentPath === '/' 
          ? `/${item.name}` 
          : `${currentPath}/${item.name}`;
        
        if (item.isDirectory) {
          // Download folder as zip
          await fileService.downloadFile(itemPath);
        } else {
          // Download single file
          await fileService.downloadFile(itemPath);
        }
        
        // Update status to success
        setDownloadQueue(prev => prev.map(item => 
          item.id === qItem.id ? { ...item, status: 'success' } : item
        ));
      } catch (error) {
        // Update status to error
        setDownloadQueue(prev => prev.map(item => 
          item.id === qItem.id ? { 
            ...item, 
            status: 'error', 
            error: error.message || 'Download failed' 
          } : item
        ));
      }
      
      // Small delay between downloads to prevent browser issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }
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
    <>
      <DownloadButton
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleOpenDownloadDialog}
        disabled={selectedItems.length === 0}
      >
        Download {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
      </DownloadButton>
      
      {/* Download Dialog */}
      <Dialog
        open={downloadDialogOpen}
        onClose={handleCloseDownloadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Download {downloadQueue.length} {downloadQueue.length === 1 ? 'item' : 'items'}
        </DialogTitle>
        
        <DialogContent>
          {downloadQueue.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Download Options
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={downloadAsZip}
                  onChange={handleToggleZip}
                  disabled={isDownloading}
                />
                <Typography>
                  Download all items as a single ZIP archive
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          
          <Typography variant="subtitle2" gutterBottom>
            Files to download:
          </Typography>
          
          <List>
            {downloadQueue.map((qItem) => (
              <DownloadListItem key={qItem.id} status={qItem.status}>
                <ListItemIcon>
                  {qItem.status === 'downloading' ? (
                    <CircularProgress size={24} />
                  ) : qItem.status === 'success' ? (
                    <SuccessIcon color="success" />
                  ) : qItem.status === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : qItem.item.isDirectory ? (
                    <FolderIcon />
                  ) : (
                    <FileIcon />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={qItem.item.name}
                  secondary={
                    <>
                      {qItem.item.size ? formatFileSize(qItem.item.size) : 'Folder'}
                      {qItem.status === 'error' && (
                        <Typography component="span" variant="body2" color="error">
                          {" - " + qItem.error}
                        </Typography>
                      )}
                    </>
                  }
                />
                
                {qItem.status === 'success' && (
                  <Tooltip title="Downloaded">
                    <IconButton edge="end" disabled>
                      <SuccessIcon color="success" />
                    </IconButton>
                  </Tooltip>
                )}
              </DownloadListItem>
            ))}
          </List>
          
          {downloadAsZip && downloadQueue.length > 1 && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ZipIcon sx={{ mr: 1 }} />
                <Typography>
                  All items will be compressed into a single ZIP file
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDownloadDialog} 
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleStartDownload}
            disabled={isDownloading || downloadQueue.length === 0}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedDownloadComponent;
