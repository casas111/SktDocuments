import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as CloudUploadIcon,
  CreateNewFolder as CreateNewFolderIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Share as ShareIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

// File type icons mapping
const fileTypeIcons = {
  pdf: <PdfIcon color="error" />,
  docx: <DescriptionIcon color="primary" />,
  xlsx: <DescriptionIcon color="success" />,
  jpg: <ImageIcon color="secondary" />,
  png: <ImageIcon color="secondary" />,
  default: <FileIcon color="action" />
};

// Get icon for file type
const getFileIcon = (fileType) => {
  return fileTypeIcons[fileType] || fileTypeIcons.default;
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
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const Documents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { 
    documents, 
    folders, 
    currentFolder,
    isLoadingDocuments,
    setCurrentFolder,
    fetchDocuments,
    fetchFolders,
    createFolder,
    uploadDocument,
    deleteDocument,
    error,
    setError
  } = useApp();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Fetch documents and folders on mount
  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [fetchDocuments, fetchFolders]);

  // Update breadcrumbs when current folder changes
  useEffect(() => {
    if (currentFolder) {
      // In a real implementation, we would build the breadcrumb path
      // by traversing the folder hierarchy
      setBreadcrumbs([
        { id: 'root', name: 'Root' },
        ...(currentFolder.id !== 'root' ? [currentFolder] : [])
      ]);
    }
  }, [currentFolder]);

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle document click
  const handleDocumentClick = (document) => {
    navigate(`/documents/${document.id}`);
  };

  // Handle folder click
  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (folder) => {
    setCurrentFolder(folder);
  };

  // Handle menu open
  const handleMenuOpen = (event, document) => {
    event.stopPropagation();
    setSelectedDocument(document);
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle document delete
  const handleDeleteDocument = async () => {
    if (selectedDocument) {
      try {
        await deleteDocument(selectedDocument.id);
        setSnackbar({
          open: true,
          message: 'Document deleted successfully',
          severity: 'success'
        });
      } catch (err) {
        setError('Failed to delete document');
        setSnackbar({
          open: true,
          message: 'Failed to delete document',
          severity: 'error'
        });
      }
      handleMenuClose();
    }
  };

  // Handle new folder dialog open
  const handleNewFolderDialogOpen = () => {
    setNewFolderDialogOpen(true);
  };

  // Handle new folder dialog close
  const handleNewFolderDialogClose = () => {
    setNewFolderDialogOpen(false);
    setNewFolderName('');
  };

  // Handle create folder
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        await createFolder(newFolderName, currentFolder.id);
        setSnackbar({
          open: true,
          message: 'Folder created successfully',
          severity: 'success'
        });
        handleNewFolderDialogClose();
      } catch (err) {
        setError('Failed to create folder');
        setSnackbar({
          open: true,
          message: 'Failed to create folder',
          severity: 'error'
        });
      }
    }
  };

  // Handle upload dialog open
  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  // Handle upload dialog close
  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
  };

  // Handle file change
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  // Handle upload document
  const handleUploadDocument = async () => {
    if (uploadFile) {
      setIsUploading(true);
      try {
        await uploadDocument(uploadFile, currentFolder.id);
        setSnackbar({
          open: true,
          message: 'Document uploaded successfully',
          severity: 'success'
        });
        handleUploadDialogClose();
      } catch (err) {
        setError('Failed to upload document');
        setSnackbar({
          open: true,
          message: 'Failed to upload document',
          severity: 'error'
        });
      }
      setIsUploading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  // Render document list item
  const renderDocumentListItem = (document) => (
    <motion.div
      key={document.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.shadows[3],
            bgcolor: 'rgba(0, 0, 0, 0.01)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleDocumentClick(document)}
      >
        <Box sx={{ mr: 2 }}>
          {getFileIcon(document.type)}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" component="div">
            {document.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(document.size)} • {formatDate(document.createdAt)}
          </Typography>
        </Box>
        {document.labels && document.labels.length > 0 && (
          <Box sx={{ mx: 2, display: { xs: 'none', sm: 'block' } }}>
            {document.labels.map(label => (
              <Chip
                key={label.id}
                label={label.name}
                size="small"
                sx={{ mr: 1, bgcolor: label.color, color: '#fff' }}
              />
            ))}
          </Box>
        )}
        <IconButton
          aria-label="more"
          onClick={(e) => handleMenuOpen(e, document)}
          data-testid="MoreVertIcon"
        >
          <MoreVertIcon />
        </IconButton>
      </Paper>
    </motion.div>
  );

  // Render document grid item
  const renderDocumentGridItem = (document) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          elevation={1}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: theme.shadows[3],
              transform: 'translateY(-4px)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleDocumentClick(document)}
        >
          <Box
            sx={{
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'grey.100',
              height: 140
            }}
          >
            <Box sx={{ transform: 'scale(2.0)' }}>
              {getFileIcon(document.type)}
            </Box>
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" component="div" noWrap>
              {document.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(document.size)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(document.createdAt)}
            </Typography>
            {document.labels && document.labels.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {document.labels.map(label => (
                  <Chip
                    key={label.id}
                    label={label.name}
                    size="small"
                    sx={{ mr: 1, mt: 0.5, bgcolor: label.color, color: '#fff' }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              aria-label="more"
              onClick={(e) => handleMenuOpen(e, document)}
              data-testid="MoreVertIcon"
            >
              <MoreVertIcon />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  );

  // Render folder item
  const renderFolderItem = (folder) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          elevation={1}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: theme.shadows[3],
              transform: 'translateY(-4px)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleFolderClick(folder)}
        >
          <Box
            sx={{
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              height: 140
            }}
          >
            <FolderIcon sx={{ fontSize: 80 }} />
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" component="div" noWrap>
              {folder.name}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Documents
        </Typography>
        <Box>
          <Tooltip title="New Folder">
            <Button
              variant="outlined"
              startIcon={<CreateNewFolderIcon />}
              onClick={handleNewFolderDialogOpen}
              sx={{ mr: 1 }}
            >
              {!isMobile && 'New Folder'}
            </Button>
          </Tooltip>
          <Tooltip title="Upload Document">
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadDialogOpen}
            >
              {!isMobile && 'Upload'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
        {breadcrumbs.map((folder, index) => (
          <React.Fragment key={folder.id}>
            {index > 0 && <Typography sx={{ mx: 1 }}>/</Typography>}
            <Typography
              variant="body1"
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'primary'}
              sx={{ 
                cursor: 'pointer',
                fontWeight: index === breadcrumbs.length - 1 ? 'medium' : 'normal'
              }}
              onClick={() => handleBreadcrumbClick(folder)}
            >
              {folder.name}
            </Typography>
          </React.Fragment>
        ))}
      </Paper>

      {/* Search and filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search documents..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <Box>
          <Tooltip title="Filter">
            <IconButton sx={{ mr: 1 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={viewMode === 'list' ? 'Grid View' : 'List View'}>
            <IconButton onClick={toggleViewMode}>
              {viewMode === 'list' ? (
                <ViewModuleIcon data-testid="ViewListIcon" />
              ) : (
                <ViewListIcon data-testid="ViewModuleIcon" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoadingDocuments && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Folders */}
      {!isLoadingDocuments && folders.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Folders
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {folders
              .filter(folder => folder.parentId === currentFolder.id)
              .map(folder => renderFolderItem(folder))
            }
          </Grid>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Documents */}
      {!isLoadingDocuments && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Documents
          </Typography>
          {filteredDocuments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No documents found
              </Typography>
            </Paper>
          ) : viewMode === 'list' ? (
            <Box>
              {filteredDocuments.map(document => renderDocumentListItem(document))}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredDocuments.map(document => renderDocumentGridItem(document))}
            </Grid>
          )}
        </>
      )}

      {/* Document menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleDocumentClick(selectedDocument);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          Copy
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <LabelIcon fontSize="small" />
          </ListItemIcon>
          Add Label
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteDocument}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* New folder dialog */}
      <Dialog
        open={newFolderDialogOpen}
        onClose={handleNewFolderDialogClose}
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
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewFolderDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained"
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="upload-file"
              type="file"
              onChange={handleFileChange}
              aria-label="Choose File"
            />
            <label htmlFor="upload-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Choose File
              </Button>
            </label>
            {uploadFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            disabled={!uploadFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Documents;
