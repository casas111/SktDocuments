import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Breadcrumbs,
  Link,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { 
  CreateNewFolder, 
  UploadFile, 
  MoreVert, 
  Folder as FolderIcon, 
  Description as FileIcon,
  Label as LabelIcon,
  ArrowBack,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  selectCurrentFolder, 
  selectDocuments, 
  selectFolders,
  selectLabels,
  setCurrentFolder,
  addFolder,
  addDocument,
  addLabel,
  updateDocument
} from '../../store/slices/documentsSlice';
import { setIsLoading, addNotification } from '../../store/slices/uiSlice';
import DocumentViewer from '../../components/documents/DocumentViewer';
import LabelSelector from '../../components/documents/LabelSelector';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DocumentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFolder = useAppSelector(selectCurrentFolder);
  const documents = useAppSelector(selectDocuments);
  const folders = useAppSelector(selectFolders);
  const labels = useAppSelector(selectLabels);
  
  // Local state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
    itemType: 'folder' | 'document';
  } | null>(null);

  // Fetch folders and documents on component mount
  useEffect(() => {
    fetchFolders();
    fetchDocuments(currentFolder?.id || null);
    fetchLabels();
  }, [currentFolder]);

  // Fetch folders from API
  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/folders`);
      // In a real implementation, we would dispatch this to Redux
      console.log('Folders:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to fetch folders');
      setLoading(false);
    }
  };

  // Fetch documents from API
  const fetchDocuments = async (folderId: string | null) => {
    try {
      setLoading(true);
      const url = folderId 
        ? `${API_URL}/documents?folderId=${folderId}` 
        : `${API_URL}/documents`;
      const response = await axios.get(url);
      // In a real implementation, we would dispatch this to Redux
      console.log('Documents:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
      setLoading(false);
    }
  };

  // Fetch labels from API
  const fetchLabels = async () => {
    try {
      const response = await axios.get(`${API_URL}/labels`);
      // In a real implementation, we would dispatch this to Redux
      console.log('Labels:', response.data);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to fetch labels');
    }
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    // In a real implementation, we would update the current folder in Redux
    // and fetch the contents of the new folder
    console.log(`Navigating to folder: ${folderName} (${folderId})`);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, { id: folderId, name: folderName }];
    setBreadcrumbs(newBreadcrumbs);
  };

  // Navigate back using breadcrumbs
  const navigateToBreadcrumb = (index: number) => {
    if (index === 0) {
      // Navigate to root
      setBreadcrumbs([]);
      // In a real implementation, we would set the current folder to null in Redux
    } else {
      // Navigate to specific breadcrumb
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      // In a real implementation, we would set the current folder in Redux
    }
  };

  // Handle create folder
  const handleCreateFolder = () => {
    setFolderDialogOpen(true);
  };

  const handleFolderDialogClose = () => {
    setFolderDialogOpen(false);
    setNewFolderName('');
  };

  const handleFolderDialogSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/folders`, {
        name: newFolderName,
        parentId: currentFolder?.id || null
      });
      
      // In a real implementation, we would dispatch this to Redux
      console.log('Created folder:', response.data);
      
      // Show success notification
      dispatch(addNotification({
        message: `Folder "${newFolderName}" created successfully`,
        type: 'success'
      }));
      
      // Refresh folders
      fetchFolders();
      
      setLoading(false);
      handleFolderDialogClose();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
      setLoading(false);
    }
  };

  // Handle upload file
  const handleUploadFile = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadDialogSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folderId', currentFolder?.id || 'root');
      
      const response = await axios.post(`${API_URL}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // In a real implementation, we would dispatch this to Redux
      console.log('Uploaded document:', response.data);
      
      // Show success notification
      dispatch(addNotification({
        message: `File "${selectedFile.name}" uploaded successfully`,
        type: 'success'
      }));
      
      // Refresh documents
      fetchDocuments(currentFolder?.id || null);
      
      setLoading(false);
      handleUploadDialogClose();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
      setLoading(false);
    }
  };

  // Handle document view
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedDocument(null);
  };

  // Handle label management
  const handleOpenLabelDialog = (document: any) => {
    setSelectedDocument(document);
    setSelectedLabels(document.labels?.map((l: any) => l.id) || []);
    setLabelDialogOpen(true);
  };

  const handleLabelDialogClose = () => {
    setLabelDialogOpen(false);
    setSelectedDocument(null);
    setSelectedLabels([]);
  };

  const handleLabelDialogSubmit = async () => {
    if (!selectedDocument) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, we would update the document labels via API
      console.log(`Updating labels for document ${selectedDocument.id}:`, selectedLabels);
      
      // Show success notification
      dispatch(addNotification({
        message: 'Document labels updated successfully',
        type: 'success'
      }));
      
      setLoading(false);
      handleLabelDialogClose();
    } catch (err) {
      console.error('Error updating labels:', err);
      setError('Failed to update labels');
      setLoading(false);
    }
  };

  // Handle context menu
  const handleContextMenu = (event: React.MouseEvent, itemId: string, itemType: 'folder' | 'document') => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      itemId,
      itemType,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // Handle context menu actions
  const handleOpenItem = () => {
    if (!contextMenu) return;
    
    if (contextMenu.itemType === 'folder') {
      // Navigate to folder
      navigateToFolder(contextMenu.itemId, `Folder ${contextMenu.itemId}`);
    } else {
      // View document
      const document = { id: contextMenu.itemId, name: `Document ${contextMenu.itemId.split('-')[1]}.pdf` };
      handleViewDocument(document);
    }
    
    handleContextMenuClose();
  };

  const handleDeleteItem = async () => {
    if (!contextMenu) return;
    
    try {
      setLoading(true);
      
      if (contextMenu.itemType === 'folder') {
        await axios.delete(`${API_URL}/folders/${contextMenu.itemId}`);
        // Show success notification
        dispatch(addNotification({
          message: 'Folder deleted successfully',
          type: 'success'
        }));
        // Refresh folders
        fetchFolders();
      } else {
        await axios.delete(`${API_URL}/documents/${contextMenu.itemId}`);
        // Show success notification
        dispatch(addNotification({
          message: 'Document deleted successfully',
          type: 'success'
        }));
        // Refresh documents
        fetchDocuments(currentFolder?.id || null);
      }
      
      setLoading(false);
      handleContextMenuClose();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
      setLoading(false);
      handleContextMenuClose();
    }
  };

  const handleAddLabel = () => {
    if (!contextMenu) return;
    
    if (contextMenu.itemType === 'document') {
      const document = { id: contextMenu.itemId, name: `Document ${contextMenu.itemId.split('-')[1]}.pdf` };
      handleOpenLabelDialog(document);
    }
    
    handleContextMenuClose();
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    // In a real implementation, we would search documents via API
    console.log(`Searching for: ${searchQuery}`);
  };

  // Handle error alert close
  const handleErrorClose = () => {
    setError(null);
  };

  // Filter documents and folders based on search query
  const filteredFolders = searchQuery
    ? [1, 2, 3].filter(id => `Sample Folder ${id}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : [1, 2, 3];
    
  const filteredDocuments = searchQuery
    ? [1, 2, 3, 4, 5].filter(id => `Document ${id}.pdf`.toLowerCase().includes(searchQuery.toLowerCase()))
    : [1, 2, 3, 4, 5];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Documents</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<CreateNewFolder />}
            onClick={handleCreateFolder}
            sx={{ mr: 2 }}
          >
            New Folder
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<UploadFile />}
            onClick={handleUploadFile}
          >
            Upload File
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search documents and folders..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mr: 2 }}
        />
        <Button 
          variant="outlined" 
          startIcon={<FilterIcon />}
          onClick={() => console.log('Filter clicked')}
        >
          Filter
        </Button>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={() => navigateToBreadcrumb(0)}
        >
          Documents
        </Link>
        {breadcrumbs.map((crumb, index) => (
          index === breadcrumbs.length - 1 ? (
            <Typography color="text.primary" key={crumb.id}>
              {crumb.name}
            </Typography>
          ) : (
            <Link
              underline="hover"
              color="inherit"
              href="#"
              onClick={() => navigateToBreadcrumb(index)}
              key={crumb.id}
            >
              {crumb.name}
            </Link>
          )
        ))}
      </Breadcrumbs>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try a different search term' : 'This folder is empty'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Folders
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
                  {filteredFolders.map((id) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`folder-${id}`}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => navigateToFolder(`folder-${id}`, `Sample Folder ${id}`)}
                        onContextMenu={(e) => handleContextMenu(e, `folder-${id}`, 'folder')}
                      >
                        <FolderIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">Sample Folder {id}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            3 items
                          </Typography>
                        </Box>
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, `folder-${id}`, 'folder');
                        }}>
                          <MoreVert />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </>
              )}

              {/* Files */}
              {filteredDocuments.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: filteredFolders.length > 0 ? 2 : 0 }}>
                      Documents
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
                  {filteredDocuments.map((id) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`file-${id}`}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleViewDocument({ id: `file-${id}`, name: `Document ${id}.pdf` })}
                        onContextMenu={(e) => handleContextMenu(e, `file-${id}`, 'document')}
                      >
                        <FileIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">Document {id}.pdf</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LabelIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Important
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, `file-${id}`, 'document');
                        }}>
                          <MoreVert />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleOpenItem}>
          {contextMenu?.itemType === 'folder' ? 'Open' : 'View'}
        </MenuItem>
        <MenuItem onClick={handleContextMenuClose}>Rename</MenuItem>
        <MenuItem onClick={handleContextMenuClose}>Move</MenuItem>
        {contextMenu?.itemType === 'document' && (
          <MenuItem onClick={handleAddLabel}>Manage Labels</MenuItem>
        )}
        <MenuItem onClick={handleDeleteItem} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialogOpen} onClose={handleFolderDialogClose}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFolderDialogClose}>Cancel</Button>
          <Button 
            onClick={handleFolderDialogSubmit} 
            variant="contained"
            disabled={!newFolderName.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ p: 5, border: '2px dashed', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <UploadFile sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body1">
                  {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .txt, .doc, .pdf and other document formats
                </Typography>
              </Box>
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Cancel</Button>
          <Button 
            onClick={handleUploadDialogSubmit} 
            variant="contained" 
            disabled={!selectedFile || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog 
        open={viewerOpen} 
        onClose={handleViewerClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* This would be replaced with an actual document viewer component */}
            <Typography variant="body1" color="text.secondary">
              Document viewer would be implemented here to display the content of {selectedDocument?.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOpenLabelDialog(selectedDocument)}>Manage Labels</Button>
          <Button onClick={handleViewerClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Label Management Dialog */}
      <Dialog open={labelDialogOpen} onClose={handleLabelDialogClose}>
        <DialogTitle>Manage Labels for {selectedDocument?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, py: 1 }}>
            {/* This would be replaced with an actual label selector component */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select labels to apply to this document:
            </Typography>
            
            {['Important', 'Urgent', 'Review', 'Approved', 'Draft'].map((label, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input 
                  type="checkbox" 
                  id={`label-${index}`} 
                  checked={selectedLabels.includes(String(index))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLabels([...selectedLabels, String(index)]);
                    } else {
                      setSelectedLabels(selectedLabels.filter(id => id !== String(index)));
                    }
                  }}
                />
                <label htmlFor={`label-${index}`} style={{ marginLeft: 8 }}>
                  {label}
                </label>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              margin="dense"
              label="Create New Label"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
            />
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => console.log('Create new label')}
            >
              Add Label
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLabelDialogClose}>Cancel</Button>
          <Button 
            onClick={handleLabelDialogSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;
