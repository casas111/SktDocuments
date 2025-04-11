import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Folder as FolderIcon,
  AccountTree as WorkflowIcon,
} from '@mui/icons-material';
import WorkflowBuilder from '../workflow/WorkflowBuilder';
import DocumentDrive from '../documents/DocumentDrive';
import EnhancedDocumentExplorer from '../documents/EnhancedDocumentExplorer';
import EnhancedFileViewer from '../documents/EnhancedFileViewer';

const drawerWidth = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Documents', icon: <FolderIcon />, path: '/documents' },
    { text: 'Workflows', icon: <WorkflowIcon />, path: '/workflow' },
  ];

  const drawer = (
    <div>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          Simetrik
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  handleDrawerToggle();
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          overflow: 'auto',
        }}
      >
        <Routes>
          <Route path="/" element={<EnhancedDocumentExplorer />} />
          <Route path="/documents/*" element={<EnhancedDocumentExplorer />} />
          <Route path="/workflow" element={<WorkflowBuilder />} />
          <Route path="/workflow/:id" element={<WorkflowBuilder />} />
          <Route path="/file/:fileId" element={<EnhancedFileViewer />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default MainLayout;
