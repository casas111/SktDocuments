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
  Collapse
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
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import fileService from '../../services/fileService';

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
const EnhancedFolderTree = ({
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
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
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
  
  // Process folders into hierarchical structure
  useEffect(() => {
    if (folders.length > 0) {
      const structure = buildFolderStructure(folders);
      setFolderStructure(structure);
    }
  }, [folders]);
  
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
      const folderPath = folder.path || `/${folder.name}`;
      
      // Skip if already in map
      if (folderMap[folderPath]) return;
      
      // Get parent path
      let parentPath = '/';
      if (folderPath !== '/') {
        parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
        if (parentPath === '') parentPath = '/';
      }
      
      // Create folder object
      folderMap[folderPath] = {
        ...folder,
        path: folderPath,
        children: [],
        level: (parentPath.match(/\//g) || []).length,
        parent: parentPath
      };
      
      // Add to parent's children
      if (folderMap[parentPath]) {
        folderMap[parentPath].children.push(folderPath);
      }
    });
    
    // Convert map to array and sort
    const sortedFolders = Object.values(folderMap).sort((a, b) => {
      // Sort by level first
      if (a.level !== b.level) return a.level - b.level;
      
      // Then by parent path
      if (a.parent !== b.parent) return a.parent.localeCompare(b.parent);
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
    
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
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.createFolder(newFolderParent, newFolderName);
      
      if (response.data && response.data.success) {
        setNewFolderDialog(false);
        onFolderCreated && onFolderCreated();
        
        // Auto-expand parent folder
        if (!expandedFolders.includes(newFolderParent)) {
          setExpandedFolders(prev => [...prev, newFolderParent]);
        }
      } else {
        setError(response.data?.error || 'Failed to create folder');
      }
    } catch (err) {
      setError('Error creating folder: ' + err.message);
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
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.renameItem(renameFolderPath, renameFolderName);
      
      if (response.data && response.data.success) {
        setRenameFolderDialog(false);
        onFolderRenamed && onFolderRenamed();
        
        // Update favorites if needed
        if (favorites.includes(renameFolderPath)) {
          const parentPath = renameFolderPath.substring(0, renameFolderPath.lastIndexOf('/'));
          const newPath = `${parentPath === '' ? '/' : parentPath}/${renameFolderName}`;
          setFavorites(prev => prev.map(path => path === renameFolderPath ? newPath : path));
        }
      } else {
        setError(response.data?.error || 'Failed to rename folder');
      }
    } catch (err) {
      setError('Error renaming folder: ' + err.message);
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
      
      const response = await fileService.deleteItem(deleteFolderPath);
      
      if (response.data && response.data.success) {
        setDeleteFolderDialog(false);
        onFolderDeleted && onFolderDeleted();
        
        // Remove from favorites if needed
        if (favorites.includes(deleteFolderPath)) {
          setFavorites(prev => prev.filter(path => path !== deleteFolderPath));
        }
      } else {
        setError(response.data?.error || 'Failed to delete folder');
      }
    } catch (err) {
      setError('Error deleting folder: ' + err.message);
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
      const response = await fileService.moveItem(draggedFolder.path, newPath);
      
      if (response.data && response.data.success) {
        onFolderMoved && onFolderMoved();
        
        // Update favorites if needed
        if (favorites.includes(draggedFolder.path)) {
          setFavorites(prev => prev.map(path => 
            path === draggedFolder.path ? newPath : path
          ));
        }
      }
    } catch (err) {
      setError('Error moving folder: ' + err.message);
    } finally {
      setLoading(false);
      setDraggedFolder(null);
      setDropTarget(null);
      setDropPosition(null);
    }
  };
  
  // Render folder tree recursively
  const renderFolderTree = (parentPath = '/', depth = 0) => {
    const childFolders = folderStructure.filter(folder => folder.parent === parentPath);
    
    if (childFolders.length === 0) return null;
    
    return (
      <List dense disablePadding>
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.includes(folder.path);
          const isSelected = currentPath === folder.path;
          const hasChildren = hasFolderChildren(folder.path);
          const isFavorite = favorites.includes(folder.path);
          const isDragging = draggedFolder && draggedFolder.path === folder.path;
          const isDropTarget = dropTarget && dropTarget.path === folder.path;
          
          return (
            <React.Fragment key={folder.path}>
              <FolderItem
                button
                dense
                depth={depth}
                isSelected={isSelected}
                isDraggingOver={isDropTarget}
                onClick={() => onNavigate && onNavigate(folder.path)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
                draggable={folder.path !== '/'}
                onDragStart={(e) => handleDragStart(e, folder)}
                onDragOver={(e) => handleDragOver(e, folder)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder)}
                sx={{
                  opacity: isDragging ? 0.5 : 1,
                  cursor: 'pointer',
                }}
              >
                {/* Drop indicators */}
                {isDropTarget && (
                  <>
                    <DropIndicator 
                      isVisible={dropPosition === 'above'} 
                      position="top" 
                    />
                    <DropIndicator 
                      isVisible={dropPosition === 'below'} 
                      position="bottom" 
                    />
                  </>
                )}
                
                {/* Expand/collapse icon */}
                {hasChildren ? (
                  <IconButton
                    size="small"
                    onClick={(e) => toggleFolderExpansion(folder.path, e)}
                    sx={{ p: 0.5, mr: 0.5 }}
                  >
                    {isExpanded ? 
                      <ExpandMoreIcon fontSize="small" /> : 
                      <ChevronRightIcon fontSize="small" />
                    }
                  </IconButton>
                ) : (
                  <Box sx={{ width: 28 }} /> // Spacer for alignment
                )}
                
                {/* Folder icon */}
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FolderIcon 
                    fontSize="small" 
                    color={isSelected ? "primary" : "inherit"} 
                  />
                </ListItemIcon>
                
                {/* Folder name */}
                <ListItemText 
                  primary={folder.name} 
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}
                />
                
                {/* Favorite indicator */}
                {isFavorite && (
                  <BookmarkIcon 
                    fontSize="small" 
                    color="primary" 
                    sx={{ mr: 1 }}
                  />
                )}
                
                {/* Folder actions */}
                <FolderActions>
                  <Tooltip title="Add Subfolder">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewFolderDialog(folder.path);
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="More Actions">
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
              </FolderItem>
              
              {/* Render children recursively */}
              {hasChildren && isExpanded && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderFolderTree(folder.path, depth + 1)}
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
    if (favorites.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Favorites
        </Typography>
        
        <List dense disablePadding>
          {favorites.map(favPath => {
            const folder = folderStructure.find(f => f.path === favPath);
            if (!folder) return null;
            
            const isSelected = currentPath === folder.path;
            
            return (
              <FolderItem
                key={folder.path}
                button
                dense
                depth={0}
                isSelected={isSelected}
                onClick={() => onNavigate && onNavigate(folder.path)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <BookmarkIcon 
                    fontSize="small" 
                    color="primary" 
                  />
                </ListItemIcon>
                
                <ListItemText 
                  primary={folder.name} 
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}
                />
                
                <Tooltip title="Remove from Favorites">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(folder.path);
                    }}
                  >
                    <BookmarkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </FolderItem>
            );
          })}
        </List>
        
        <Divider sx={{ my: 1 }} />
      </Box>
    );
  };
  
  return (
    <FolderTreeContainer>
      {/* Header with add root folder button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Folders
        </Typography>
        
        <Tooltip title="Add Root Folder">
          <IconButton
            size="small"
            onClick={() => openNewFolderDialog('/')}
          >
            <NewFolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Favorites section */}
      {renderFavorites()}
      
      {/* Main folder tree */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        renderFolderTree()
      )}
      
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
            error={Boolean(error)}
            helperText={error}
          />
          <Typography variant="caption" color="textSecondary">
            Location: {newFolderParent === '/' ? 'Root' : newFolderParent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button 
            onClick={createNewFolder} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Folder Dialog */}
      <Dialog
        open={renameFolderDialog}
        onClose={() => setRenameFolderDialog(false)}
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Folder Name"
            fullWidth
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
            error={Boolean(error)}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameFolderDialog(false)}>Cancel</Button>
          <Button 
            onClick={renameFolder} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Rename'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Folder Dialog */}
      <Dialog
        open={deleteFolderDialog}
        onClose={() => setDeleteFolderDialog(false)}
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this folder and all its contents? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFolderDialog(false)}>Cancel</Button>
          <Button 
            onClick={deleteFolder} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        {contextMenuTarget && contextMenuTarget.path !== '/' && (
          <MenuItem onClick={() => openRenameFolderDialog(contextMenuTarget.path)}>
            <ListItemIcon>
              <RenameIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => openNewFolderDialog(contextMenuTarget ? contextMenuTarget.path : '/')}>
          <ListItemIcon>
            <NewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Subfolder</ListItemText>
        </MenuItem>
        
        {contextMenuTarget && contextMenuTarget.path !== '/' && (
          <>
            <MenuItem onClick={() => toggleFavorite(contextMenuTarget.path)}>
              <ListItemIcon>
                {favorites.includes(contextMenuTarget.path) ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {favorites.includes(contextMenuTarget.path) ? 
                  'Remove from Favorites' : 
                  'Add to Favorites'
                }
              </ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => openDeleteFolderDialog(contextMenuTarget.path)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </FolderTreeContainer>
  );
};

export default EnhancedFolderTree;
