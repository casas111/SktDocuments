import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Divider, 
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  InsertDriveFile as FileIcon, 
  CloudUpload as UploadIcon,
  CreateNewFolder as NewFolderIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  ViewComfy as GalleryViewIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as RenameIcon,
  GetApp as DownloadIcon,
  FileCopy as CopyIcon,
  ContentCut as CutIcon,
  ContentPaste as ContentPasteIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as PreviewIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Home as HomeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import fileService from '../../services/fileService';
import EnhancedUploadComponent from './EnhancedUploadComponent';
import EnhancedDownloadComponent from './EnhancedDownloadComponent';
import EnhancedFolderTree from './EnhancedFolderTree';
import EnhancedBreadcrumbNavigation from './EnhancedBreadcrumbNavigation';
import MetadataSidebar from './MetadataSidebar';
import EnhancedSearchComponent from './EnhancedSearchComponent';

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const FileGridItem = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
  },
  '& .file-icon': {
    fontSize: 48,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  '& .file-name': {
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .file-info': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  '& .file-actions': {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  '&:hover .file-actions': {
    opacity: 1,
  },
}));

const FileListItem = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const SearchContainer = styled(Box)(({ theme, focused }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  border: `1px solid ${focused ? theme.palette.primary.main : theme.palette.divider}`,
  boxShadow: focused ? `0 0 0 2px ${theme.palette.primary.light}` : 'none',
  transition: 'all 0.2s ease',
  width: '100%',
  maxWidth: 600,
  '& .search-icon': {
    color: focused ? theme.palette.primary.main : theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  '& .search-input': {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
  },
  '& .search-clear': {
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  '&:hover .search-clear': {
    opacity: 0.7,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const DocumentsDrive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [pathHistory, setPathHistory] = useState(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'gallery'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size', 'type'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [clipboard, setClipboard] = useState({ items: [], operation: null }); // 'copy', 'cut'
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameDialog, setRenameDialog] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [metadataSidebarOpen, setMetadataSidebarOpen] = useState(false);
  const [metadataItem, setMetadataItem] = useState(null);
  
  // Menu states
  const [contextMenu, setContextMenu] = useState(null);
  const [itemMenu, setItemMenu] = useState(null);
  const [itemMenuTarget, setItemMenuTarget] = useState(null);
  const [sortMenu, setSortMenu] = useState(null);
  const [filterMenu, setFilterMenu] = useState(null);
  
  // Load files and folders on path change
  useEffect(() => {
    if (!isSearchMode) {
      loadFilesAndFolders();
    }
  }, [currentPath, sortBy, sortDirection, isSearchMode]);
  
  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  // Load all folders for the folder tree
  useEffect(() => {
    loadAllFolders();
  }, []);
  
  const loadAllFolders = async () => {
    try {
      setLoading(true);
      
      // This would be a recursive function to get all folders
      // For simplicity, we're just loading top-level folders here
      const response = await fileService.getDirectoryContents('/');
      
      if (response.data && response.data.success) {
        const folders = response.data.data.filter(item => item.isDirectory);
        setAllFolders(folders);
      }
    } catch (err) {
      console.error('Error loading all folders:', err);
      setError('Error loading folder structure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFilesAndFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch files and folders from the service
      const response = await fileService.getDirectoryContents(currentPath, {
        sortBy,
        sortDirection,
        search: searchQuery
      });
      
      if (response.data && response.data.success) {
        setFiles(response.data.data.filter(item => !item.isDirectory) || []);
        setFolders(response.data.data.filter(item => item.isDirectory) || []);
      } else {
        setError(response.data?.error || 'Failed to load files and folders');
      }
    } catch (err) {
      setError('Error loading files and folders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation functions
  const navigateToFolder = (folderPath) => {
    // Add to history if navigating forward
    if (historyIndex === pathHistory.length - 1) {
      setPathHistory([...pathHistory.slice(0, historyIndex + 1), folderPath]);
      setHistoryIndex(historyIndex + 1);
    } else {
      // Replace forward history if navigating from a back position
      setPathHistory([...pathHistory.slice(0, historyIndex + 1), folderPath]);
      setHistoryIndex(historyIndex + 1);
    }
    
    setCurrentPath(folderPath);
    setSelectedItems([]);
  };
  
  const navigateBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(pathHistory[historyIndex - 1]);
      setSelectedItems([]);
    }
  };
  
  const navigateForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(pathHistory[historyIndex + 1]);
      setSelectedItems([]);
    }
  };
  
  const navigateHome = () => {
    navigateToFolder('/');
  };
  
  // File and folder operations
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.createFolder(currentPath, newFolderName);
      
      if (response.data && response.data.success) {
        setSuccess('Folder created successfully');
        loadFilesAndFolders();
        setNewFolderDialog(false);
        setNewFolderName('');
        loadAllFolders(); // Refresh folder tree
      } else {
        setError(response.data?.error || 'Failed to create folder');
      }
    } catch (err) {
      setError('Error creating folder: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRenameItem = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.renameItem(
        `${currentPath === '/' ? '' : currentPath}/${renameItem.name}`, 
        newName
      );
      
      if (response.data && response.data.success) {
        setSuccess('Item renamed successfully');
        loadFilesAndFolders();
        setRenameDialog(false);
        setRenameItem(null);
        setNewName('');
        if (renameItem.isDirectory) {
          loadAllFolders(); // Refresh folder tree if a folder was renamed
        }
      } else {
        setError(response.data?.error || 'Failed to rename item');
      }
    } catch (err) {
      setError('Error renaming item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const promises = selectedItems.map(item => {
        const itemPath = `${currentPath === '/' ? '' : currentPath}/${item.name}`;
        return fileService.deleteItem(itemPath);
      });
      
      const results = await Promise.all(promises);
      
      if (results.every(result => result.data && result.data.success)) {
        setSuccess(`${selectedItems.length} item(s) deleted successfully`);
        loadFilesAndFolders();
        setDeleteDialog(false);
        setSelectedItems([]);
        
        // Refresh folder tree if any folders were deleted
        if (selectedItems.some(item => item.isDirectory)) {
          loadAllFolders();
        }
      } else {
        setError('Failed to delete some items');
      }
    } catch (err) {
      setError('Error deleting items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Selection handling
  const toggleItemSelection = (item, event) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      if (selectedItems.some(selected => selected.name === item.name && selected.isDirectory === item.isDirectory)) {
        setSelectedItems(selectedItems.filter(
          selected => !(selected.name === item.name && selected.isDirectory === item.isDirectory)
        ));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else if (event.shiftKey && selectedItems.length > 0) {
      // Range select with Shift key
      const allItems = [...folders, ...files];
      const lastSelected = selectedItems[selectedItems.length - 1];
      const lastSelectedIndex = allItems.findIndex(
        i => i.name === lastSelected.name && i.isDirectory === lastSelected.isDirectory
      );
      const currentIndex = allItems.findIndex(
        i => i.name === item.name && i.isDirectory === item.isDirectory
      );
      
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const rangeSelection = allItems.slice(start, end + 1);
      setSelectedItems(rangeSelection);
    } else {
      // Single select
      setSelectedItems([item]);
    }
  };
  
  const isItemSelected = (item) => {
    return selectedItems.some(
      selected => selected.name === item.name && selected.isDirectory === item.isDirectory
    );
  };
  
  // Clipboard operations
  const copySelectedItems = () => {
    setClipboard({ items: [...selectedItems], operation: 'copy' });
    setSuccess(`${selectedItems.length} item(s) copied to clipboard`);
    setContextMenu(null);
    setItemMenu(null);
  };
  
  const cutSelectedItems = () => {
    setClipboard({ items: [...selectedItems], operation: 'cut' });
    setSuccess(`${selectedItems.length} item(s) cut to clipboard`);
    setContextMenu(null);
    setItemMenu(null);
  };
  
  const pasteItems = async () => {
    if (!clipboard.items.length) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const promises = clipboard.items.map(item => {
        const sourcePath = `${item.path || currentPath}/${item.name}`;
        const destinationPath = currentPath;
        
        if (clipboard.operation === 'copy') {
          // This is a simplified version - actual implementation would need to handle
          // copying folders with contents, etc.
          return fileService.copyItem(sourcePath, destinationPath);
        } else { // cut
          return fileService.moveItem(sourcePath, destinationPath);
        }
      });
      
      const results = await Promise.all(promises);
      
      if (results.every(result => result.data && result.data.success)) {
        setSuccess(`${clipboard.items.length} item(s) pasted successfully`);
        loadFilesAndFolders();
        
        // Clear clipboard if it was a cut operation
        if (clipboard.operation === 'cut') {
          setClipboard({ items: [], operation: null });
        }
        
        // Refresh folder tree if any folders were moved
        if (clipboard.items.some(item => item.isDirectory)) {
          loadAllFolders();
        }
      } else {
        setError('Failed to paste some items');
      }
    } catch (err) {
      setError('Error pasting items: ' + err.message);
    } finally {
      setLoading(false);
      setContextMenu(null);
    }
  };
  
  // Context menu handlers
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };
  
  const handleItemContextMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Select the item if not already selected
    if (!isItemSelected(item)) {
      setSelectedItems([item]);
    }
    
    setItemMenuTarget(item);
    setItemMenu({ x: event.clientX, y: event.clientY });
  };
  
  // Handle upload complete
  const handleUploadComplete = (count) => {
    setSuccess(`${count} file(s) uploaded successfully`);
    loadFilesAndFolders();
    setUploadDialogOpen(false);
  };
  
  // Handle upload error
  const handleUploadError = (message) => {
    setError(message);
  };
  
  // Handle download complete
  const handleDownloadComplete = (count) => {
    setSuccess(`${count} file(s) downloaded successfully`);
  };
  
  // Handle download error
  const handleDownloadError = (message) => {
    setError(message);
  };
  
  // Handle folder tree events
  const handleFolderCreated = () => {
    loadAllFolders();
    loadFilesAndFolders();
    setSuccess('Folder created successfully');
  };
  
  const handleFolderRenamed = () => {
    loadAllFolders();
    loadFilesAndFolders();
    setSuccess('Folder renamed successfully');
  };
  
  const handleFolderDeleted = () => {
    loadAllFolders();
    loadFilesAndFolders();
    setSuccess('Folder deleted successfully');
  };
  
  const handleFolderMoved = () => {
    loadAllFolders();
    loadFilesAndFolders();
    setSuccess('Folder moved successfully');
  };
  
  // Show file metadata
  const showMetadata = async (item) => {
    try {
      setLoading(true);
      setMetadataItem(item);
      setMetadataSidebarOpen(true);
    } catch (err) {
      setError('Error showing metadata: ' + err.message);
    } finally {
      setLoading(false);
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Render file grid
  const renderFileGrid = () => {
    return (
      <Grid container spacing={2}>
        {folders.map((folder) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={folder.name}>
            <FileGridItem
              onClick={() => navigateToFolder(`${currentPath === '/' ? '' : currentPath}/${folder.name}`)}
              onContextMenu={(e) => handleItemContextMenu(e, folder)}
              selected={isItemSelected(folder)}
            >
              <Box className="file-actions">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItemSelection(folder, { stopPropagation: () => {} });
                  }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <FolderIcon className="file-icon" />
              <Typography className="file-name" variant="body2">
                {folder.name}
              </Typography>
              <Typography className="file-info" variant="caption">
                Folder • {folder.modifiedAt && formatDate(folder.modifiedAt)}
              </Typography>
            </FileGridItem>
          </Grid>
        ))}
        
        {files.map((file) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={file.name}>
            <FileGridItem
              onClick={(e) => toggleItemSelection(file, e)}
              onDoubleClick={() => showMetadata(file)}
              onContextMenu={(e) => handleItemContextMenu(e, file)}
              selected={isItemSelected(file)}
            >
              <Box className="file-actions">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    showMetadata(file);
                  }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <FileIcon className="file-icon" />
              <Typography className="file-name" variant="body2">
                {file.name}
              </Typography>
              <Typography className="file-info" variant="caption">
                {file.size && formatFileSize(file.size)} • {file.modifiedAt && formatDate(file.modifiedAt)}
              </Typography>
            </FileGridItem>
          </Grid>
        ))}
        
        {folders.length === 0 && files.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                This folder is empty
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload files or create a new folder to get started
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    );
  };
  
  // Render file list
  const renderFileList = () => {
    return (
      <List>
        {folders.map((folder) => (
          <FileListItem
            key={folder.name}
            onClick={() => navigateToFolder(`${currentPath === '/' ? '' : currentPath}/${folder.name}`)}
            onContextMenu={(e) => handleItemContextMenu(e, folder)}
            selected={isItemSelected(folder)}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary={folder.name}
              secondary={`Folder • ${folder.modifiedAt && formatDate(folder.modifiedAt)}`}
            />
          </FileListItem>
        ))}
        
        {files.map((file) => (
          <FileListItem
            key={file.name}
            onClick={(e) => toggleItemSelection(file, e)}
            onDoubleClick={() => showMetadata(file)}
            onContextMenu={(e) => handleItemContextMenu(e, file)}
            selected={isItemSelected(file)}
          >
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={`${file.size && formatFileSize(file.size)} • ${file.modifiedAt && formatDate(file.modifiedAt)}`}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                showMetadata(file);
              }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </FileListItem>
        ))}
        
        {folders.length === 0 && files.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              This folder is empty
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upload files or create a new folder to get started
            </Typography>
          </Box>
        )}
      </List>
    );
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Folder Tree Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            border: 'none',
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" noWrap>
            Documents Drive
          </Typography>
        </Box>
        
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <EnhancedFolderTree
            folders={allFolders}
            currentPath={currentPath}
            onNavigate={navigateToFolder}
            onFolderCreated={handleFolderCreated}
            onFolderRenamed={handleFolderRenamed}
            onFolderDeleted={handleFolderDeleted}
            onFolderMoved={handleFolderMoved}
          />
        </Box>
        
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            }
          />
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', height: '100%', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Navigation and Search */}
          <Box sx={{ display: 'flex', mb: 2, flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex' }}>
              <IconButton
                onClick={navigateBack}
                disabled={historyIndex === 0}
                size="small"
              >
                <BackIcon />
              </IconButton>
              <IconButton
                onClick={navigateForward}
                disabled={historyIndex === pathHistory.length - 1}
                size="small"
              >
                <ForwardIcon />
              </IconButton>
            </Box>
            
            <EnhancedSearchComponent
              onSearch={(results) => {
                // Handle search results
                if (results && results.length > 0) {
                  setSearchResults(results);
                  setIsSearchMode(true);
                }
              }}
              onResultClick={(result) => {
                // Navigate to the result
                if (result.isDirectory) {
                  navigateToFolder(result.path);
                  setIsSearchMode(false);
                } else {
                  // Navigate to parent folder and select the file
                  const parentPath = result.path.substring(0, result.path.lastIndexOf('/'));
                  navigateToFolder(parentPath || '/');
                  setIsSearchMode(false);
                  
                  // Find and select the file
                  setTimeout(() => {
                    const file = files.find(f => f.name === result.name);
                    if (file) {
                      setSelectedItems([file]);
                      showMetadata(file);
                    }
                  }, 500);
                }
              }}
              onClearSearch={() => {
                setSearchResults([]);
                setIsSearchMode(false);
              }}
            />
          </Box>
          
          {/* Enhanced Breadcrumb Navigation */}
          <Box sx={{ mb: 2 }}>
            <EnhancedBreadcrumbNavigation
              currentPath={currentPath}
              onNavigate={navigateToFolder}
            />
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload
            </ActionButton>
            
            <ActionButton
              variant="outlined"
              startIcon={<NewFolderIcon />}
              onClick={() => setNewFolderDialog(true)}
            >
              New Folder
            </ActionButton>
            
            <EnhancedDownloadComponent
              selectedItems={selectedItems}
              currentPath={currentPath}
              onDownloadComplete={handleDownloadComplete}
              onError={handleDownloadError}
            />
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                View:
              </Typography>
              <IconButton
                size="small"
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ListViewIcon />
              </IconButton>
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <GridViewIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Content Area */}
        <StyledPaper sx={{ p: 2, minHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : isSearchMode && searchResults.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results ({searchResults.length})
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<CloseIcon />} 
                size="small" 
                sx={{ mb: 2 }}
                onClick={() => {
                  setSearchResults([]);
                  setIsSearchMode(false);
                }}
              >
                Clear Search Results
              </Button>
              {viewMode === 'grid' ? (
                <Grid container spacing={2}>
                  {searchResults.map((item, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                      <FileGridItem
                        onClick={() => {
                          if (item.isDirectory) {
                            navigateToFolder(item.path);
                            setIsSearchMode(false);
                          } else {
                            const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
                            navigateToFolder(parentPath || '/');
                            setIsSearchMode(false);
                            
                            setTimeout(() => {
                              const file = files.find(f => f.name === item.name);
                              if (file) {
                                setSelectedItems([file]);
                                showMetadata(file);
                              }
                            }, 500);
                          }
                        }}
                        selected={false}
                      >
                        {item.isDirectory ? (
                          <FolderIcon className="file-icon" />
                        ) : (
                          <FileIcon className="file-icon" />
                        )}
                        <Typography className="file-name" variant="body2">
                          {item.name}
                        </Typography>
                        <Typography className="file-info" variant="caption">
                          {item.path} • {item.isDirectory ? 'Folder' : formatFileSize(item.size || 0)}
                        </Typography>
                      </FileGridItem>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <List>
                  {searchResults.map((item, index) => (
                    <FileListItem
                      key={index}
                      onClick={() => {
                        if (item.isDirectory) {
                          navigateToFolder(item.path);
                          setIsSearchMode(false);
                        } else {
                          const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
                          navigateToFolder(parentPath || '/');
                          setIsSearchMode(false);
                          
                          setTimeout(() => {
                            const file = files.find(f => f.name === item.name);
                            if (file) {
                              setSelectedItems([file]);
                              showMetadata(file);
                            }
                          }, 500);
                        }
                      }}
                      selected={false}
                    >
                      <ListItemIcon>
                        {item.isDirectory ? <FolderIcon /> : <FileIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.path} • ${item.isDirectory ? 'Folder' : formatFileSize(item.size || 0)}`}
                      />
                    </FileListItem>
                  ))}
                </List>
              )}
            </Box>
          ) : (
            viewMode === 'grid' ? renderFileGrid() : renderFileList()
          )}
        </StyledPaper>
      </Box>
      
      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          <EnhancedUploadComponent
            currentPath={currentPath}
            onUploadComplete={handleUploadComplete}
            onError={handleUploadError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* New Folder Dialog */}
      <Dialog
        open={newFolderDialog}
        onClose={() => setNewFolderDialog(false)}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={createFolder} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Dialog */}
      <Dialog
        open={renameDialog}
        onClose={() => setRenameDialog(false)}
      >
        <DialogTitle>Rename {renameItem?.isDirectory ? 'Folder' : 'File'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog(false)}>Cancel</Button>
          <Button onClick={handleRenameItem} color="primary">Rename</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the selected {selectedItems.length === 1 ? 'item' : 'items'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={deleteItems} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Metadata Sidebar */}
      <MetadataSidebar
        open={metadataSidebarOpen}
        onClose={() => setMetadataSidebarOpen(false)}
        item={metadataItem}
        currentPath={currentPath}
        onDownload={(item) => {
          const selectedItem = [item];
          handleDownloadComplete(1);
        }}
        onRename={(item) => {
          setRenameItem(item);
          setNewName(item.name);
          setRenameDialog(true);
          setMetadataSidebarOpen(false);
        }}
        onDelete={(item) => {
          setSelectedItems([item]);
          setDeleteDialog(true);
          setMetadataSidebarOpen(false);
        }}
        onShare={(item) => {
          setShareItem(item);
          setShareDialog(true);
          setMetadataSidebarOpen(false);
        }}
      />
      
      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        <MenuItem onClick={() => setNewFolderDialog(true)}>
          <ListItemIcon>
            <NewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setUploadDialogOpen(true)}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload Files</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={pasteItems} disabled={!clipboard.items.length}>
          <ListItemIcon>
            <ContentPasteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Paste</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Item Context Menu */}
      <Menu
        open={Boolean(itemMenu)}
        onClose={() => setItemMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          itemMenu ? { top: itemMenu.y, left: itemMenu.x } : undefined
        }
      >
        {itemMenuTarget?.isDirectory && (
          <MenuItem onClick={() => {
            navigateToFolder(`${currentPath === '/' ? '' : currentPath}/${itemMenuTarget.name}`);
            setItemMenu(null);
          }}>
            <ListItemIcon>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>
        )}
        
        {!itemMenuTarget?.isDirectory && (
          <MenuItem onClick={() => {
            showMetadata(itemMenuTarget);
            setItemMenu(null);
          }}>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => {
          setRenameItem(itemMenuTarget);
          setNewName(itemMenuTarget.name);
          setRenameDialog(true);
          setItemMenu(null);
        }}>
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={copySelectedItems}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={cutSelectedItems}>
          <ListItemIcon>
            <CutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cut</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          setDeleteDialog(true);
          setItemMenu(null);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsDrive;
