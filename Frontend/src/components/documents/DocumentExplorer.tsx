import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Label as LabelIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Share as ShareIcon,
  Tag as TagIcon,
  MoveToInbox as MoveToInboxIcon
} from '@mui/icons-material';
import FileUploader from './FileUploader';
import FileDownloader from './FileDownloader';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  getAllDocuments, 
  getDocumentsByFolder, 
  deleteDocument, 
  moveDocumentToFolder,
  getAllFolders,
  createFolder,
  deleteFolder,
  getAllTags,
  createTag,
  addTagToDocument,
  removeTagFromDocument,
  toggleDocumentStarred,
  Document as ApiDocument,
  previewDocument
} from '../../services/api';
import { 
  Document as AppDocument, 
  DocumentType, 
  AccessLevel, 
  DocumentMetadata, 
  Folder, 
  Tag 
} from '../../types/document';
import { useWorkflowStore } from '../../utils/WorkflowStore';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { API_BASE_URL } from '../../config';

// Add type for viewType
type ViewType = 'folder' | 'tag' | 'starred' | 'recent' | 'shared' | 'all' | 'trash';

interface DocumentExplorerProps {
  viewType: ViewType;
  folderId?: string;
  tagId?: string;
}

// File type icons mapping
const getFileIcon = (mimetype: string) => {
  if (mimetype.includes('pdf')) {
    return <PdfIcon />;
  } else if (mimetype.includes('image')) {
    return <ImageIcon />;
  } else if (mimetype.includes('word') || mimetype.includes('document')) {
    return <DocIcon />;
  } else if (mimetype.includes('code') || mimetype.includes('json') || mimetype.includes('xml')) {
    return <CodeIcon />;
  } else {
    return <FileIcon />;
  }
};

// Update the conversion function to handle all required properties
const convertApiToAppDocument = (apiDoc: ApiDocument): AppDocument => {
  return {
    ...apiDoc,
    type: apiDoc.type as DocumentType,
    uploadDate: new Date(apiDoc.uploadDate),
    metadata: {
      nodeId: apiDoc.metadata?.nodeId || null,
      nodeType: apiDoc.metadata?.nodeType || null,
      inputId: apiDoc.metadata?.inputId || null,
      description: apiDoc.metadata?.description || ''
    },
    sharedWith: []
  };
};

const DocumentExplorer: React.FC<DocumentExplorerProps> = ({ viewType, folderId, tagId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { addProcess } = useWorkflowStore();

  // State for documents, folders, and tags
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<AppDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State for UI controls
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState<boolean>(false);
  const [showCreateTagDialog, setShowCreateTagDialog] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#2196f3');

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    documentId?: string;
    folderId?: string;
  } | null>(null);

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Set current folder based on URL params
  useEffect(() => {
    if (viewType === 'folder' && folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        setCurrentFolder(folder);
      }
    } else if (viewType !== 'folder') {
      setCurrentFolder(null);
    }
  }, [viewType, folderId, folders]);

  // Load initial data
  useEffect(() => {
    loadFolders();
    loadTags();
  }, []);

  // Load documents when folder or view type changes
  useEffect(() => {
    loadDocuments();
  }, [currentFolder, viewType, tagId]);

  // Update folder path when folders or current folder changes
  useEffect(() => {
    if (folders.length > 0) {
      updateFolderPath();
    }
  }, [folders, currentFolder]);

  // Load all folders
  const loadFolders = async () => {
    setLoading(true);
    try {
      const response = await getAllFolders();
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        showNotification('Failed to load folders', 'error');
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      showNotification('Error loading folders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load all tags
  const loadTags = async () => {
    try {
      const response = await getAllTags();
      if (response.success && response.data) {
        setTags(response.data);
      } else {
        showNotification('Failed to load tags', 'error');
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      showNotification('Error loading tags', 'error');
    }
  };

  // Update the document handlers with proper types
  const handleDocumentUpdate = (documentId: string, updatedDocument: AppDocument) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => doc.id === documentId ? updatedDocument : doc)
    );
  };

  // Update the search handler with proper types
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchQuery = event.target.value;
    setSearchQuery(searchQuery);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setDocuments(documents.filter((doc: AppDocument) => 
        doc.originalName.toLowerCase().includes(query) ||
        (doc.metadata?.description?.toLowerCase().includes(query) ?? false)
      ));
    } else {
      loadDocuments();
    }
  };

  // Update the loadDocuments function to handle date conversion
  const loadDocuments = async () => {
    try {
      setLoading(true);
      let apiDocuments: ApiDocument[] = [];
      
      if (viewType === 'folder' && folderId) {
        const response = await getDocumentsByFolder(folderId);
        if (response.success && response.data) {
          apiDocuments = response.data;
        }
      } else if (viewType === 'tag' && tagId) {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data.filter(doc => doc.tags.includes(tagId));
        }
      } else if (viewType === 'starred') {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data.filter(doc => doc.starred);
        }
      } else if (viewType === 'recent') {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
            .slice(0, 20);
        }
      } else if (viewType === 'shared') {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data.filter(doc => doc.accessLevel === 'public');
        }
      } else if (viewType === 'all') {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data;
        }
      } else {
        const response = await getAllDocuments();
        if (response.success && response.data) {
          apiDocuments = response.data;
        }
      }
      
      setDocuments(apiDocuments.map(convertApiToAppDocument));
    } catch (error) {
      console.error('Error loading documents:', error);
      showNotification('Error loading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update folder path breadcrumbs
  const updateFolderPath = () => {
    if (!currentFolder) {
      setFolderPath([]);
      return;
    }
    
    const path: Folder[] = [];
    let current = folders.find(f => f.id === currentFolder.id);
    
    while (current) {
      path.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current?.parentId) : undefined;
    }
    
    setFolderPath(path);
  };

  // Handle folder navigation
  const navigateToFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentFolder(folder);
    }
  };

  // Handle document selection
  const handleDocumentSelect = (doc: AppDocument) => {
    setSelectedDocument(doc);
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await deleteDocument(documentId);
      if (response.success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
        setSelectedDocument(null);
        showNotification('Document deleted successfully', 'success');
      } else {
        showNotification('Failed to delete document', 'error');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification('Error deleting document', 'error');
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showNotification('Folder name cannot be empty', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await createFolder(newFolderName, currentFolder?.id || 'root');
      if (response.success && response.data) {
        // Wait a longer moment to ensure the backend has fully processed the creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add the new folder to the current folders list immediately
        // This ensures it appears in the UI even if the backend refresh is delayed
        if (response.data) {
          const newFolder: Folder = response.data;
          setFolders(prevFolders => {
            // Check if folder already exists to avoid duplicates
            if (!prevFolders.some(folder => folder.id === newFolder.id)) {
              return [...prevFolders, newFolder];
            }
            return prevFolders;
          });
        }
        
        // Then refresh the folders list
        await loadFolders();
        
        showNotification('Folder created successfully', 'success');
        setNewFolderName('');
        setShowCreateFolderDialog(false);
      } else {
        showNotification('Failed to create folder', 'error');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showNotification('Error creating folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await deleteFolder(folderId);
      if (response.success) {
        setFolders(folders.filter(folder => folder.id !== folderId));
        showNotification('Folder deleted successfully', 'success');
        
        // If we deleted the current folder, navigate back to parent
        if (folderId === currentFolder?.id) {
          const currentFolderObj = folders.find(f => f.id === currentFolder?.parentId);
          if (currentFolderObj && currentFolderObj.parentId) {
            navigateToFolder(currentFolderObj.parentId);
          } else {
            navigateToFolder('root');
          }
        }
      } else {
        showNotification('Failed to delete folder', 'error');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      showNotification('Error deleting folder', 'error');
    }
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showNotification('Tag name cannot be empty', 'warning');
      return;
    }
    
    try {
      const response = await createTag(newTagName, newTagColor);
      if (response.success && response.data) {
        setTags([...tags, response.data]);
        showNotification('Tag created successfully', 'success');
        setNewTagName('');
        setNewTagColor('#2196f3');
        setShowCreateTagDialog(false);
      } else {
        showNotification('Failed to create tag', 'error');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      showNotification('Error creating tag', 'error');
    }
  };

  // Handle document search
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      loadDocuments();
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle file upload completion
  const handleUploadComplete = (apiDocument: ApiDocument) => {
    const newDocument = convertApiToAppDocument(apiDocument);
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    showNotification('Document uploaded successfully', 'success');
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle context menu open
  const handleContextMenu = (event: React.MouseEvent, doc?: AppDocument, folderId?: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      documentId: doc?.id,
      folderId
    });
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // Get child folders of current folder
  const getChildFolders = () => {
    return folders.filter(folder => folder.parentId === currentFolder?.id);
  };

  // Get tag by ID
  const getTagById = (tagId: string) => {
    return tags.find(tag => tag.id === tagId);
  };

  // Render folder list
  const renderFolders = () => {
    const childFolders = getChildFolders();
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        {childFolders.map((folder) => (
          <Paper
            key={folder.id}
            elevation={2}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => navigateToFolder(folder.id)}
            onContextMenu={(e) => handleContextMenu(e, undefined, folder.id)}
          >
            <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography noWrap>{folder.name}</Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  // Render document list
  const renderDocuments = () => {
    const filteredDocs = documents.filter(doc => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        doc.originalName.toLowerCase().includes(query) ||
        (doc.metadata?.description?.toLowerCase().includes(query) ?? false)
      );
    });

    if (!filteredDocs.length) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        {filteredDocs.map((doc) => (
          <Paper
            key={doc.id}
            elevation={2}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => handleDocumentCardClick(doc)}
            onContextMenu={(e) => handleContextMenu(e, doc)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {getFileIcon(doc.mimetype)}
              <Typography noWrap sx={{ ml: 1 }}>{doc.originalName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(doc.size)}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocumentStar(doc.id);
                }}
              >
                {doc.starred ? <StarIcon color="primary" /> : <StarBorderIcon />}
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigateToFolder('root')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        {folderPath.map((folder, index) => (
          <Link
            key={folder.id}
            component="button"
            underline={index === folderPath.length - 1 ? 'none' : 'hover'}
            color={index === folderPath.length - 1 ? 'text.primary' : 'inherit'}
            onClick={() => navigateToFolder(folder.id)}
          >
            {folder.name}
          </Link>
        ))}
      </Breadcrumbs>
    );
  };

  // Add missing function
  const handleDocumentStar = async (documentId: string) => {
    try {
      const response = await toggleDocumentStarred(documentId);
      if (response.success && response.data) {
        const updatedDocument = convertApiToAppDocument(response.data);
        handleDocumentUpdate(documentId, updatedDocument);
        showNotification('Document star status updated', 'success');
      } else {
        showNotification('Failed to update document star status', 'error');
      }
    } catch (error) {
      showNotification('Error updating document star status', 'error');
    }
  };

  // Add missing functions
  const handleDocumentMove = async (documentId: string, folderId: string) => {
    try {
      const response = await moveDocumentToFolder(documentId, folderId);
      if (response.success && response.data) {
        const updatedDocument = convertApiToAppDocument(response.data);
        handleDocumentUpdate(documentId, updatedDocument);
        showNotification('Document moved successfully', 'success');
      } else {
        showNotification('Failed to move document', 'error');
      }
    } catch (error) {
      console.error('Error moving document:', error);
      showNotification('Error moving document', 'error');
    }
  };

  const handleAddTag = async (documentId: string, tagId: string) => {
    try {
      const response = await addTagToDocument(documentId, tagId);
      if (response.success && response.data) {
        const updatedDoc = convertApiToAppDocument(response.data);
        handleDocumentUpdate(documentId, updatedDoc);
        showNotification('Tag added successfully', 'success');
      } else {
        showNotification('Failed to add tag', 'error');
      }
    } catch (error) {
      showNotification('Error adding tag', 'error');
    }
  };

  const handleRemoveTag = async (documentId: string, tagId: string) => {
    try {
      const response = await removeTagFromDocument(documentId, tagId);
      if (response.success && response.data) {
        const updatedDoc = convertApiToAppDocument(response.data);
        handleDocumentUpdate(documentId, updatedDoc);
        showNotification('Tag removed successfully', 'success');
      } else {
        showNotification('Failed to remove tag', 'error');
      }
    } catch (error) {
      showNotification('Error removing tag', 'error');
    }
  };

  // Add function to get document URL
  const getDocumentUrl = (document: AppDocument): string => {
    if (document.url) {
      return document.url;
    }
    return `${API_BASE_URL}/documents/${document.id}`;
  };

  const handleDocumentClick = async (document: AppDocument) => {
    try {
      // If the document has a direct URL, use it
      if (document.url) {
        window.open(document.url, '_blank');
        return;
      }

      // Otherwise, get the preview URL
      const response = await previewDocument(document.id);
      
      if (response.success && response.data) {
        // Open the preview in a new tab
        window.open(response.data, '_blank');
      } else {
        console.error('Failed to get document preview:', response.error);
      }
    } catch (error) {
      console.error('Error handling document click:', error);
    }
  };

  // Update the document card click handler
  const handleDocumentCardClick = (document: AppDocument) => {
    handleDocumentClick(document);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{errorMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
        <TextField
          placeholder="Search documents..."
          variant="outlined"
          size="small"
          fullWidth={isMobile}
          value={searchQuery}
          onChange={handleSearch}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setShowUploadDialog(true)}
            size="small"
          >
            Upload
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setShowCreateFolderDialog(true)}
            size="small"
          >
            New Folder
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LabelIcon />}
            onClick={() => setShowCreateTagDialog(true)}
            size="small"
          >
            New Tag
          </Button>
          
          <IconButton onClick={loadDocuments} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Breadcrumb navigation */}
      {(viewType === 'folder') && renderBreadcrumbs()}
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
        {renderFolders()}
        {renderDocuments()}
      </Box>
      
      {/* Upload dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <FileUploader
            nodeId="document-explorer"
            inputId="file-upload"
            label="Select file to upload"
            multiple={false}
            folderId={currentFolder?.id}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Create folder dialog */}
      <Dialog
        open={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Create tag dialog */}
      <Dialog
        open={showCreateTagDialog}
        onClose={() => setShowCreateTagDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            type="text"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Tag Color:</Typography>
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              style={{ width: '40px', height: '40px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateTagDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTag} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Context menu */}
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
        {contextMenu?.documentId && (
          <>
            <MenuItem onClick={() => {
              handleDocumentStar(contextMenu.documentId!);
              handleContextMenuClose();
            }}>
              {documents.find(d => d.id === contextMenu.documentId)?.starred 
                ? 'Remove Star' 
                : 'Add Star'}
            </MenuItem>
            <MenuItem onClick={() => {
              handleDocumentDelete(contextMenu.documentId!);
              handleContextMenuClose();
            }}>
              Delete
            </MenuItem>
            <Divider />
            <MenuItem disabled>Move to folder</MenuItem>
            {folders.map(folder => (
              <MenuItem 
                key={folder.id}
                onClick={() => {
                  handleDocumentMove(contextMenu.documentId!, folder.id);
                  handleContextMenuClose();
                }}
                sx={{ pl: 4 }}
              >
                {folder.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem disabled>Add tag</MenuItem>
            {tags.map(tag => {
              const doc = documents.find(d => d.id === contextMenu.documentId);
              const hasTag = doc?.tags.includes(tag.id);
              
              return (
                <MenuItem 
                  key={tag.id}
                  onClick={() => {
                    if (hasTag) {
                      handleRemoveTag(contextMenu.documentId!, tag.id);
                    } else {
                      handleAddTag(contextMenu.documentId!, tag.id);
                    }
                    handleContextMenuClose();
                  }}
                  sx={{ 
                    pl: 4,
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: tag.color,
                      mr: 1
                    }
                  }}
                >
                  {tag.name} {hasTag && '✓'}
                </MenuItem>
              );
            })}
          </>
        )}
        
        {contextMenu?.folderId && (
          <MenuItem onClick={() => {
            handleDeleteFolder(contextMenu.folderId!);
            handleContextMenuClose();
          }}>
            Delete Folder
          </MenuItem>
        )}
      </Menu>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentExplorer;
