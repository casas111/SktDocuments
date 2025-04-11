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
  Paper,
  Button,
  InputBase,
  Fade,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import DocumentExplorer from './DocumentExplorer';
import EnhancedDocumentExplorer from './EnhancedDocumentExplorer';
import FolderManager from './FolderManager';
import TagManager from './TagManager';

// Styled components for enhanced UI
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 100,
  padding: '12px 16px',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.light,
  },
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
  transition: theme.transitions.create(['box-shadow', 'border-color']),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

const TabPanel = (props) => {
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
};

// Enhanced Document Drive Component
const EnhancedDocumentDrive = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const handleTabChange = (_event, newValue) => {
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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleUpload = () => {
    setShowUploadDialog(true);
  };

  const handleCreateFolder = () => {
    setShowCreateFolderDialog(true);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Mock data for demonstration
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
      itemCount: 12
    },
    {
      id: 'f2',
      name: 'Marketing Materials',
      itemCount: 8
    },
    {
      id: 'f3',
      name: 'Financial Reports',
      itemCount: 5
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

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      <PageHeader>
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Document Drive
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage, organize, and share your documents
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          width: { xs: '100%', md: 'auto' }
        }}>
          <SearchBar>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search documents…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearch}
            />
          </SearchBar>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              fullWidth={isMobile}
            >
              Upload
            </ActionButton>
            
            <ActionButton
              variant="outlined"
              color="primary"
              startIcon={<FolderIcon />}
              onClick={handleCreateFolder}
              fullWidth={isMobile}
            >
              New Folder
            </ActionButton>
          </Box>
        </Box>
      </PageHeader>
      
      <Paper elevation={2} sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StyledTabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="document drive tabs"
              variant={isTablet ? "scrollable" : "standard"}
              scrollButtons={isTablet ? "auto" : false}
            >
              <StyledTab label="All Documents" />
              <StyledTab label="Recent" />
              <StyledTab label="Starred" />
              <StyledTab label="Shared" />
            </StyledTabs>
            
            <Box sx={{ display: 'flex', mr: 1 }}>
              <Tooltip title="Filter">
                <ToolbarButton size="medium">
                  <FilterListIcon />
                </ToolbarButton>
              </Tooltip>
              
              <Tooltip title="Sort">
                <ToolbarButton size="medium">
                  <SortIcon />
                </ToolbarButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              
              <Tooltip title="Grid view">
                <ToolbarButton 
                  size="medium" 
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => handleViewModeChange('grid')}
                >
                  <ViewModuleIcon />
                </ToolbarButton>
              </Tooltip>
              
              <Tooltip title="List view">
                <ToolbarButton 
                  size="medium"
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => handleViewModeChange('list')}
                >
                  <ViewListIcon />
                </ToolbarButton>
              </Tooltip>
            </Box>
          </Box>
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
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading documents...
              </Typography>
            </Box>
          )}
          
          <Fade in={!loading}>
            <Box>
              <Routes>
                <Route path="/documents/all/*" element={
                  <TabPanel value={tabValue} index={0}>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments}
                      folders={mockFolders}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                      onFolderClick={(id) => navigate(`/documents/folder/${id}`)}
                      onCreateFolder={handleCreateFolder}
                      onTagClick={(id) => navigate(`/documents/tag/${id}`)}
                      onStarDocument={(id) => showNotification(`Document ${id} starred successfully`)}
                      onDeleteDocument={(id) => showNotification(`Document ${id} deleted successfully`)}
                      onDownloadDocument={(id) => showNotification(`Document ${id} download started`)}
                      onEditDocument={(id) => navigate(`/documents/edit/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/recent" element={
                  <TabPanel value={tabValue} index={1}>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments.slice().sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))}
                      folders={[]}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/starred" element={
                  <TabPanel value={tabValue} index={2}>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments.filter(doc => doc.starred)}
                      folders={[]}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/shared" element={
                  <TabPanel value={tabValue} index={3}>
                    <EnhancedDocumentExplorer 
                      documents={[]}
                      folders={[]}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/folder/:folderId" element={
                  <TabPanel value={tabValue} index={0}>
                    <Box sx={{ mb: 3 }}>
                      <Breadcrumbs 
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="folder navigation"
                      >
                        <MuiLink 
                          component="button"
                          underline="hover"
                          color="inherit"
                          onClick={() => navigate('/documents/all')}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <FolderIcon sx={{ mr: 0.5 }} fontSize="small" />
                          Documents
                        </MuiLink>
                        <Typography color="text.primary">Current Folder</Typography>
                      </Breadcrumbs>
                    </Box>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments.slice(0, 2)}
                      folders={mockFolders.slice(0, 1)}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                      onFolderClick={(id) => navigate(`/documents/folder/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/tag/:tagId" element={
                  <TabPanel value={tabValue} index={0}>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments.filter(doc => 
                        doc.tags && doc.tags.some(tag => tag.id === location.pathname.split('/').pop())
                      )}
                      folders={[]}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                    />
                  </TabPanel>
                } />
                <Route path="/documents/document/:documentId" element={
                  <EnhancedDocumentDetailView />
                } />
                <Route path="*" element={
                  <TabPanel value={tabValue} index={0}>
                    <EnhancedDocumentExplorer 
                      documents={mockDocuments}
                      folders={mockFolders}
                      tags={mockTags}
                      onDocumentClick={(id) => navigate(`/documents/document/${id}`)}
                      onFolderClick={(id) => navigate(`/documents/folder/${id}`)}
                    />
                  </TabPanel>
                } />
              </Routes>
            </Box>
          </Fade>
        </Box>
      </Paper>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Enhanced Document Detail View Component
const EnhancedDocumentDetailView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const documentId = location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // Simulate document loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [documentId]);
  
  return (
    <Box sx={{ height: '100%', p: 3 }}>
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
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <FolderIcon sx={{ mr: 0.5 }} fontSize="small" />
          Documents
        </MuiLink>
        <Typography color="text.primary">Document Details</Typography>
      </Breadcrumbs>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: theme.shape.borderRadius * 2 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Document ID: {documentId}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" paragraph>
            This is the enhanced detailed view of the document. In a real implementation, this would show
            the document preview, metadata, and provide options for editing, sharing, etc.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />}>
              Download
            </Button>
            <Button variant="outlined" color="primary">
              Share
            </Button>
            <Button variant="outlined" color="error">
              Delete
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedDocumentDrive;
