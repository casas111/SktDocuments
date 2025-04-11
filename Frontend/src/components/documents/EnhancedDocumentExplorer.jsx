import React from 'react';
import { Box, Typography, Paper, Card, CardContent, CardMedia, Grid, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Folder as FolderIcon, 
  Description as DescriptionIcon, 
  Image as ImageIcon, 
  Movie as MovieIcon, 
  AudioFile as AudioFileIcon, 
  PictureAsPdf as PdfIcon, 
  Code as CodeIcon, 
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Label as LabelIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Styled components for enhanced UI
const DocumentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DocumentCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 140,
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const FolderCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.primary.main,
  },
}));

const TagChip = styled(Chip)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: color || theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: color ? `${color}dd` : theme.palette.primary.dark,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  },
}));

// Enhanced Document Explorer UI Component
const EnhancedDocumentExplorer = ({ 
  documents = [], 
  folders = [], 
  tags = [],
  onDocumentClick,
  onFolderClick,
  onCreateFolder,
  onTagClick,
  onStarDocument,
  onDeleteDocument,
  onDownloadDocument,
  onEditDocument
}) => {
  // Get file icon based on mimetype
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon fontSize="large" color="primary" />;
    } else if (mimetype.startsWith('video/')) {
      return <MovieIcon fontSize="large" color="error" />;
    } else if (mimetype.startsWith('audio/')) {
      return <AudioFileIcon fontSize="large" color="success" />;
    } else if (mimetype === 'application/pdf') {
      return <PdfIcon fontSize="large" color="error" />;
    } else if (mimetype.includes('javascript') || mimetype.includes('json') || mimetype.includes('html') || mimetype.includes('css')) {
      return <CodeIcon fontSize="large" color="info" />;
    } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar') || mimetype.includes('gzip')) {
      return <ArchiveIcon fontSize="large" color="warning" />;
    } else {
      return <DescriptionIcon fontSize="large" color="action" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Folders Section */}
      {folders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <SectionTitle variant="h6">Folders</SectionTitle>
            <AddButton 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={onCreateFolder}
            >
              New Folder
            </AddButton>
          </Box>
          
          <Grid container spacing={2}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
                <FolderCard onClick={() => onFolderClick(folder.id)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <FolderIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {folder.name}
                      </Typography>
                      <Typography variant="caption">
                        {folder.itemCount || 0} items
                      </Typography>
                    </Box>
                  </CardContent>
                </FolderCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Tags</SectionTitle>
          <Paper sx={{ p: 2, display: 'flex', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <TagChip 
                key={tag.id}
                label={tag.name}
                color={tag.color}
                icon={<LabelIcon />}
                onClick={() => onTagClick(tag.id)}
              />
            ))}
          </Paper>
        </Box>
      )}

      {/* Documents Section */}
      <Box>
        <SectionTitle variant="h6">Documents</SectionTitle>
        
        {documents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload documents or create a new folder to organize your files.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <DocumentCard>
                  <DocumentCardMedia
                    onClick={() => onDocumentClick(doc.id)}
                  >
                    {getFileIcon(doc.mimetype)}
                  </DocumentCardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="medium" noWrap sx={{ mb: 0.5 }}>
                        {doc.originalName}
                      </Typography>
                      <ActionButton size="small" onClick={() => onStarDocument(doc.id)}>
                        {doc.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </ActionButton>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" component="div">
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadDate || new Date())}
                    </Typography>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}>
                        {doc.tags.map((tag) => (
                          <TagChip 
                            key={tag.id}
                            label={tag.name}
                            color={tag.color}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTagClick(tag.id);
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pt: 0 }}>
                    <Tooltip title="Download">
                      <ActionButton size="small" onClick={() => onDownloadDocument(doc.id)}>
                        <DownloadIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <ActionButton size="small" onClick={() => onEditDocument(doc.id)}>
                        <EditIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <ActionButton size="small" onClick={() => onDeleteDocument(doc.id)}>
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </Box>
                </DocumentCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedDocumentExplorer;
