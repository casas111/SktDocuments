import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Drawer,
  IconButton,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import EnhancedMetadataDisplay from './EnhancedMetadataDisplay';
import fileService from '../../services/fileService';

// Styled components for enhanced UI
const MetadataDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '400px',
    maxWidth: '100%',
    padding: theme.spacing(2),
    boxSizing: 'border-box',
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 2, 1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

/**
 * Metadata Sidebar Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Callback when drawer is closed
 * @param {Object} props.item - File or folder item to display metadata for
 * @param {string} props.currentPath - Current directory path
 * @param {Function} props.onDownload - Callback when download is requested
 * @param {Function} props.onRename - Callback when rename is requested
 * @param {Function} props.onDelete - Callback when delete is requested
 * @param {Function} props.onShare - Callback when share is requested
 */
const MetadataSidebar = ({
  open,
  onClose,
  item,
  currentPath,
  onDownload,
  onRename,
  onDelete,
  onShare
}) => {
  return (
    <MetadataDrawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <DrawerHeader>
        <Typography variant="h6">File Information</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DrawerHeader>
      
      <EnhancedMetadataDisplay
        item={item}
        currentPath={currentPath}
        onDownload={onDownload}
        onRename={onRename}
        onDelete={onDelete}
        onShare={onShare}
      />
    </MetadataDrawer>
  );
};

export default MetadataSidebar;
