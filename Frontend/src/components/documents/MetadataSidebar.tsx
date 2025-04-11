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

interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  modifiedAt: string;
  createdAt?: string;
  owner?: string;
  path: string;
}

interface MetadataSidebarProps {
  open: boolean;
  onClose: () => void;
  item: FileItem | null;
  currentPath: string;
  onDownload?: (item: FileItem) => void;
  onRename?: (item: FileItem, newName: string) => void;
  onDelete?: (item: FileItem) => void;
  onShare?: (item: FileItem) => void;
}

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
 */
const MetadataSidebar: React.FC<MetadataSidebarProps> = ({
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