import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigationTester from '../NavigationTester';

// DocumentsWrapper component to ensure DocumentsDrive maintains its context
const DocumentsWrapper = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract path information
  const path = location.pathname;
  const isFileView = path.startsWith('/file/');
  const fileId = isFileView ? path.split('/file/')[1] : null;
  
  // Create breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="documents navigation"
        sx={{ mb: 2 }}
      >
        <MuiLink 
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/drive')}
          sx={{ cursor: 'pointer' }}
        >
          Documents
        </MuiLink>
        
        {isFileView && (
          <Typography color="text.primary">
            File Viewer
          </Typography>
        )}
      </Breadcrumbs>
    );
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderBreadcrumbs()}
      
      {/* Include navigation tester in development */}
      <NavigationTester />
      
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DocumentsWrapper;
