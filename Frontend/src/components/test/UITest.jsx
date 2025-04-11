import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import theme from '../../theme';
import EnhancedDocumentDrive from '../documents/EnhancedDocumentDrive';
import EnhancedDocumentExplorer from '../documents/EnhancedDocumentExplorer';
import EnhancedFolderManager from '../documents/EnhancedFolderManager';
import EnhancedTagManager from '../documents/EnhancedTagManager';

// Test component to showcase all the enhanced UI components
const UITest = () => {
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('documentDrive');
  
  // Mock data for testing
  const mockDocuments = [
    {
      id: '1',
      originalName: 'Project Proposal.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 1024 * 2.5, // 2.5 MB
      uploadDate: new Date(2023, 3, 15),
      starred: true,
      tags: [
        { id: '1', name: 'Important', color: '#f44336' },
        { id: '2', name: 'Project', color: '#2196f3' }
      ]
    },
    {
      id: '2',
      originalName: 'Team Photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 1024 * 3.2, // 3.2 MB
      uploadDate: new Date(2023, 4, 10),
      starred: false,
      tags: [
        { id: '3', name: 'Team', color: '#4caf50' }
      ]
    },
    {
      id: '3',
      originalName: 'Financial Report Q2.xlsx',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1024 * 1024 * 1.8, // 1.8 MB
      uploadDate: new Date(2023, 5, 5),
      starred: true,
      tags: [
        { id: '4', name: 'Finance', color: '#ff9800' },
        { id: '5', name: 'Quarterly', color: '#9c27b0' }
      ]
    },
    {
      id: '4',
      originalName: 'Product Demo.mp4',
      mimetype: 'video/mp4',
      size: 1024 * 1024 * 15.7, // 15.7 MB
      uploadDate: new Date(2023, 5, 20),
      starred: false,
      tags: [
        { id: '6', name: 'Marketing', color: '#e91e63' }
      ]
    }
  ];

  const mockFolders = [
    {
      id: 'f1',
      name: 'Projects',
      itemCount: 12,
      level: 0,
      path: '/Projects',
      children: [
        {
          id: 'f1-1',
          name: 'Project A',
          itemCount: 5,
          level: 1,
          path: '/Projects/Project A',
          children: []
        },
        {
          id: 'f1-2',
          name: 'Project B',
          itemCount: 7,
          level: 1,
          path: '/Projects/Project B',
          children: []
        }
      ]
    },
    {
      id: 'f2',
      name: 'Marketing Materials',
      itemCount: 8,
      level: 0,
      path: '/Marketing Materials',
      children: []
    },
    {
      id: 'f3',
      name: 'Financial Reports',
      itemCount: 5,
      level: 0,
      path: '/Financial Reports',
      children: [
        {
          id: 'f3-1',
          name: 'Q1 Reports',
          itemCount: 2,
          level: 1,
          path: '/Financial Reports/Q1 Reports',
          children: []
        },
        {
          id: 'f3-2',
          name: 'Q2 Reports',
          itemCount: 3,
          level: 1,
          path: '/Financial Reports/Q2 Reports',
          children: []
        }
      ]
    }
  ];

  const mockTags = [
    { id: '1', name: 'Important', color: '#f44336' },
    { id: '2', name: 'Project', color: '#2196f3' },
    { id: '3', name: 'Team', color: '#4caf50' },
    { id: '4', name: 'Finance', color: '#ff9800' },
    { id: '5', name: 'Quarterly', color: '#9c27b0' },
    { id: '6', name: 'Marketing', color: '#e91e63' }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'documentDrive':
        return <EnhancedDocumentDrive />;
      case 'documentExplorer':
        return (
          <Box sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
            <EnhancedDocumentExplorer 
              documents={mockDocuments}
              folders={mockFolders}
              tags={mockTags}
              onDocumentClick={(id) => console.log(`Document clicked: ${id}`)}
              onFolderClick={(id) => console.log(`Folder clicked: ${id}`)}
              onCreateFolder={() => console.log('Create folder clicked')}
              onTagClick={(id) => console.log(`Tag clicked: ${id}`)}
              onStarDocument={(id) => console.log(`Star document: ${id}`)}
              onDeleteDocument={(id) => console.log(`Delete document: ${id}`)}
              onDownloadDocument={(id) => console.log(`Download document: ${id}`)}
              onEditDocument={(id) => console.log(`Edit document: ${id}`)}
            />
          </Box>
        );
      case 'folderManager':
        return (
          <Box sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
            <EnhancedFolderManager 
              folders={mockFolders}
              onFolderSelect={(folder) => console.log('Folder selected:', folder)}
              onFolderCreate={(folder) => console.log('Folder created:', folder)}
            />
          </Box>
        );
      case 'tagManager':
        return (
          <Box sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
            <EnhancedTagManager 
              tags={mockTags}
              onTagCreate={(tag) => console.log('Tag created:', tag)}
              onTagDelete={(tagId) => console.log('Tag deleted:', tagId)}
              onTagEdit={(tag) => console.log('Tag edited:', tag)}
            />
          </Box>
        );
      default:
        return <EnhancedDocumentDrive />;
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'background.default'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading UI Components...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          UI Component Test
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          This page showcases the enhanced UI components for the document section.
        </Typography>
        
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant={activeComponent === 'documentDrive' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => handleComponentChange('documentDrive')}
          >
            Document Drive
          </Button>
          <Button 
            variant={activeComponent === 'documentExplorer' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => handleComponentChange('documentExplorer')}
          >
            Document Explorer
          </Button>
          <Button 
            variant={activeComponent === 'folderManager' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => handleComponentChange('folderManager')}
          >
            Folder Manager
          </Button>
          <Button 
            variant={activeComponent === 'tagManager' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => handleComponentChange('tagManager')}
          >
            Tag Manager
          </Button>
        </Box>
        
        <Box sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          height: 'calc(100vh - 200px)',
          backgroundColor: activeComponent === 'documentDrive' ? 'background.default' : 'background.paper'
        }}>
          {renderActiveComponent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UITest;
