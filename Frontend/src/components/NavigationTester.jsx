import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

// Test component to verify navigation between sections
const NavigationTester = () => {
  const navigate = useNavigate();

  const testRoutes = [
    { path: '/workflow', name: 'Workflow Home' },
    { path: '/workflow/123', name: 'Specific Workflow' },
    { path: '/drive', name: 'Documents Home' },
    { path: '/drive/folder/123', name: 'Specific Folder' },
    { path: '/file/test-file-id', name: 'File Viewer' },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Navigation Test Panel
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use these buttons to test navigation between different sections of the application.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {testRoutes.map((route) => (
          <Button 
            key={route.path}
            variant="outlined"
            size="small"
            onClick={() => navigate(route.path)}
          >
            {route.name}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default NavigationTester;
