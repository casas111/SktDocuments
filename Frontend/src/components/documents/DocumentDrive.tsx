import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DocumentExplorer from './DocumentExplorer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%', pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DocumentDriveProps {
  // Add any props if needed
}

const DocumentDrive: React.FC<DocumentDriveProps> = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse the current path to determine active tab and folder
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/documents/recent')) {
      setTabValue(1);
    } else if (path.includes('/documents/starred')) {
      setTabValue(2);
    } else if (path.includes('/documents/shared')) {
      setTabValue(3);
    } else {
      setTabValue(0);
    }
  }, [location]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setLoading(true);
    
    // Update the route based on the selected tab
    try {
      switch (newValue) {
        case 0:
          navigate('/documents/all');
          break;
        case 1:
          navigate('/documents/recent');
          break;
        case 2:
          navigate('/documents/starred');
          break;
        case 3:
          navigate('/documents/shared');
          break;
        default:
          navigate('/documents/all');
      }
    } catch (err) {
      setError('Navigation error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent overflow issues
    }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Document Drive
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="document drive tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Documents" />
          <Tab label="Recent" />
          <Tab label="Starred" />
          <Tab label="Shared" />
        </Tabs>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        position: 'relative' // For loading indicator positioning
      }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Routes>
          <Route path="/documents/all/*" element={
            <TabPanel value={tabValue} index={0}>
              <DocumentExplorer viewType="all" />
            </TabPanel>
          } />
          <Route path="/documents/recent" element={
            <TabPanel value={tabValue} index={1}>
              <DocumentExplorer viewType="recent" />
            </TabPanel>
          } />
          <Route path="/documents/starred" element={
            <TabPanel value={tabValue} index={2}>
              <DocumentExplorer viewType="starred" />
            </TabPanel>
          } />
          <Route path="/documents/shared" element={
            <TabPanel value={tabValue} index={3}>
              <DocumentExplorer viewType="shared" />
            </TabPanel>
          } />
          <Route path="/documents/folder/:folderId" element={
            <TabPanel value={tabValue} index={0}>
              <DocumentExplorer viewType="folder" />
            </TabPanel>
          } />
          <Route path="/documents/tag/:tagId" element={
            <TabPanel value={tabValue} index={0}>
              <DocumentExplorer viewType="tag" />
            </TabPanel>
          } />
          <Route path="/documents/document/:documentId" element={
            <DocumentDetailView />
          } />
          <Route path="*" element={
            <TabPanel value={tabValue} index={0}>
              <DocumentExplorer viewType="all" />
            </TabPanel>
          } />
        </Routes>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Document Detail View Component
const DocumentDetailView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const documentId = location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);
  
  // Simulate document loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [documentId]);
  
  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="document navigation"
        sx={{ mb: 3 }}
      >
        <MuiLink 
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/documents/all')}
        >
          Documents
        </MuiLink>
        <Typography color="text.primary">Document Details</Typography>
      </Breadcrumbs>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document ID: {documentId}
          </Typography>
          
          <Typography variant="body1">
            This is the detailed view of the document. In a real implementation, this would show
            the document preview, metadata, and provide options for editing, sharing, etc.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DocumentDrive;
