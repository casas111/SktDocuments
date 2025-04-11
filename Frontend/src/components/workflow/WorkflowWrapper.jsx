import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigationTester from '../NavigationTester';

// WorkflowWrapper component to ensure WorkflowBuilder maintains its context
const WorkflowWrapper = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract workflow ID from URL if present
  const workflowId = location.pathname.startsWith('/workflow/') 
    ? location.pathname.split('/workflow/')[1] 
    : null;
  
  // Create breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="workflow navigation"
        sx={{ mb: 2 }}
      >
        <MuiLink 
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/workflow')}
          sx={{ cursor: 'pointer' }}
        >
          Workflows
        </MuiLink>
        
        {workflowId && (
          <Typography color="text.primary">
            Workflow {workflowId}
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

export default WorkflowWrapper;
