import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, CardMedia, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Folder as FolderIcon, 
  CreateNewFolder as CreateNewFolderIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Styled components for enhanced UI
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontWeight: 600,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FolderStructureCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.light,
  },
}));

const FolderItem = styled(Box)(({ theme, depth = 0, isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  paddingLeft: theme.spacing(2 + depth * 2),
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isSelected ? theme.palette.primary.light : 'transparent',
  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.action.hover,
  },
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

// Enhanced Folder Manager Component
const EnhancedFolderManager = ({ 
  folders = [],
  currentFolder = null,
  onFolderSelect,
  onFolderCreate,
  onClose
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolder, setParentFolder] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleNewFolderNameChange = (event) => {
    setNewFolderName(event.target.value);
  };

  const handleParentFolderSelect = (folder) => {
    setParentFolder(folder);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        parentId: parentFolder ? parentFolder.id : null,
        path: parentFolder ? `${parentFolder.path}/${newFolderName}` : `/${newFolderName}`,
        level: parentFolder ? parentFolder.level + 1 : 0,
        children: []
      };
      
      if (onFolderCreate) {
        onFolderCreate(newFolder);
      }
      
      setNotification({
        open: true,
        message: `Folder "${newFolderName}" created successfully`,
        severity: 'success'
      });
      
      setNewFolderName('');
      setShowCreateDialog(false);
    } catch (err) {
      setError(`Failed to create folder: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
    setNewFolderName('');
    setError(null);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setError(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Recursive function to render folder structure
  const renderFolderStructure = (folderList, depth = 0) => {
    return folderList.map(folder => (
      <React.Fragment key={folder.id}>
        <FolderItem 
          depth={depth}
          isSelected={currentFolder && currentFolder.id === folder.id}
          onClick={() => handleParentFolderSelect(folder)}
        >
          <FolderIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" noWrap>
            {folder.name}
          </Typography>
        </FolderItem>
        {folder.children && folder.children.length > 0 && renderFolderStructure(folder.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Folder Manager
        </Typography>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<CreateNewFolderIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Folder
        </ActionButton>
      </Box>

      <FolderStructureCard>
        <CardContent sx={{ p: 1 }}>
          <FolderItem 
            depth={0}
            isSelected={!parentFolder}
            onClick={() => handleParentFolderSelect(null)}
          >
            <FolderIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="medium">
              Root
            </Typography>
          </FolderItem>
          {renderFolderStructure(folders)}
        </CardContent>
      </FolderStructureCard>

      {/* Create Folder Dialog */}
      <StyledDialog
        open={showCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogTitle>
          <Typography variant="h6">Create New Folder</Typography>
          <IconButton edge="end" color="inherit" onClick={handleCloseCreateDialog} aria-label="close">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <StyledDialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create a new folder to organize your documents. Folders can be nested to create a hierarchy.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="folderName"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={handleNewFolderNameChange}
            error={!!error}
            helperText={error}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Parent Folder: {parentFolder ? parentFolder.name : 'Root'}
          </Typography>
          
          <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
            <FolderItem 
              depth={0}
              isSelected={!parentFolder}
              onClick={() => handleParentFolderSelect(null)}
            >
              <FolderIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="medium">
                Root
              </Typography>
            </FolderItem>
            {renderFolderStructure(folders)}
          </Paper>
        </StyledDialogContent>
        <StyledDialogActions>
          <Button onClick={handleCloseCreateDialog} color="inherit">
            Cancel
          </Button>
          <ActionButton
            onClick={handleCreateFolder}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Folder'}
          </ActionButton>
        </StyledDialogActions>
      </StyledDialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedFolderManager;
