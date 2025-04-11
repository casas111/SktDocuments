import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  Collapse,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Folder as FolderIcon,
  CreateNewFolder as NewFolderIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Edit as RenameIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  ContentCut as CutIcon,
  ContentPaste as PasteIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import unifiedDocumentService from '../../services/unifiedDocumentService';

// Styled components for enhanced UI
const FolderTreeContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const FolderItem = styled(ListItem)(({ theme, depth = 0, isSelected, isDraggingOver }) => ({
  padding: theme.spacing(0.5, 0.5, 0.5, depth * 1.5 + 0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDraggingOver 
    ? theme.palette.action.hover 
    : isSelected 
      ? theme.palette.action.selected 
      : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease',
  position: 'relative',
}));

const FolderActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  '.MuiListItem-root:hover &': {
    opacity: 1,
  },
}));

const DropIndicator = styled(Box)(({ theme, isVisible, position }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  height: 2,
  backgroundColor: theme.palette.primary.main,
  opacity: isVisible ? 1 : 0,
  top: position === 'top' ? 0 : 'auto',
  bottom: position === 'bottom' ? 0 : 'auto',
  transition: 'opacity 0.2s ease',
}));

/**
 * Enhanced Folder Tree Component with improved organization and navigation
 * 
 * @param {Object} props - Component props
 * @param {Array} props.folders - List of all folders
 * @param {string} props.currentPath - Current active path
 * @param {Function} props.onNavigate - Callback when navigating to a folder
 * @param {Function} props.onFolderCreated - Callback when a folder is created
 * @param {Function} props.onFolderRenamed - Callback when a folder is renamed
 * @param {Function} props.onFolderDeleted - Callback when a folder is deleted
 * @param {Function} props.onFolderMoved - Callback when a folder is moved
 */
const ImprovedFolderTree = ({
  folders = [],
  currentPath = '/',
  onNavigate,
  onFolderCreated,
  onFolderRenamed,
  onFolderDeleted,
  onFolderMoved
}) => {
  // State for folder tree
  const [expandedFolders, setExpandedFolders] = useState(['/']);
  const [folderStructure, setFolderStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Dialog states
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState('/');
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderDialog, setRenameFolderDialog] = useState(false);
  const [renameFolderPath, setRenameFolderPath] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');
  const [deleteFolderDialog, setDeleteFolderDialog] = useState(false);
  const [deleteFolderPath, setDeleteFolderPath] = useState('');
  
  // Menu states
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  
  // Drag and drop states
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'inside', 'above', 'below'
  
  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('folderFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
        setFavorites([]);
      }
    }
  }, []);
  
  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('folderFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Load folders if none provided
  useEffect(() => {
    if (folders.length === 0) {
      loadFolders();
    } else {
      processFolders(folders);
    }
  }, [folders]);
  
  // Process folders into hierarchical structure
  const processFolders = (folderList) => {
    if (folderList.length > 0) {
      console.log('Processing folders:', folderList);
      const structure = buildFolderStructure(folderList);
      setFolderStructure(structure);
    }
  };
  
  // Load folders from API
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.getAllFolders();
      
      if (response.success && response.data) {
        console.log('Loaded folders:', response.data);
        processFolders(response.data);
      } else {
        setError(response.error || 'Failed to load folders');
        console.error('Error loading folders:', response.error);
      }
    } catch (err) {
      setError('Error loading folders: ' + err.message);
      console.error('Exception loading folders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh folders
  const refreshFolders = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await unifiedDocumentService.getAllFolders();
      
      if (response.success && response.data) {
        console.log('Refreshed folders:', response.data);
        processFolders(response.data);
        showNotification('Folders refreshed successfully', 'success');
      } else {
        setError(response.error || 'Failed to refresh folders');
        showNotification('Failed to refresh folders', 'error');
      }
    } catch (err) {
      setError('Error refreshing folders: ' + err.message);
      showNotification('Error refreshing folders', 'error');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Auto-expand parent folders of current path
  useEffect(() => {
    if (currentPath !== '/') {
      const pathParts = currentPath.split('/').filter(Boolean);
      let currentPathBuild = '';
      
      const pathsToExpand = pathParts.map(part => {
        currentPathBuild = currentPathBuild ? `${currentPathBuild}/${part}` : `/${part}`;
        return currentPathBuild;
      });
      
      setExpandedFolders(prev => {
        const newExpanded = [...prev];
        pathsToExpand.forEach(path => {
          if (!newExpanded.includes(path)) {
            newExpanded.push(path);
          }
        });
        return newExpanded;
      });
    }
  }, [currentPath]);
  
  // Build hierarchical folder structure
  const buildFolderStructure = (folderList) => {
    console.log('Building folder structure from:', folderList);
    
    // First, create a map of all folders
    const folderMap = {};
    
    // Add root folder
    folderMap['/'] = {
      name: 'Root',
      path: '/',
      children: [],
      level: 0,
      parent: null
    };
    
    // Process all folders
    folderList.forEach(folder => {
      let folderPath;
      let parentPath;
      
      // Handle different folder formats
      if (folder.id) {
        // Format from documents API
        folderPath = folder.id;
        parentPath = folder.parentId === 'root' ? '/' : folder.parentId;
      } else if (folder.path) {
        // Format from files API
        folderPath = folder.path;
        
        // Get parent path
        if (folderPath !== '/') {
          parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
          if (parentPath === '') parentPath = '/';
        } else {
          parentPath = null;
        }
      } else {
        // Skip invalid folders
        console.warn('Skipping invalid folder:', folder);
        return;
      }
      
      // Skip if already in map
      if (folderMap[folderPath]) return;
      
      // Create folder object
      folderMap[folderPath] = {
        ...folder,
        path: folderPath,
        children: [],
        level: (folderPath.match(/\//g) || []).length,
        parent: parentPath
      };
      
      // Add to parent's children
      if (parentPath && folderMap[parentPath]) {
        folderMap[parentPath].children.push(folderPath);
      }
    });
    
    // Convert map to array and sort
    const sortedFolders = Object.values(folderMap).sort((a, b) => {
      // Sort by level first
      if (a.level !== b.level) return a.level - b.level;
      
      // Then by parent path
      if (a.parent !== b.parent) {
        if (!a.parent) return -1;
        if (!b.parent) return 1;
        return a.parent.localeCompare(b.parent);
      }
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
    
    console.log('Built folder structure:', sortedFolders);
    return sortedFolders;
  };
  
  // Toggle folder expansion
  const toggleFolderExpansion = (folderPath, event) => {
    event.stopPropagation();
    
    setExpandedFolders(prev => 
      prev.includes(folderPath)
        ? prev.filter(path => path !== folderPath)
        : [...prev, folderPath]
    );
  };
  
  // Check if folder has children
  const hasFolderChildren = (folderPath) => {
    return folderStructure.some(folder => folder.parent === folderPath);
  };
  
  // Open new folder dialog
  const openNewFolderDialog = (parentPath) => {
    setNewFolderParent(parentPath);
    setNewFolderName('');
    setNewFolderDialog(true);
    setContextMenu(null);
  };
  
  // Create new folder
  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      showNotification('Folder name cannot be empty', 'error');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert parent path to parentId format if needed
      const parentId = newFolderParent === '/' ? 'root' : newFolderParent;
      
      const response = await unifiedDocumentService.createFolder(newFolderName, parentId);
      
      if (response.success && response.data) {
        console.log('Created folder:', response.data);
        
        // Add the new folder to the folder structure immediately
        const newFolder = response.data;
        const newFolderPath = newFolder.id || newFolder.path;
        
        // Update folder structure with the new folder
        const updatedFolderStructure = [...folderStructure];
        
        // Create folder object for the new folder
        const folderObj = {
          ...newFolder,
          path: newFolderPath,
          children: [],
          level: (newFolderParent.match(/\//g) || []).length + 1,
          parent: newFolderParent
        };
        
        // Add to folder structure if not already present
        if (!updatedFolderStructure.some(f => f.path === newFolderPath)) {
          updatedFolderStructure.push(folderObj);
          setFolderStructure(updatedFolderStructure);
          
          // Force re-render of the folder tree
          setTimeout(() => {
            setFolderStructure([...updatedFolderStructure]);
          }, 100);
        }
        
        setNewFolderDialog(false);
        showNotification('Folder created successfully', 'success');
        
        // Call the callback to refresh parent component
        onFolderCreated && onFolderCreated();
        
        // Auto-expand parent folder
        if (!expandedFolders.includes(newFolderParent)) {
          setExpandedFolders(prev => [...prev, newFolderParent]);
        }
        
        // Refresh folders after a delay to ensure backend processing completes
        setTimeout(() => {
          refreshFolders();
        }, 2000);
      } else {
        setError(response.error || 'Failed to create folder');
        showNotification('Failed to create folder: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      setError('Error creating folder: ' + err.message);
      showNotification('Error creating folder: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Open rename folder dialog
  const openRenameFolderDialog = (folderPath) => {
    const folderName = folderPath.split('/').pop();
    setRenameFolderPath(folderPath);
    setRenameFolderName(folderName);
    setRenameFolderDialog(true);
    setContextMenu(null);
  };
  
  // Rename folder
  const renameFolder = async () => {
    if (!renameFolderName.trim()) {
      setError('Folder name cannot be empty');
      showNotification('Folder name cannot be empty', 'error');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.renameItem(renameFolderPath, renameFolderName);
      
      if (response.success) {
        setRenameFolderDialog(false);
        showNotification('Folder renamed successfully', 'success');
        
        onFolderRenamed && onFolderRenamed();
        
        // Update favorites if needed
        if (favorites.includes(renameFolderPath)) {
          const parentPath = renameFolderPath.substring(0, renameFolderPath.lastIndexOf('/'));
          const newPath = `${parentPath === '' ? '/' : parentPath}/${renameFolderName}`;
          setFavorites(prev => prev.map(path => path === renameFolderPath ? newPath : path));
        }
        
        // Refresh folders after a delay
        setTimeout(() => {
          refreshFolders();
        }, 1000);
      } else {
        setError(response.error || 'Failed to rename folder');
        showNotification('Failed to rename folder: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      setError('Error renaming folder: ' + err.message);
      showNotification('Error renaming folder: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Open delete folder dialog
  const openDeleteFolderDialog = (folderPath) => {
    setDeleteFolderPath(folderPath);
    setDeleteFolderDialog(true);
    setContextMenu(null);
  };
  
  // Delete folder
  const deleteFolder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.deleteFolder(deleteFolderPath);
      
      if (response.success) {
        setDeleteFolderDialog(false);
        showNotification('Folder deleted successfully', 'success');
        
        onFolderDeleted && onFolderDeleted();
        
        // Remove from favorites if needed
        if (favorites.includes(deleteFolderPath)) {
          setFavorites(prev => prev.filter(path => path !== deleteFolderPath));
        }
        
        // Refresh folders after a delay
        setTimeout(() => {
          refreshFolders();
        }, 1000);
      } else {
        setError(response.error || 'Failed to delete folder');
        showNotification('Failed to delete folder: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      setError('Error deleting folder: ' + err.message);
      showNotification('Error deleting folder: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = (folderPath) => {
    setFavorites(prev => 
      prev.includes(folderPath)
        ? prev.filter(path => path !== folderPath)
        : [...prev, folderPath]
    );
    setContextMenu(null);
  };
  
  // Handle context menu
  const handleContextMenu = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuTarget(folder);
    setContextMenu({ x: event.clientX, y: event.clientY });
  };
  
  // Handle drag start
  const handleDragStart = (event, folder) => {
    event.stopPropagation();
    setDraggedFolder(folder);
    
    // Set drag image (optional)
    const dragImage = document.createElement('div');
    dragImage.textContent = folder.name;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up after drag image is captured
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  // Handle drag over
  const handleDragOver = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!draggedFolder || draggedFolder.path === folder.path) return;
    
    // Determine drop position
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    
    if (y < rect.height * 0.25) {
      setDropPosition('above');
    } else if (y > rect.height * 0.75) {
      setDropPosition('below');
    } else {
      setDropPosition('inside');
    }
    
    setDropTarget(folder);
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setDropTarget(null);
    setDropPosition(null);
  };
  
  // Handle drop
  const handleDrop = async (event, targetFolder) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!draggedFolder || !targetFolder || !dropPosition) {
      setDraggedFolder(null);
      setDropTarget(null);
      setDropPosition(null);
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine new path based on drop position
      let newPath;
      
      if (dropPosition === 'inside') {
        // Move inside target folder
        newPath = `${targetFolder.path === '/' ? '' : targetFolder.path}/${draggedFolder.name}`;
      } else {
        // Move to same level as target (above or below)
        const targetParent = targetFolder.parent;
        newPath = `${targetParent === '/' ? '' : targetParent}/${draggedFolder.name}`;
      }
      
      // Don't move to same location
      if (newPath === draggedFolder.path) {
        setDraggedFolder(null);
        setDropTarget(null);
        setDropPosition(null);
        return;
      }
      
      // Move the folder
      const response = await unifiedDocumentService.moveItem(draggedFolder.path, newPath);
      
      if (response.success) {
        showNotification('Folder moved successfully', 'success');
        onFolderMoved && onFolderMoved();
        
        // Update favorites if needed
        if (favorites.includes(draggedFolder.path)) {
          setFavorites(prev => prev.map(path => 
            path === draggedFolder.path ? newPath : path
          ));
        }
        
        // Refresh folders after a delay
        setTimeout(() => {
          refreshFolders();
        }, 1000);
      } else {
        showNotification('Failed to move folder: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      setError('Error moving folder: ' + err.message);
      showNotification('Error moving folder: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setDraggedFolder(null);
      setDropTarget(null);
      setDropPosition(null);
    }
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
  
  // Render folder tree recursively
  const renderFolderTree = (parentPath = '/') => {
    const childFolders = folderStructure.filter(folder => folder.parent === parentPath);
    
    if (childFolders.length === 0) {
      return null;
    }
    
    return (
      <List dense disablePadding>
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.includes(folder.path);
          const hasChildren = hasFolderChildren(folder.path);
          const isSelected = folder.path === currentPath;
          const isFavorite = favorites.includes(folder.path);
          const isDropTarget = dropTarget && dropTarget.path === folder.path;
          
          return (
            <React.Fragment key={folder.path}>
              <FolderItem
                button
                depth={folder.level}
                isSelected={isSelected}
                isDraggingOver={isDropTarget}
                onClick={() => onNavigate && onNavigate(folder.path)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
                draggable
                onDragStart={(e) => handleDragStart(e, folder)}
                onDragOver={(e) => handleDragOver(e, folder)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder)}
              >
                {isDropTarget && dropPosition === 'above' && (
                  <DropIndicator isVisible position="top" />
                )}
                
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {hasChildren ? (
                    <IconButton
                      size="small"
                      edge="start"
                      onClick={(e) => toggleFolderExpansion(folder.path, e)}
                      sx={{ p: 0.5, mr: 0.5 }}
                    >
                      {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 28 }} />
                  )}
                </ListItemIcon>
                
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FolderIcon color={isFavorite ? "primary" : "inherit"} />
                </ListItemIcon>
                
                <ListItemText primary={folder.name} />
                
                <FolderActions>
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(folder.path)}
                    >
                      {isFavorite ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="New folder">
                    <IconButton
                      size="small"
                      onClick={() => openNewFolderDialog(folder.path)}
                    >
                      <NewFolderIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="More options">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, folder);
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </FolderActions>
                
                {isDropTarget && dropPosition === 'below' && (
                  <DropIndicator isVisible position="bottom" />
                )}
              </FolderItem>
              
              {hasChildren && isExpanded && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderFolderTree(folder.path)}
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    );
  };
  
  // Render favorites section
  const renderFavorites = () => {
    if (favorites.length === 0) {
      return null;
    }
    
    return (
      <>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Favorites
        </Typography>
        
        <List dense disablePadding>
          {favorites.map(path => {
            const folder = folderStructure.find(f => f.path === path);
            if (!folder) return null;
            
            return (
              <FolderItem
                key={`fav-${path}`}
                button
                depth={0}
                isSelected={path === currentPath}
                onClick={() => onNavigate && onNavigate(path)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FolderIcon color="primary" />
                </ListItemIcon>
                
                <ListItemText primary={folder.name} />
                
                <FolderActions>
                  <Tooltip title="Remove from favorites">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(path);
                      }}
                    >
                      <BookmarkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </FolderActions>
              </FolderItem>
            );
          })}
        </List>
        
        <Divider sx={{ my: 1 }} />
      </>
    );
  };
  
  return (
    <FolderTreeContainer>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Folders
        </Typography>
        
        <Box>
          <Tooltip title="Refresh folders">
            <IconButton
              size="small"
              onClick={refreshFolders}
              disabled={loading || refreshing}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Create root folder">
            <IconButton
              size="small"
              onClick={() => openNewFolderDialog('/')}
              disabled={loading}
            >
              <NewFolderIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Favorites section */}
      {renderFavorites()}
      
      {/* Folder tree */}
      <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
        All Folders
      </Typography>
      
      {folderStructure.length > 0 ? (
        renderFolderTree()
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading folders...' : 'No folders found'}
          </Typography>
          
          {!loading && (
            <Button
              startIcon={<NewFolderIcon />}
              onClick={() => openNewFolderDialog('/')}
              size="small"
              sx={{ mt: 1 }}
            >
              Create Root Folder
            </Button>
          )}
        </Box>
      )}
      
      {/* Context menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.y, left: contextMenu.x }
            : undefined
        }
      >
        {contextMenuTarget && (
          <>
            <MenuItem onClick={() => openNewFolderDialog(contextMenuTarget.path)}>
              <ListItemIcon>
                <NewFolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New Folder</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => toggleFavorite(contextMenuTarget.path)}>
              <ListItemIcon>
                {favorites.includes(contextMenuTarget.path) ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {favorites.includes(contextMenuTarget.path) ? 'Remove from Favorites' : 'Add to Favorites'}
              </ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => openRenameFolderDialog(contextMenuTarget.path)}>
              <ListItemIcon>
                <RenameIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Rename</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => openDeleteFolderDialog(contextMenuTarget.path)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* New folder dialog */}
      <Dialog
        open={newFolderDialog}
        onClose={() => setNewFolderDialog(false)}
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
            error={Boolean(error && newFolderName === '')}
            helperText={error && newFolderName === '' ? error : ''}
            disabled={loading}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Parent: {newFolderParent === '/' ? 'Root' : newFolderParent}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)} disabled={loading}>
            Cancel
          </Button>
          
          <Button
            onClick={createNewFolder}
            color="primary"
            disabled={loading || !newFolderName.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename folder dialog */}
      <Dialog
        open={renameFolderDialog}
        onClose={() => setRenameFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rename Folder</DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
            error={Boolean(error && renameFolderName === '')}
            helperText={error && renameFolderName === '' ? error : ''}
            disabled={loading}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setRenameFolderDialog(false)} disabled={loading}>
            Cancel
          </Button>
          
          <Button
            onClick={renameFolder}
            color="primary"
            disabled={loading || !renameFolderName.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete folder dialog */}
      <Dialog
        open={deleteFolderDialog}
        onClose={() => setDeleteFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Folder</DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete this folder and all its contents?
          </Typography>
          
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDeleteFolderDialog(false)} disabled={loading}>
            Cancel
          </Button>
          
          <Button
            onClick={deleteFolder}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </FolderTreeContainer>
  );
};

export default ImprovedFolderTree;
