import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  Breadcrumbs, 
  Link, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  CreateNewFolder as CreateNewFolderIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  InsertDriveFile as GenericFileIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import fileService from '../../services/fileService';

// Styled components
const FileExplorerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'calc(100vh - 200px)',
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const FileListContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  marginTop: theme.spacing(2)
}));

const UploadDropzone = styled(Box)(({ theme, isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDragging ? theme.palette.action.hover : 'transparent',
  padding: theme.spacing(2),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}));

const FilePreviewContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  maxHeight: '300px',
  overflow: 'auto'
}));

const FileItem = styled(ListItem)(({ theme, isSelected }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

// Helper function to get file icon based on type
const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon />;
  } else if (fileType === 'application/pdf') {
    return <PdfIcon />;
  } else if (fileType.startsWith('text/') || fileType === 'application/json' || fileType === 'application/xml') {
    return <CodeIcon />;
  } else {
    return <GenericFileIcon />;
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

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const DocumentsDrive = () => {
  // State
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([{ name: 'Home', path: '' }]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [contextItem, setContextItem] = useState(null);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load files from current path
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fileService.getDirectoryContents(currentPath);
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
      setAlert({
        open: true,
        message: 'Failed to load files: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  // Initial load
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Update path history when current path changes
  useEffect(() => {
    if (currentPath === '') {
      setPathHistory([{ name: 'Home', path: '' }]);
    } else {
      const pathParts = currentPath.split('/');
      const newPathHistory = [{ name: 'Home', path: '' }];
      
      let currentPathBuilder = '';
      for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i]) {
          currentPathBuilder += (currentPathBuilder ? '/' : '') + pathParts[i];
          newPathHistory.push({
            name: pathParts[i],
            path: currentPathBuilder
          });
        }
      }
      
      setPathHistory(newPathHistory);
    }
  }, [currentPath]);

  // Handle navigation
  const handleNavigate = (path) => {
    setCurrentPath(path);
    setSelectedItems([]);
  };

  // Handle folder click
  const handleFolderClick = (folder) => {
    handleNavigate(folder.path);
  };

  // Handle file click
  const handleFileClick = (file, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      setSelectedItems(prev => {
        const itemIndex = prev.findIndex(item => item.path === file.path);
        if (itemIndex >= 0) {
          return prev.filter(item => item.path !== file.path);
        } else {
          return [...prev, file];
        }
      });
    } else {
      // Single select
      setSelectedItems([file]);
    }
  };

  // Handle item double click
  const handleItemDoubleClick = (item) => {
    if (item.isDirectory) {
      handleFolderClick(item);
    } else {
      handlePreview(item);
    }
  };

  // Handle context menu
  const handleContextMenu = (event, item) => {
    event.preventDefault();
    setContextItem(item);
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setContextItem(null);
  };

  // Handle new folder dialog
  const handleNewFolderClick = () => {
    setNewFolderName('');
    setNewFolderDialogOpen(true);
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await fileService.createFolder(currentPath, newFolderName);
      setNewFolderDialogOpen(false);
      loadFiles();
      setAlert({
        open: true,
        message: `Folder "${newFolderName}" created successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      setAlert({
        open: true,
        message: 'Failed to create folder: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Handle rename dialog
  const handleRenameClick = (item) => {
    setContextItem(item);
    setNewName(item.name);
    setRenameDialogOpen(true);
    handleMenuClose();
  };

  // Rename item
  const handleRename = async () => {
    if (!newName.trim() || !contextItem) return;
    
    try {
      await fileService.renameItem(contextItem.path, newName);
      setRenameDialogOpen(false);
      loadFiles();
      setAlert({
        open: true,
        message: `Item renamed to "${newName}" successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error renaming item:', error);
      setAlert({
        open: true,
        message: 'Failed to rename item: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Handle delete
  const handleDelete = async (item) => {
    try {
      await fileService.deleteItem(item.path);
      loadFiles();
      setSelectedItems([]);
      setAlert({
        open: true,
        message: `"${item.name}" deleted successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlert({
        open: true,
        message: 'Failed to delete item: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Handle multiple delete
  const handleMultipleDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const item of selectedItems) {
        await fileService.deleteItem(item.path);
      }
      loadFiles();
      setSelectedItems([]);
      setAlert({
        open: true,
        message: `${selectedItems.length} items deleted successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting items:', error);
      setAlert({
        open: true,
        message: 'Failed to delete items: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Handle download
  const handleDownload = async (item) => {
    try {
      await fileService.downloadFile(item.path);
      setAlert({
        open: true,
        message: `Downloading "${item.name}"`,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      setAlert({
        open: true,
        message: 'Failed to download file: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Handle multiple download
  const handleMultipleDownload = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      if (selectedItems.length === 1) {
        await fileService.downloadFile(selectedItems[0].path);
        setAlert({
          open: true,
          message: `Downloading "${selectedItems[0].name}"`,
          severity: 'info'
        });
      } else {
        const filePaths = selectedItems.map(item => item.path);
        await fileService.downloadMultipleFiles(filePaths);
        setAlert({
          open: true,
          message: `Downloading ${selectedItems.length} files as ZIP`,
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error downloading files:', error);
      setAlert({
        open: true,
        message: 'Failed to download files: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  // Handle preview
  const handlePreview = async (item) => {
    if (item.isDirectory) return;
    
    setPreviewItem(item);
    setPreviewContent(null);
    setPreviewDialogOpen(true);
    
    try {
      const response = await fileService.getFilePreview(item.path);
      setPreviewContent(response.data);
    } catch (error) {
      console.error('Error getting file preview:', error);
      setAlert({
        open: true,
        message: 'Failed to preview file: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
    
    handleMenuClose();
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await fileService.uploadFiles(files, currentPath, (progress) => {
        setUploadProgress(progress);
      });
      
      loadFiles();
      setAlert({
        open: true,
        message: `${files.length} files uploaded successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      setAlert({
        open: true,
        message: 'Failed to upload files: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  // Render file preview content
  const renderPreviewContent = () => {
    if (!previewContent) {
      return <CircularProgress />;
    }

    switch (previewContent.previewType) {
      case 'image':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={previewContent.previewUrl} 
              alt={previewContent.name} 
              style={{ maxWidth: '100%', maxHeight: '500px' }} 
            />
          </Box>
        );
      case 'pdf':
        return (
          <Box sx={{ height: '500px' }}>
            <iframe 
              src={previewContent.previewUrl} 
              title={previewContent.name}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </Box>
        );
      case 'text':
        return (
          <Box 
            component="pre" 
            sx={{ 
              maxHeight: '500px', 
              overflow: 'auto', 
              p: 2, 
              backgroundColor: '#f5f5f5',
              borderRadius: 1
            }}
          >
            {previewContent.previewContent}
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1">
              Preview not available for this file type.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(previewItem)}
              sx={{ mt: 2 }}
            >
              Download to view
            </Button>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Documents Drive
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Folders
            </Typography>
            <List>
              <ListItemButton 
                onClick={() => handleNavigate('')}
                selected={currentPath === ''}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
              <Divider sx={{ my: 1 }} />
              {files
                .filter(item => item.isDirectory)
                .map((folder) => (
                  <ListItemButton 
                    key={folder.path}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary={folder.name} />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <FileExplorerContainer>
            {/* Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    const parentPath = currentPath.split('/').slice(0, -1).join('/');
                    handleNavigate(parentPath);
                  }}
                  disabled={currentPath === ''}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CreateNewFolderIcon />}
                  onClick={handleNewFolderClick}
                  sx={{ mr: 1 }}
                >
                  New Folder
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  component="label"
                  sx={{ mr: 1 }}
                >
                  Upload Files
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileInputChange}
                  />
                </Button>
              </Box>
              
              <Box>
                {selectedItems.length > 0 && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleMultipleDownload}
                      sx={{ mr: 1 }}
                    >
                      Download
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleMultipleDelete}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb">
              {pathHistory.map((item, index) => {
                const isLast = index === pathHistory.length - 1;
                return isLast ? (
                  <Typography key={item.path} color="text.primary">
                    {item.name}
                  </Typography>
                ) : (
                  <Link
                    key={item.path}
                    component="button"
                    variant="body1"
                    onClick={() => handleNavigate(item.path)}
                    underline="hover"
                    color="inherit"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </Breadcrumbs>
            
            {/* Upload dropzone */}
            <UploadDropzone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              component="label"
            >
              {isUploading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              ) : (
                <>
                  <UploadFileIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Drag and drop files here, or click to select files
                  </Typography>
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileInputChange}
                  />
                </>
              )}
            </UploadDropzone>
            
            {/* File list */}
            <FileListContainer>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : files.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="body1">
                    This folder is empty
                  </Typography>
                </Box>
              ) : (
                <List>
                  {files.map((item) => {
                    const isSelected = selectedItems.some(selected => selected.path === item.path);
                    return (
                      <FileItem
                        key={item.path}
                        isSelected={isSelected}
                        onClick={(e) => handleFileClick(item, e)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="more"
                            onClick={(e) => {
                              setContextItem(item);
                              setMenuAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          {item.isDirectory ? <FolderIcon /> : getFileIcon(item.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <>
                              {!item.isDirectory && formatFileSize(item.size)} • {formatDate(item.modifiedAt)}
                            </>
                          }
                        />
                      </FileItem>
                    );
                  })}
                </List>
              )}
            </FileListContainer>
          </FileExplorerContainer>
        </Grid>
      </Grid>
      
      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {contextItem && !contextItem.isDirectory && (
          <MenuItem onClick={() => {
            handlePreview(contextItem);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <FileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          if (contextItem) {
            handleRenameClick(contextItem);
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        
        {contextItem && !contextItem.isDirectory && (
          <MenuItem onClick={() => {
            handleDownload(contextItem);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          if (contextItem) {
            handleDelete(contextItem);
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* New folder dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRename} color="primary">Rename</Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewItem?.name}
          <IconButton
            aria-label="close"
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {renderPreviewContent()}
        </DialogContent>
        <DialogActions>
          {previewItem && (
            <Button 
              onClick={() => handleDownload(previewItem)} 
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          )}
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsDrive;
