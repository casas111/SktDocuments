import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Breadcrumbs,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CreateNewFolder as NewFolderIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import unifiedDocumentService from '../../services/unifiedDocumentService';
import ImprovedFolderTree from './ImprovedFolderTree';
import EnhancedFolderManager from './EnhancedFolderManager';
import EnhancedUploadComponent from './EnhancedUploadComponent';

// Styled components
const DocumentExplorerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
}));

const ExplorerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden'
}));

const SidePanel = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '100%',
  overflow: 'auto',
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2)
}));

const ContentPanel = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  overflow: 'auto',
  padding: theme.spacing(2)
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const FolderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)'
  }
}));

const FileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)'
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(1)
}));

/**
 * Enhanced Document Explorer Component
 * 
 * This component provides a complete document and folder management interface
 * using the unified document service to ensure consistent behavior.
 */
const EnhancedDocumentExplorer = () => {
  // State
  const [currentPath, setCurrentPath] = useState('/');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load folders and files on mount and when path changes
  useEffect(() => {
    loadFolders();
    loadDirectoryContents(currentPath);
  }, [currentPath]);
  
  // Load all folders for the folder tree
  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await unifiedDocumentService.getAllFolders();
      
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        setError(response.error || 'Failed to load folders');
      }
    } catch (err) {
      console.error('Error loading folders:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Load directory contents
  const loadDirectoryContents = async (dirPath) => {
    try {
      setLoading(true);
      const response = await unifiedDocumentService.getDirectoryContents(dirPath);
      
      if (response.success && response.data) {
        // Separate files and folders
        const allItems = response.data;
        const folderItems = allItems.filter(item => item.isDirectory);
        const fileItems = allItems.filter(item => !item.isDirectory);
        
        setFiles(fileItems);
      } else {
        setError(response.error || 'Failed to load directory contents');
      }
    } catch (err) {
      console.error('Error loading directory contents:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to folder
  const navigateToFolder = (path) => {
    setCurrentPath(path);
  };
  
  // Handle folder creation
  const handleFolderCreated = () => {
    // Refresh folders and current directory
    loadFolders();
    loadDirectoryContents(currentPath);
    
    // Show notification
    setNotification({
      open: true,
      message: 'Folder created successfully',
      severity: 'success'
    });
  };
  
  // Refresh current directory
  const refreshCurrentDirectory = () => {
    loadFolders();
    loadDirectoryContents(currentPath);
    
    // Show notification
    setNotification({
      open: true,
      message: 'Directory refreshed',
      severity: 'info'
    });
  };
  
  // Open upload dialog
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };
  
  // Close upload dialog
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };
  
  // Handle file upload completion
  const handleUploadComplete = () => {
    // Refresh the current directory to show new files
    loadDirectoryContents(currentPath);
    
    // Show notification
    setNotification({
      open: true,
      message: 'Files uploaded successfully',
      severity: 'success'
    });
    
    // Close the dialog
    setUploadDialogOpen(false);
  };
  
  // Navigate to file
  const navigateToFile = (filePath) => {
    navigate(`/file/${encodeURIComponent(filePath)}`);
  };
  
  // Open delete confirmation dialog for a file
  const handleDeleteFile = (file) => {
    setItemToDelete({
      type: 'file',
      path: file.path,
      name: file.name
    });
    setDeleteDialogOpen(true);
  };
  
  // Delete the selected item (file or folder)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      
      let response;
      if (itemToDelete.type === 'file') {
        // Delete file
        response = await unifiedDocumentService.deleteFile(itemToDelete.path);
      } else {
        // Delete folder
        response = await unifiedDocumentService.deleteFolder(itemToDelete.path);
      }
      
      if (response.success) {
        // Refresh the current directory
        loadDirectoryContents(currentPath);
        
        // Show success notification
        setNotification({
          open: true,
          message: `${itemToDelete.type === 'file' ? 'File' : 'Folder'} "${itemToDelete.name}" deleted successfully`,
          severity: 'success'
        });
      } else {
        // Show error notification
        setError(response.error || `Failed to delete ${itemToDelete.type}`);
      }
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setError(err.message || `An unexpected error occurred while deleting ${itemToDelete.type}`);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  // Close notification
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Generate breadcrumbs from path
  const generateBreadcrumbs = () => {
    if (currentPath === '/') {
      return [{ name: 'Root', path: '/' }];
    }
    
    const parts = currentPath.split('/').filter(Boolean);
    let currentBreadcrumb = '';
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    parts.forEach(part => {
      currentBreadcrumb += '/' + part;
      breadcrumbs.push({
        name: part,
        path: currentBreadcrumb
      });
    });
    
    return breadcrumbs;
  };
  
  return (
    <DocumentExplorerContainer>
      <ExplorerContent>
        {/* Folder tree sidebar */}
        <SidePanel>
          <ImprovedFolderTree
            currentPath={currentPath}
            onNavigate={navigateToFolder}
            onRefresh={refreshCurrentDirectory}
          />
        </SidePanel>
        
        {/* Main content */}
        <ContentPanel>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="folder navigation"
            sx={{ mb: 2 }}
          >
            {generateBreadcrumbs().map((crumb, index, array) => {
              const isLast = index === array.length - 1;
              
              return isLast ? (
                <Typography key={crumb.path} color="text.primary">
                  {crumb.name}
                </Typography>
              ) : (
                <Button
                  key={crumb.path}
                  color="inherit"
                  onClick={() => navigateToFolder(crumb.path)}
                  sx={{ textTransform: 'none' }}
                >
                  {crumb.name}
                </Button>
              );
            })}
          </Breadcrumbs>
          
          {/* Action bar */}
          <ActionBar>
            <Box>
              <Button
                variant="contained"
                startIcon={<NewFolderIcon />}
                sx={{ mr: 1 }}
              >
                <EnhancedFolderManager
                  currentPath={currentPath}
                  onFolderCreated={handleFolderCreated}
                />
              </Button>
              
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleOpenUploadDialog}
                sx={{ mr: 1 }}
              >
                Upload Files
              </Button>
            </Box>
            
            <Tooltip title="Refresh">
              <IconButton onClick={refreshCurrentDirectory}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </ActionBar>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Content */}
          {!loading && (
            <>
              {/* Folders */}
              {folders.filter(folder => folder.parent === currentPath).length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Folders
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {folders
                      .filter(folder => folder.parent === currentPath)
                      .map(folder => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={folder.path}>
                          <FolderCard>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete({
                                    type: 'folder',
                                    path: folder.path,
                                    name: folder.name
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ 
                                  position: 'absolute', 
                                  top: 4, 
                                  right: 4,
                                  opacity: 0.7,
                                  '&:hover': { opacity: 1, bgcolor: 'rgba(0,0,0,0.1)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box onClick={() => navigateToFolder(folder.path)} sx={{ cursor: 'pointer', pt: 1 }}>
                              <IconContainer>
                                <FolderIcon fontSize="large" />
                              </IconContainer>
                              
                              <Typography variant="body2" align="center" noWrap>
                                {folder.name}
                              </Typography>
                            </Box>
                          </FolderCard>
                        </Grid>
                      ))}
                  </Grid>
                </>
              )}
              
              {/* Files */}
              {files.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Files
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {files.map(file => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={file.path}>
                        <FileCard>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file);
                              }}
                              sx={{ 
                                position: 'absolute', 
                                top: 4, 
                                right: 4,
                                opacity: 0.7,
                                '&:hover': { opacity: 1, bgcolor: 'rgba(0,0,0,0.1)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Box onClick={() => navigateToFile(file.path)} sx={{ cursor: 'pointer', pt: 1 }}>
                            <IconContainer>
                              <FileIcon fontSize="large" />
                            </IconContainer>
                            
                            <Typography variant="body2" align="center" noWrap>
                              {file.name}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary">
                              {(file.size / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </FileCard>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              
              {/* Empty state */}
              {folders.filter(folder => folder.parent === currentPath).length === 0 && files.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    This folder is empty
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{ mr: 1 }}
                    >
                      Upload Files
                    </Button>
                    
                    <EnhancedFolderManager
                      currentPath={currentPath}
                      onFolderCreated={handleFolderCreated}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </ContentPanel>
      </ExplorerContent>
      
      {/* Notification snackbar */}
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
      
      {/* File Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload files to current folder: {currentPath === '/' ? 'Root' : currentPath}
          </Typography>
          <EnhancedUploadComponent 
            currentPath={currentPath}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          {itemToDelete && (
            <Typography>
              Are you sure you want to delete {itemToDelete.type} "{itemToDelete.name}"?
              {itemToDelete.type === 'folder' && (
                <Typography color="error" sx={{ mt: 1 }}>
                  Warning: This will delete all files and subfolders inside this folder.
                </Typography>
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DocumentExplorerContainer>
  );
};

export default EnhancedDocumentExplorer;
