import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Divider, 
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tab,
  Tabs,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  InsertDriveFile as FileIcon, 
  CloudUpload as UploadIcon,
  CreateNewFolder as NewFolderIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  ViewComfy as GalleryViewIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as RenameIcon,
  GetApp as DownloadIcon,
  FileCopy as CopyIcon,
  ContentCut as CutIcon,
  ContentPaste as ContentPasteIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as PreviewIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Home as HomeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Folder, Tag } from '../../types/document';
import DocumentExplorer from './DocumentExplorer';

// Type definitions
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DocumentsDriveProps {
  // Add any props if needed
}

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const FileGridItem = styled(Paper)(({ theme, selected }: { theme: any, selected?: boolean }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

// TabPanel component
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

const DocumentsDrive: React.FC<DocumentsDriveProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gallery'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2196f3');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    documentId?: string;
    folderId?: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All Documents" />
          <Tab label="Recent" />
          <Tab label="Starred" />
          <Tab label="Shared" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <DocumentExplorer viewType="all" />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <DocumentExplorer viewType="recent" />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <DocumentExplorer viewType="starred" />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <DocumentExplorer viewType="shared" />
      </TabPanel>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsDrive; 