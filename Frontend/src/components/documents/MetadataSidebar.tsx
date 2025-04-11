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
  name: string;
  isDirectory: boolean;
  size?: number;
}

interface Metadata extends FileItem {
  modifiedAt: string;
  createdAt?: string;
  accessedAt?: string;
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

interface EnhancedMetadataDisplayProps {
  item: FileItem;
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
  if (!item) return null;

  const handleDownload = (item: FileItem) => {
    if (onDownload) onDownload(item);
  };

  const handleRename = (item: FileItem) => {
    if (onRename) onRename(item, '');
  };

  const handleDelete = (item: FileItem) => {
    if (onDelete) onDelete(item);
  };

  const handleShare = (item: FileItem) => {
    if (onShare) onShare(item);
  };

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
        onDownload={handleDownload}
        onRename={handleRename}
        onDelete={handleDelete}
        onShare={handleShare}
      />
    </MetadataDrawer>
  );
};

export default MetadataSidebar; 