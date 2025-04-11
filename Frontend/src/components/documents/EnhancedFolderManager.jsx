import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { CreateNewFolder as NewFolderIcon } from '@mui/icons-material';
import unifiedDocumentService from '../../services/unifiedDocumentService';

/**
 * Enhanced Folder Manager Component
 * 
 * This component provides folder creation and management functionality
 * using the unified document service to ensure consistent behavior.
 */
const EnhancedFolderManager = ({ currentPath = '/', onFolderCreated }) => {
  // State
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Open new folder dialog
  const openNewFolderDialog = () => {
    setNewFolderName('');
    setError(null);
    setNewFolderDialog(true);
  };

  // Create new folder
  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine parent ID based on current path
      const parentId = currentPath === '/' ? 'root' : currentPath;
      
      // Create folder using unified service
      const response = await unifiedDocumentService.createFolder(newFolderName, parentId);
      
      if (response.success && response.data) {
        // Close dialog
        setNewFolderDialog(false);
        
        // Show success notification
        setNotification({
          open: true,
          message: `Folder "${newFolderName}" created successfully`,
          severity: 'success'
        });
        
        // Notify parent component
        if (onFolderCreated) {
          onFolderCreated(response.data);
        }
      } else {
        // Show error
        setError(response.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Close notification
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<NewFolderIcon />}
        onClick={openNewFolderDialog}
        size="small"
      >
        New Folder
      </Button>
      
      {/* New Folder Dialog */}
      <Dialog
        open={newFolderDialog}
        onClose={() => !loading && setNewFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            disabled={loading}
          />
          <Typography variant="caption" color="text.secondary">
            Location: {currentPath === '/' ? 'Root' : currentPath}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setNewFolderDialog(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={createNewFolder} 
            color="primary"
            disabled={loading || !newFolderName.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </>
  );
};

export default EnhancedFolderManager;
