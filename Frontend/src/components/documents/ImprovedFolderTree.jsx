import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  ListItemSecondaryAction,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import unifiedDocumentService from '../../services/unifiedDocumentService';
import EnhancedFolderManager from './EnhancedFolderManager';

// Styled components
const FolderTreeContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

/**
 * ImprovedFolderTree Component
 * 
 * This component displays a hierarchical folder structure and allows
 * navigation and folder management using the unified document service.
 */
const ImprovedFolderTree = ({ 
  currentPath = '/',
  onNavigate,
  onRefresh
}) => {
  // State
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  
  // Load folders on mount and when refreshed
  useEffect(() => {
    loadFolders();
  }, []);
  
  // Load all folders
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await unifiedDocumentService.getAllFolders();
      
      if (response.success && response.data) {
        setFolders(response.data);
        
        // Auto-expand folders in the current path
        if (currentPath && currentPath !== '/') {
          const pathParts = currentPath.split('/').filter(Boolean);
          let currentPathSegment = '';
          
          const newExpandedFolders = { ...expandedFolders };
          
          for (const part of pathParts) {
            currentPathSegment += '/' + part;
            newExpandedFolders[currentPathSegment] = true;
          }
          
          setExpandedFolders(newExpandedFolders);
        }
      } else {
        setError(response.error || 'Failed to load folders');
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle folder expansion
  const toggleFolderExpand = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Navigate to folder
  const navigateToFolder = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };
  
  // Handle folder creation
  const handleFolderCreated = () => {
    // Refresh folder list
    loadFolders();
    
    // Notify parent if needed
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Open context menu
  const handleContextMenu = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
    
    setContextMenuTarget(folder);
  };
  
  // Close context menu
  const handleContextMenuClose = () => {
    setContextMenu(null);
    setContextMenuTarget(null);
  };
  
  // Build folder tree recursively
  const buildFolderTree = (parentPath = '/') => {
    const childFolders = folders.filter(folder => 
      folder.parent === parentPath || 
      (parentPath === '/' && folder.parent === 'root')
    );
    
    if (childFolders.length === 0) {
      return null;
    }
    
    return (
      <List dense disablePadding>
        {childFolders.map(folder => {
          const isExpanded = expandedFolders[folder.path] || false;
          const isCurrentFolder = currentPath === folder.path;
          const hasChildren = folders.some(f => f.parent === folder.path);
          
          return (
            <React.Fragment key={folder.path}>
              <ListItem 
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => handleContextMenu(e, folder)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ 
                  pl: parentPath === '/' ? 0 : 2,
                  backgroundColor: isCurrentFolder ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, folder)}
              >
                <ListItemButton
                  onClick={() => navigateToFolder(folder.path)}
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isCurrentFolder ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={folder.name} />
                  {hasChildren && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpand(folder.path);
                      }}
                    >
                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {buildFolderTree(folder.path)}
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    );
  };
  
  return (
    <FolderTreeContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Folders</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh folders">
            <IconButton size="small" onClick={loadFolders}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      {/* Root folder */}
      <ListItem 
        disablePadding
        sx={{ 
          backgroundColor: currentPath === '/' ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: 'action.hover'
          },
          borderRadius: 1
        }}
      >
        <ListItemButton
          onClick={() => navigateToFolder('/')}
          dense
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {currentPath === '/' ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary="Root" />
        </ListItemButton>
      </ListItem>
      
      {/* Folder creation component */}
      <Box sx={{ mt: 1, mb: 2 }}>
        <EnhancedFolderManager 
          currentPath={currentPath}
          onFolderCreated={handleFolderCreated}
        />
      </Box>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Typography color="error" variant="body2" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Folder tree */}
      {!loading && folders.length > 0 && buildFolderTree()}
      
      {/* Empty state */}
      {!loading && folders.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
          No folders found
        </Typography>
      )}
      
      {/* Context menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        <MenuItem onClick={() => {
          navigateToFolder(contextMenuTarget?.path);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Folder</ListItemText>
        </MenuItem>
      </Menu>
    </FolderTreeContainer>
  );
};

export default ImprovedFolderTree;
