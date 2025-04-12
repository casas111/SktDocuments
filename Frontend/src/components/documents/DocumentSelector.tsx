import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  InputBase,
  IconButton,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import styled from '@emotion/styled';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Styled components
const DocumentSelectorContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const SearchBar = styled(Box)`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
`;

const BreadcrumbsContainer = styled(Box)`
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
`;

const DocumentList = styled(Box)`
  flex: 1;
  overflow-y: auto;
  background-color: white;
`;

const DocumentCard = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  
  &:hover {
    border-color: #2196f3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const DocumentCardContent = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const FileIconContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
`;

// Types
interface FileItem {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentSelectorProps {
  onSelect: (document: FileItem) => void;
  fileTypeFilter?: string[];
  initialPath?: string;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  onSelect,
  fileTypeFilter,
  initialPath = '/'
}) => {
  const [contents, setContents] = useState<FileItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch directory contents
  useEffect(() => {
    fetchDirectoryContents(currentPath);
  }, [currentPath]);
  
  // Filter contents based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContents(contents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContents(
        contents.filter(item => 
          item.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, contents]);
  
  const fetchDirectoryContents = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.FILES}/directory`, {
        params: { path }
      });
      
      if (response.data.success) {
        // Apply file type filter if provided
        if (fileTypeFilter && fileTypeFilter.length > 0) {
          const filtered = response.data.contents.filter((item: FileItem) => 
            item.type === 'folder' || 
            fileTypeFilter.includes(item.mimeType || '')
          );
          setContents(filtered);
        } else {
          setContents(response.data.contents);
        }
      } else {
        setError(response.data.error || 'Failed to load directory contents');
      }
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      setError('Error loading directory contents. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectDocument = (document: FileItem) => {
    if (document.type === 'folder') {
      setCurrentPath(document.path);
    } else {
      onSelect(document);
    }
  };
  
  const navigateToParent = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`;
    setCurrentPath(parentPath);
  };
  
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <FolderIcon color="primary" />;
    }
    
    const mimeType = file.mimeType || '';
    
    if (mimeType.includes('pdf')) {
      return <PictureAsPdfIcon color="error" />;
    } else if (mimeType.includes('image')) {
      return <ImageIcon color="success" />;
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <DescriptionIcon color="info" />;
    } else if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) {
      return <CodeIcon color="secondary" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
    }
  };
  
  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigateToFolder('/');
          }}
        >
          Home
        </Link>
        
        {pathParts.map((part, index) => {
          const path = `/${pathParts.slice(0, index + 1).join('/')}`;
          
          return (
            <Link
              key={path}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigateToFolder(path);
              }}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  // Render file size
  const renderFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  return (
    <DocumentSelectorContainer>
      <SearchBar>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search files and folders"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </SearchBar>
      
      <BreadcrumbsContainer>
        {renderBreadcrumbs()}
        
        {fileTypeFilter && fileTypeFilter.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={fileTypeFilter.includes('application/pdf') ? "Showing PDF files only" : "Filtered view"} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        )}
      </BreadcrumbsContainer>
      
      <DocumentList>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : filteredContents.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              {searchQuery.trim() 
                ? 'No matching files or folders found' 
                : fileTypeFilter && fileTypeFilter.length > 0
                  ? 'No matching files found with the selected filter'
                  : 'This folder is empty'}
            </Alert>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {currentPath !== '/' && (
              <Box sx={{ mb: 2 }}>
                <ListItem 
                  component="div"
                  onClick={navigateToParent}
                  sx={{ 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    mb: 1,
                    bgcolor: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon>
                    <NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />
                  </ListItemIcon>
                  <ListItemText primary="Go back" secondary="Parent directory" />
                </ListItem>
              </Box>
            )}
            
            <Grid container spacing={2}>
              {/* Folders first */}
              {filteredContents
                .filter(item => item.type === 'folder')
                .map((folder) => (
                  <Grid item xs={6} sm={4} md={3} key={folder.path}>
                    <DocumentCard onClick={() => handleSelectDocument(folder)}>
                      <DocumentCardContent>
                        <FileIconContainer>
                          {getFileIcon(folder)}
                        </FileIconContainer>
                        <Typography variant="body2" align="center" noWrap title={folder.name}>
                          {folder.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" align="center">
                          Folder
                        </Typography>
                      </DocumentCardContent>
                    </DocumentCard>
                  </Grid>
                ))}
              
              {/* Then files */}
              {filteredContents
                .filter(item => item.type !== 'folder')
                .map((file) => (
                  <Grid item xs={6} sm={4} md={3} key={file.path}>
                    <Tooltip title={file.name}>
                      <DocumentCard onClick={() => handleSelectDocument(file)}>
                        <DocumentCardContent>
                          <FileIconContainer>
                            {getFileIcon(file)}
                          </FileIconContainer>
                          <Typography variant="body2" align="center" noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" align="center">
                            {renderFileSize(file.size || 0)}
                          </Typography>
                        </DocumentCardContent>
                      </DocumentCard>
                    </Tooltip>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </DocumentList>
    </DocumentSelectorContainer>
  );
};

export default DocumentSelector;
