import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Button,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import fileService from '../../services/fileService';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column'
}));

const FileViewer = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Decode the fileId to get the actual file path
  const decodedFilePath = fileId ? decodeURIComponent(atob(fileId)) : null;
  
  useEffect(() => {
    const loadFileData = async () => {
      if (!decodedFilePath) {
        setError('Invalid file path');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Get file metadata
        const response = await fileService.getMetadata(decodedFilePath);
        
        if (response.data && response.data.success) {
          setFile(response.data.data);
        } else {
          setError(response.data?.error || 'Failed to load file data');
        }
      } catch (err) {
        setError('Error loading file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadFileData();
  }, [decodedFilePath]);
  
  const handleDownload = async () => {
    if (!file) return;
    
    try {
      await fileService.downloadFile(decodedFilePath);
    } catch (err) {
      setError('Error downloading file: ' + err.message);
    }
  };
  
  const handleBackToDrive = () => {
    // Extract the directory path from the file path
    const pathParts = decodedFilePath.split('/');
    pathParts.pop(); // Remove the filename
    const directoryPath = pathParts.join('/') || '/';
    
    // Navigate back to the drive with the correct directory path
    navigate(`/drive${directoryPath === '/' ? '' : directoryPath}`);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Generate breadcrumb items from file path
  const getBreadcrumbItems = () => {
    if (!decodedFilePath) return [];
    
    const pathParts = decodedFilePath.split('/').filter(Boolean);
    const fileName = pathParts.pop(); // Remove and store the filename
    
    // Build array of path objects with cumulative paths
    const pathObjects = pathParts.map((segment, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/');
      return { name: segment, path };
    });
    
    // Add root path and filename
    return [
      { name: 'Home', path: '/' },
      ...pathObjects,
      { name: fileName, path: null } // Filename is not clickable
    ];
  };
  
  return (
    <StyledPaper>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBackToDrive} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {getBreadcrumbItems().map((item, index) => {
              const isLast = index === getBreadcrumbItems().length - 1;
              
              return isLast ? (
                <Typography key={index} color="text.primary" fontWeight="medium">
                  {item.name}
                </Typography>
              ) : (
                <Link
                  key={index}
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/drive${item.path === '/' ? '' : item.path}`);
                  }}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {index === 0 ? <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> : null}
                  {item.name}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!file}
        >
          Download
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : file ? (
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h5" gutterBottom>
              {file.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file.mimeType || 'Unknown type'} • {formatFileSize(file.size || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modified: {formatDate(file.modifiedAt)}
            </Typography>
            {file.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(file.createdAt)}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
            {/* File preview would go here - for now just show a message */}
            <Typography variant="body1">
              File preview not available. Use the download button to access this file.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography>File not found</Typography>
        </Box>
      )}
    </StyledPaper>
  );
};

export default FileViewer;
