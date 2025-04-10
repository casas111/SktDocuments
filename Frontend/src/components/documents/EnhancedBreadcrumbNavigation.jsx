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
  Breadcrumbs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Folder as FolderIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

// Styled components for enhanced UI
const BreadcrumbContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 4,
  },
}));

const BreadcrumbItem = styled(Button)(({ theme, isLast }) => ({
  textTransform: 'none',
  padding: theme.spacing(0.5, 1),
  minWidth: 'auto',
  fontWeight: isLast ? 'bold' : 'normal',
  color: isLast ? theme.palette.text.primary : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: isLast ? 'transparent' : theme.palette.action.hover,
  },
  pointerEvents: isLast ? 'none' : 'auto',
}));

const BreadcrumbSeparator = styled(NavigateNextIcon)(({ theme }) => ({
  fontSize: 16,
  color: theme.palette.text.secondary,
  margin: theme.spacing(0, 0.5),
}));

/**
 * Enhanced Breadcrumb Navigation Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPath - Current active path
 * @param {Function} props.onNavigate - Callback when navigating to a path
 */
const EnhancedBreadcrumbNavigation = ({
  currentPath = '/',
  onNavigate
}) => {
  // Parse path into segments
  const getPathSegments = () => {
    const segments = currentPath.split('/').filter(Boolean);
    
    // Build array of path objects with cumulative paths
    const pathObjects = segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      return { name: segment, path };
    });
    
    // Add root path
    return [{ name: 'Home', path: '/' }, ...pathObjects];
  };
  
  const pathSegments = getPathSegments();
  
  return (
    <BreadcrumbContainer>
      <Breadcrumbs
        separator={<BreadcrumbSeparator />}
        aria-label="breadcrumb navigation"
        sx={{ flexWrap: 'nowrap' }}
      >
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          
          return (
            <BreadcrumbItem
              key={segment.path}
              isLast={isLast}
              onClick={() => !isLast && onNavigate(segment.path)}
              startIcon={index === 0 ? <HomeIcon fontSize="small" /> : null}
            >
              {segment.name}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </BreadcrumbContainer>
  );
};

export default EnhancedBreadcrumbNavigation;
