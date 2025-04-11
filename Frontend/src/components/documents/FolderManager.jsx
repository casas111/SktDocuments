import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Folder as FolderIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAllFolders, createFolder } from '../../services/api';

// Styled components for better UI
const FolderManagerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(2)
}));

const FolderManagerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const FolderList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2)
}));

const FolderItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  width: 120,
  height: 120,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4]
  }
}));

/**
 * FolderManager Component
 * A dedicated component to manage folders with improved UI and functionality
 */
const FolderManager = ({ currentFolder, onFolderSelect, onFolderCreated }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load folders on mount and when currentFolder changes
  useEffect(() => {
    loadFolders();
  }, [currentFolder]);

  // Load all folders
  const loadFolders = async () => {
    setLoading(true);
    try {
      const response = await getAllFolders();
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        showNotification('Failed to load folders', 'error');
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      showNotification('Error loading folders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get child folders of current folder
  const getChildFolders = () => {
    return folders.filter(folder => folder.parentId === (currentFolder?.id || 'root'));
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showNotification('Folder name cannot be empty', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await createFolder(newFolderName, currentFolder?.id || 'root');
      
      if (response.success && response.data) {
        // Wait longer to ensure backend processing completes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add the new folder to the current folders list immediately
        const newFolder = response.data;
        setFolders(prevFolders => {
          // Check if folder already exists to avoid duplicates
          if (!prevFolders.some(folder => folder.id === newFolder.id)) {
            return [...prevFolders, newFolder];
          }
          return prevFolders;
        });
        
        // Force a re-render after a short delay
        setTimeout(() => {
          setFolders(prevFolders => [...prevFolders]);
        }, 100);
        
        // Then refresh the folders list
        await loadFolders();
        
        showNotification('Folder created successfully', 'success');
        setNewFolderName('');
        setShowCreateDialog(false);
        
        // Notify parent component
        if (onFolderCreated) {
          onFolderCreated(response.data);
        }
      } else {
        showNotification('Failed to create folder', 'error');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showNotification('Error creating folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, severity) => {
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

  // Render child folders
  const childFolders = getChildFolders();

  return (
    <FolderManagerContainer>
      <FolderManagerHeader>
        <Typography variant="h6">
          {currentFolder ? `Folders in ${currentFolder.name}` : 'Root Folders'}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ mr: 1 }}
          >
            New Folder
          </Button>
          <IconButton 
            color="primary" 
            onClick={loadFolders}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </FolderManagerHeader>
      
      <Divider />
      
      {childFolders.length > 0 ? (
        <FolderList>
          {childFolders.map(folder => (
            <FolderItem 
              key={folder.id} 
              onClick={() => onFolderSelect(folder)}
              elevation={2}
            >
              <FolderIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography 
                variant="body2" 
                align="center"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {folder.name}
              </Typography>
            </FolderItem>
          ))}
        </FolderList>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No folders found in this location
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ mt: 2 }}
          >
            Create a folder
          </Button>
        </Box>
      )}
      
      {/* Create Folder Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateFolder} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </FolderManagerContainer>
  );
};

export default FolderManager;
