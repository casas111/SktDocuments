import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Divider, 
         List, ListItem, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';

// Import components from both applications
import WorkflowBuilder from './components/workflow/WorkflowBuilder';
import WorkflowWrapper from './components/workflow/WorkflowWrapper';
import DriveNavigationHandler from './components/documents/DriveNavigationHandler';
import DocumentsWrapper from './components/documents/DocumentsWrapper';
import FileViewer from './components/documents/FileViewer';

// Drawer width
const drawerWidth = 240;

// Sidebar component
const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Determine active section
  const isWorkflowActive = currentPath.startsWith('/workflow') || currentPath === '/';
  const isDocumentsActive = currentPath.startsWith('/documents') || currentPath.startsWith('/drive') || currentPath.startsWith('/file');
  
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };
  
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)'
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" component="div">
            Simetrik
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem 
            button 
            selected={isWorkflowActive}
            onClick={() => handleNavigation('/workflow')}
          >
            <ListItemIcon>
              <AccountTreeIcon color={isWorkflowActive ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Workflows" />
          </ListItem>
          
          <ListItem 
            button 
            selected={isDocumentsActive}
            onClick={() => handleNavigation('/drive')}
          >
            <ListItemIcon>
              <FolderIcon color={isDocumentsActive ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

// Main App component
function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Simetrik Platform
            </Typography>
          </Toolbar>
        </AppBar>
        
        {/* Sidebar */}
        <Sidebar open={mobileOpen} onClose={handleDrawerToggle} isMobile={isMobile} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: ['64px', '64px', '64px'], // AppBar height
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)'
          }}
        >
          <Routes>
            {/* Default route redirects to workflow */}
            <Route path="/" element={<Navigate to="/workflow" replace />} />
            
            {/* Workflow routes */}
            <Route path="/workflow" element={
              <WorkflowWrapper>
                <WorkflowBuilder />
              </WorkflowWrapper>
            } />
            <Route path="/workflow/:id" element={
              <WorkflowWrapper>
                <WorkflowBuilder />
              </WorkflowWrapper>
            } />
            
            {/* Document routes */}
            <Route path="/documents/*" element={<Navigate to="/drive" replace />} />
            <Route path="/drive/*" element={
              <DocumentsWrapper>
                <DriveNavigationHandler />
              </DocumentsWrapper>
            } />
            <Route path="/file/:fileId" element={
              <DocumentsWrapper>
                <FileViewer />
              </DocumentsWrapper>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
