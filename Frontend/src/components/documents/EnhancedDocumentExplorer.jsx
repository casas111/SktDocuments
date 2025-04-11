import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  CreateNewFolder as NewFolderIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import ImprovedFolderTree from './ImprovedFolderTree';
import unifiedDocumentService from '../../services/unifiedDocumentService';

// Styled components
const DocumentExplorerContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const ExplorerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ExplorerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
}));

const FolderTreePanel = styled(Box)(({ theme }) => ({
  width: 280,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const ContentPanel = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
  height: '100%',
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const FileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const FolderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 60,
  height: 60,
  marginBottom: theme.spacing(1),
  borderRadius: '50%',
  backgroundColor: theme.palette.background.default,
}));

/**
 * Enhanced Document Explorer Component
 * 
 * This component provides a comprehensive file and folder explorer with
 * improved folder rendering and management capabilities.
 */
const EnhancedDocumentExplorer = () => {
  // State
  const [currentPath, setCurrentPath] = useState('/');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Root', path: '/' }]);
  
  // Load folders and files on mount and when current path changes
  useEffect(() => {
    loadFolders();
    loadDirectoryContents(currentPath);
  }, [currentPath]);
  
  // Load all folders for the folder tree
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.getAllFolders();
      
      if (response.success && response.data) {
        console.log('Loaded all folders:', response.data);
        setFolders(response.data);
      } else {
        console.error('Error loading folders:', response.error);
        setError('Failed to load folders: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Exception loading folders:', err);
      setError('Error loading folders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load contents of the current directory
  const loadDirectoryContents = async (dirPath) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.getDirectoryContents(dirPath);
      
      if (response.success && response.data) {
        console.log('Loaded directory contents:', response.data);
        
        // Separate files and folders
        const folderItems = response.data.filter(item => item.isDirectory);
        const fileItems = response.data.filter(item => !item.isDirectory);
        
        setFiles(fileItems);
        
        // Update breadcrumbs
        updateBreadcrumbs(dirPath);
      } else {
        console.error('Error loading directory contents:', response.error);
        setError('Failed to load directory contents: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Exception loading directory contents:', err);
      setError('Error loading directory contents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Update breadcrumbs based on current path
  const updateBreadcrumbs = (path) => {
    if (path === '/') {
      setBreadcrumbs([{ name: 'Root', path: '/' }]);
      return;
    }
    
    const parts = path.split('/').filter(Boolean);
    let currentPath = '';
    const crumbs = [{ name: 'Root', path: '/' }];
    
    parts.forEach(part => {
      currentPath += '/' + part;
      crumbs.push({
        name: part,
        path: currentPath
      });
    });
    
    setBreadcrumbs(crumbs);
  };
  
  // Navigate to a folder
  const navigateToFolder = (path) => {
    console.log('Navigating to folder:', path);
    setCurrentPath(path);
  };
  
  // Handle folder creation
  const handleFolderCreated = () => {
    console.log('Folder created, refreshing...');
    loadFolders();
    loadDirectoryContents(currentPath);
    showNotification('Folder created successfully', 'success');
  };
  
  // Handle folder rename
  const handleFolderRenamed = () => {
    console.log('Folder renamed, refreshing...');
    loadFolders();
    loadDirectoryContents(currentPath);
    showNotification('Folder renamed successfully', 'success');
  };
  
  // Handle folder deletion
  const handleFolderDeleted = () => {
    console.log('Folder deleted, refreshing...');
    loadFolders();
    loadDirectoryContents(currentPath);
    showNotification('Folder deleted successfully', 'success');
  };
  
  // Handle folder move
  const handleFolderMoved = () => {
    console.log('Folder moved, refreshing...');
    loadFolders();
    loadDirectoryContents(currentPath);
    showNotification('Folder moved successfully', 'success');
  };
  
  // Refresh current directory
  const refreshCurrentDirectory = () => {
    loadFolders();
    loadDirectoryContents(currentPath);
    showNotification('Content refreshed', 'info');
  };
  
  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return isLast ? (
            <Typography key={crumb.path} color="text.primary" fontWeight="bold">
              {crumb.name}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigateToFolder(crumb.path);
              }}
            >
              {index === 0 ? <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> : null}
              {crumb.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  return (
    <DocumentExplorerContainer>
      <ExplorerHeader>
        <Typography variant="h6" gutterBottom>
          Document Explorer
        </Typography>
        
        {renderBreadcrumbs()}
      </ExplorerHeader>
      
      <ExplorerContent>
        <FolderTreePanel>
          <ImprovedFolderTree
            folders={folders}
            currentPath={currentPath}
            onNavigate={navigateToFolder}
            onFolderCreated={handleFolderCreated}
            onFolderRenamed={handleFolderRenamed}
            onFolderDeleted={handleFolderDeleted}
            onFolderMoved={handleFolderMoved}
          />
        </FolderTreePanel>
        
        <ContentPanel>
          {/* Action bar */}
          <ActionBar>
            <Box>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{ mr: 1 }}
              >
                Upload Files
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<NewFolderIcon />}
                onClick={() => {
                  // This will be handled by the folder tree component
                  // Just navigate to the current path to ensure it's visible
                  navigateToFolder(currentPath);
                }}
              >
                New Folder
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
                          <FolderCard onClick={() => navigateToFolder(folder.path)}>
                            <IconContainer>
                              <FolderIcon fontSize="large" />
                            </IconContainer>
                            
                            <Typography variant="body2" align="center" noWrap>
                              {folder.name}
                            </Typography>
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
                          <IconContainer>
                            <FileIcon fontSize="large" />
                          </IconContainer>
                          
                          <Typography variant="body2" align="center" noWrap>
                            {file.name}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
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
                    
                    <Button
                      variant="outlined"
                      startIcon={<NewFolderIcon />}
                      onClick={() => {
                        // This will be handled by the folder tree component
                        // Just navigate to the current path to ensure it's visible
                        navigateToFolder(currentPath);
                      }}
                    >
                      New Folder
                    </Button>
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
    </DocumentExplorerContainer>
  );
};

export default EnhancedDocumentExplorer;
