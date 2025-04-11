import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  InsertDriveFile as FileIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
  Folder as FolderIcon,
  CalendarToday as DateIcon,
  Storage as SizeIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyPathIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import fileService from '../../services/fileService';

// Types and Interfaces
interface FileItem {
  name: string;
  isDirectory: boolean;
  size?: number;
}

interface Version {
  version: string;
  modifiedAt: string;
  modifiedBy?: string;
}

interface Permissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  owner: boolean;
}

interface Metadata {
  name: string;
  isDirectory: boolean;
  mimeType?: string;
  size?: number;
  itemCount?: number;
  createdAt: string;
  modifiedAt: string;
  accessedAt?: string;
  path?: string;
  attributes?: Record<string, any>;
  permissions?: Permissions;
  contents?: FileItem[];
}

interface EnhancedMetadataDisplayProps {
  item: FileItem;
  currentPath: string;
  onDownload?: (metadata: Metadata) => void;
  onRename?: (metadata: Metadata) => void;
  onDelete?: (metadata: Metadata) => void;
  onShare?: (metadata: Metadata) => void;
}

// Styled components for enhanced UI
const MetadataContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const MetadataHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const FileTypeIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.primary.light,
  marginRight: theme.spacing(2),
  color: theme.palette.primary.contrastText,
}));

const MetadataSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(1.5),
  alignItems: 'flex-start',
}));

const MetadataLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  width: 120,
  flexShrink: 0,
}));

const MetadataValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1, 0.5),
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const EnhancedMetadataDisplay: React.FC<EnhancedMetadataDisplayProps> = ({
  item,
  currentPath,
  onDownload,
  onRename,
  onDelete,
  onShare
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<Version[]>([]);
  
  // Load metadata on item change
  useEffect(() => {
    if (item) {
      loadMetadata();
    }
  }, [item]);
  
  // Load metadata from API
  const loadMetadata = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const itemPath = `${currentPath === '/' ? '' : currentPath}/${item.name}`;
      const response = await fileService.getMetadata(itemPath);
      
      if (response.data && response.data.success) {
        setMetadata(response.data.data);
        
        // Load version history if available
        if (response.data.data.versions) {
          setVersionHistory(response.data.data.versions);
        }
      } else {
        setError(response.data?.error || 'Failed to load metadata');
      }
    } catch (err) {
      setError('Error loading metadata: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Copy file path to clipboard
  const copyPathToClipboard = (): void => {
    const itemPath = `${currentPath === '/' ? '' : currentPath}/${item.name}`;
    navigator.clipboard.writeText(itemPath);
  };
  
  // Get appropriate icon based on file type
  const getFileTypeIcon = (): React.ReactNode => {
    if (!metadata) return <FileIcon sx={{ fontSize: 36 }} />;
    
    if (metadata.isDirectory) {
      return <FolderIcon sx={{ fontSize: 36 }} />;
    }
    
    const fileType = metadata.mimeType || '';
    const fileName = metadata.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <ImageIcon sx={{ fontSize: 36 }} />;
    } else if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return <AudioIcon sx={{ fontSize: 36 }} />;
    } else if (fileType.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov'].includes(extension)) {
      return <VideoIcon sx={{ fontSize: 36 }} />;
    } else if (fileType.includes('pdf') || extension === 'pdf') {
      return <PdfIcon sx={{ fontSize: 36 }} />;
    } else if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return <DocumentIcon sx={{ fontSize: 36 }} />;
    } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
      return <ArchiveIcon sx={{ fontSize: 36 }} />;
    } else if (['js', 'html', 'css', 'py', 'java', 'c', 'cpp', 'php', 'json', 'xml'].includes(extension)) {
      return <CodeIcon sx={{ fontSize: 36 }} />;
    } else {
      return <FileIcon sx={{ fontSize: 36 }} />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Get file type description
  const getFileTypeDescription = (): string => {
    if (!metadata) return 'Unknown';
    
    if (metadata.isDirectory) {
      return 'Folder';
    }
    
    const fileType = metadata.mimeType || '';
    const fileName = metadata.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (fileType) {
      return fileType;
    } else if (extension) {
      return extension.toUpperCase() + ' File';
    } else {
      return 'Unknown';
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  // Render no item state
  if (!item || !metadata) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Select a file or folder to view details</Typography>
      </Box>
    );
  }
  
  return (
    <MetadataContainer>
      {/* Header with file icon and name */}
      <MetadataHeader>
        <FileTypeIcon>
          {getFileTypeIcon()}
        </FileTypeIcon>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            {metadata.name}
          </Typography>
          
          <Chip 
            label={getFileTypeDescription()} 
            size="small" 
            color={metadata.isDirectory ? "primary" : "default"}
          />
        </Box>
      </MetadataHeader>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
        {!metadata.isDirectory && (
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload && onDownload(metadata)}
          >
            Download
          </ActionButton>
        )}
        
        <ActionButton
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onRename && onRename(metadata)}
        >
          Rename
        </ActionButton>
        
        <ActionButton
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={() => onShare && onShare(metadata)}
        >
          Share
        </ActionButton>
        
        <ActionButton
          variant="outlined"
          startIcon={<CopyPathIcon />}
          onClick={copyPathToClipboard}
        >
          Copy Path
        </ActionButton>
        
        <ActionButton
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete && onDelete(metadata)}
        >
          Delete
        </ActionButton>
      </Box>
      
      {/* Tabs for different metadata sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="metadata tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Details" />
          <Tab label="History" disabled={!versionHistory.length} />
          {metadata.isDirectory && <Tab label="Contents" />}
        </Tabs>
      </Box>
      
      {/* Details Tab */}
      {activeTab === 0 && (
        <>
          {/* Basic Information */}
          <MetadataSection>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Basic Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid component="div" xs={12} sm={6}>
                <MetadataItem>
                  <MetadataLabel variant="body2">Name:</MetadataLabel>
                  <MetadataValue variant="body2">{metadata.name}</MetadataValue>
                </MetadataItem>
                
                <MetadataItem>
                  <MetadataLabel variant="body2">Type:</MetadataLabel>
                  <MetadataValue variant="body2">{getFileTypeDescription()}</MetadataValue>
                </MetadataItem>
                
                {!metadata.isDirectory && (
                  <MetadataItem>
                    <MetadataLabel variant="body2">Size:</MetadataLabel>
                    <MetadataValue variant="body2">{formatFileSize(metadata.size || 0)}</MetadataValue>
                  </MetadataItem>
                )}
                
                {metadata.isDirectory && metadata.itemCount !== undefined && (
                  <MetadataItem>
                    <MetadataLabel variant="body2">Contents:</MetadataLabel>
                    <MetadataValue variant="body2">{metadata.itemCount} items</MetadataValue>
                  </MetadataItem>
                )}
              </Grid>
              
              <Grid component="div" xs={12} sm={6}>
                <MetadataItem>
                  <MetadataLabel variant="body2">Created:</MetadataLabel>
                  <MetadataValue variant="body2">{formatDate(metadata.createdAt)}</MetadataValue>
                </MetadataItem>
                
                <MetadataItem>
                  <MetadataLabel variant="body2">Modified:</MetadataLabel>
                  <MetadataValue variant="body2">{formatDate(metadata.modifiedAt)}</MetadataValue>
                </MetadataItem>
                
                {metadata.accessedAt && (
                  <MetadataItem>
                    <MetadataLabel variant="body2">Accessed:</MetadataLabel>
                    <MetadataValue variant="body2">{formatDate(metadata.accessedAt)}</MetadataValue>
                  </MetadataItem>
                )}
              </Grid>
            </Grid>
          </MetadataSection>
          
          {/* Location Information */}
          <MetadataSection>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Location
            </Typography>
            
            <MetadataItem>
              <MetadataLabel variant="body2">Path:</MetadataLabel>
              <MetadataValue variant="body2">{metadata.path || currentPath}</MetadataValue>
            </MetadataItem>
          </MetadataSection>
          
          {/* Additional Metadata */}
          {metadata.attributes && Object.keys(metadata.attributes).length > 0 && (
            <MetadataSection>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Additional Information
              </Typography>
              
              {Object.entries(metadata.attributes).map(([key, value]) => (
                <MetadataItem key={key}>
                  <MetadataLabel variant="body2">{key}:</MetadataLabel>
                  <MetadataValue variant="body2">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </MetadataValue>
                </MetadataItem>
              ))}
            </MetadataSection>
          )}
          
          {/* Permissions */}
          {metadata.permissions && (
            <MetadataSection>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Permissions
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {metadata.permissions.read && (
                  <Chip label="Read" size="small" color="primary" variant="outlined" />
                )}
                {metadata.permissions.write && (
                  <Chip label="Write" size="small" color="primary" variant="outlined" />
                )}
                {metadata.permissions.execute && (
                  <Chip label="Execute" size="small" color="primary" variant="outlined" />
                )}
                {metadata.permissions.owner && (
                  <Chip label="Owner" size="small" color="primary" variant="outlined" />
                )}
              </Box>
            </MetadataSection>
          )}
        </>
      )}
      
      {/* History Tab */}
      {activeTab === 1 && versionHistory.length > 0 && (
        <MetadataSection>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Version History
          </Typography>
          
          <List>
            {versionHistory.map((version, index) => (
              <ListItem 
                key={index}
                secondaryAction={
                  <Tooltip title="Restore this version">
                    <IconButton edge="end" aria-label="restore">
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemIcon>
                  <DateIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Version ${version.version}`}
                  secondary={`Modified on ${formatDate(version.modifiedAt)} by ${version.modifiedBy || 'Unknown'}`}
                />
              </ListItem>
            ))}
          </List>
        </MetadataSection>
      )}
      
      {/* Contents Tab (for directories) */}
      {activeTab === 2 && metadata.isDirectory && (
        <MetadataSection>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Folder Contents
          </Typography>
          
          {metadata.contents ? (
            <List>
              {metadata.contents.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {item.isDirectory ? <FolderIcon /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={item.isDirectory ? 'Folder' : formatFileSize(item.size || 0)}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">
              No content information available
            </Typography>
          )}
        </MetadataSection>
      )}
    </MetadataContainer>
  );
};

export default EnhancedMetadataDisplay; 