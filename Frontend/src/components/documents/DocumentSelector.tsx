import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  InputBase,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import styled from '@emotion/styled';
import unifiedDocumentService from '../../services/unifiedDocumentService';

const DocumentSelectorContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
`;

const SearchBar = styled(Paper)`
  padding: 2px 4px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
`;

const BreadcrumbsContainer = styled(Box)`
  padding: 8px 0;
  margin-bottom: 8px;
`;

const DocumentList = styled(Box)`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
`;

const DocumentCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DocumentCardContent = styled(CardContent)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 12px !important;
  
  &:last-child {
    padding-bottom: 12px !important;
  }
`;

const FileIconContainer = styled(Box)`
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
`;

interface DocumentSelectorProps {
  onSelect: (document: any) => void;
  fileTypeFilter?: string[];
  initialPath?: string;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onSelect, 
  fileTypeFilter,
  initialPath = '/' 
}) => {
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load directory contents
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await unifiedDocumentService.getDirectoryContents(currentPath);
        
        if (response.success && response.data) {
          setContents(response.data);
          
          // Apply file type filter if provided
          if (fileTypeFilter && fileTypeFilter.length > 0) {
            const filtered = response.data.filter(item => 
              item.type === 'folder' || 
              fileTypeFilter.includes(item.mimeType || '')
            );
            setFilteredContents(filtered);
          } else {
            setFilteredContents(response.data);
          }
        } else {
          setError('Failed to load directory contents');
          setContents([]);
          setFilteredContents([]);
        }
      } catch (err) {
        console.error('Error fetching directory contents:', err);
        setError('Error loading files. Please try again.');
        setContents([]);
        setFilteredContents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, [currentPath, fileTypeFilter]);
  
  // Filter contents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If file type filter is applied, use the already filtered contents
      setFilteredContents(contents);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    let filtered = contents.filter(item => 
      item.name.toLowerCase().includes(query)
    );
    
    // Apply file type filter if provided
    if (fileTypeFilter && fileTypeFilter.length > 0) {
      filtered = filtered.filter(item => 
        item.type === 'folder' || 
        fileTypeFilter.includes(item.mimeType || '')
      );
    }
    
    setFilteredContents(filtered);
  }, [searchQuery, contents, fileTypeFilter]);
  
  // Navigate to a folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSearchQuery('');
  };
  
  // Navigate to parent folder
  const navigateToParent = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`;
    
    setCurrentPath(parentPath);
    setSearchQuery('');
  };
  
  // Handle document selection
  const handleSelectDocument = (document: any) => {
    if (document.type === 'folder') {
      navigateToFolder(document.path);
    } else {
      onSelect(document);
    }
  };
  
  // Get file icon based on mime type
  const getFileIcon = (item: any) => {
    if (item.type === 'folder') {
      return <FolderIcon sx={{ fontSize: 40, color: '#FFC107' }} />;
    }
    
    const mimeType = item.mimeType || '';
    
    if (mimeType.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 40, color: '#4CAF50' }} />;
    } else if (mimeType === 'application/pdf') {
      return <PictureAsPdfIcon sx={{ fontSize: 40, color: '#F44336' }} />;
    } else if (mimeType.includes('document') || mimeType.includes('text')) {
      return <DescriptionIcon sx={{ fontSize: 40, color: '#2196F3' }} />;
    } else {
      return <InsertDriveFileIcon sx={{ fontSize: 40, color: '#9E9E9E' }} />;
    }
  };
  
  // Generate breadcrumbs
  const renderBreadcrumbs = () => {
    if (currentPath === '/') {
      return (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Root
          </Typography>
        </Breadcrumbs>
      );
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigateToFolder('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Root
        </Link>
        
        {pathParts.map((part, index) => {
          const path = `/${pathParts.slice(0, index + 1).join('/')}`;
          const isLast = index === pathParts.length - 1;
          
          return isLast ? (
            <Typography key={path} color="text.primary">
              {part}
            </Typography>
          ) : (
            <Link
              key={path}
              underline="hover"
              color="inherit"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigateToFolder(path)}
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
                  button 
                  onClick={navigateToParent}
                  sx={{ 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    mb: 1,
                    bgcolor: '#f5f5f5'
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
