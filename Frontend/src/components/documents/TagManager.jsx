import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Tooltip,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Label as LabelIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { getAllTags, createTag, addTagToDocument, removeTagFromDocument } from '../../services/api';

// Styled components for better UI
const TagManagerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(2)
}));

const TagManagerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const TagList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const TagChip = styled(Chip)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.primary.main,
  color: theme.palette.getContrastText(color || theme.palette.primary.main),
  margin: theme.spacing(0.5),
  '&:hover': {
    opacity: 0.9
  }
}));

const ColorSwatch = styled(Box)(({ theme, color, selected }) => ({
  width: 24,
  height: 24,
  backgroundColor: color,
  borderRadius: '50%',
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: theme.shadows[1],
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)'
  }
}));

/**
 * TagManager Component
 * A dedicated component to manage tags with improved UI and functionality
 */
const TagManager = ({ documentId, documentTags = [], onTagsUpdated }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2196f3');
  const [editingTag, setEditingTag] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Predefined colors
  const predefinedColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Load all tags
  const loadTags = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showNotification('Tag name cannot be empty', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await createTag(newTagName, newTagColor);
      
      if (response.success && response.data) {
        // Add the new tag to the tags list immediately
        setTags(prevTags => [...prevTags, response.data]);
        
        showNotification('Tag created successfully', 'success');
        setNewTagName('');
        setNewTagColor('#2196f3');
        setShowCreateDialog(false);
        setShowColorPicker(false);
      } else {
        showNotification('Failed to create tag', 'error');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      showNotification('Error creating tag', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag editing
  const handleEditTag = async () => {
    if (!editingTag || !editingTag.name.trim()) {
      showNotification('Tag name cannot be empty', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      // API call to update tag would go here
      // For now, just update the local state
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.id === editingTag.id ? editingTag : tag
        )
      );
      
      showNotification('Tag updated successfully', 'success');
      setEditingTag(null);
      setShowEditDialog(false);
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error updating tag:', error);
      showNotification('Error updating tag', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag deletion
  const handleDeleteTag = async (tagId) => {
    try {
      setLoading(true);
      // API call to delete tag would go here
      // For now, just update the local state
      setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
      
      showNotification('Tag deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting tag:', error);
      showNotification('Error deleting tag', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding tag to document
  const handleAddTagToDocument = async (tagId) => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await addTagToDocument(documentId, tagId);
      
      if (response.success) {
        showNotification('Tag added to document successfully', 'success');
        
        // Notify parent component
        if (onTagsUpdated) {
          onTagsUpdated([...documentTags, tagId]);
        }
      } else {
        showNotification('Failed to add tag to document', 'error');
      }
    } catch (error) {
      console.error('Error adding tag to document:', error);
      showNotification('Error adding tag to document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing tag from document
  const handleRemoveTagFromDocument = async (tagId) => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await removeTagFromDocument(documentId, tagId);
      
      if (response.success) {
        showNotification('Tag removed from document successfully', 'success');
        
        // Notify parent component
        if (onTagsUpdated) {
          onTagsUpdated(documentTags.filter(id => id !== tagId));
        }
      } else {
        showNotification('Failed to remove tag from document', 'error');
      }
    } catch (error) {
      console.error('Error removing tag from document:', error);
      showNotification('Error removing tag from document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, severity) => {
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

  // Check if tag is applied to document
  const isTagApplied = (tagId) => {
    return documentTags.includes(tagId);
  };

  // Get tag by ID
  const getTagById = (tagId) => {
    return tags.find(tag => tag.id === tagId);
  };

  // Render document tags
  const renderDocumentTags = () => {
    if (!documentId) return null;
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Document Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {documentTags.length > 0 ? (
            documentTags.map(tagId => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              
              return (
                <TagChip
                  key={tag.id}
                  label={tag.name}
                  color={tag.color}
                  onDelete={() => handleRemoveTagFromDocument(tag.id)}
                  deleteIcon={<CloseIcon />}
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tags applied to this document
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <TagManagerContainer>
      <TagManagerHeader>
        <Typography variant="h6">
          Tags
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          disabled={loading}
        >
          New Tag
        </Button>
      </TagManagerHeader>
      
      <Divider />
      
      {/* Document Tags Section */}
      {documentId && (
        <>
          {renderDocumentTags()}
          <Divider sx={{ my: 2 }} />
        </>
      )}
      
      {/* All Tags Section */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          All Tags
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TagList>
            {tags.length > 0 ? (
              tags.map(tag => (
                <Box key={tag.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TagChip
                    label={tag.name}
                    color={tag.color}
                    onClick={() => documentId && handleAddTagToDocument(tag.id)}
                    disabled={documentId && isTagApplied(tag.id)}
                    deleteIcon={
                      <Tooltip title="Edit">
                        <EditIcon />
                      </Tooltip>
                    }
                    onDelete={() => {
                      setEditingTag(tag);
                      setShowEditDialog(true);
                    }}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tags found
              </Typography>
            )}
          </TagList>
        )}
      </Box>
      
      {/* Create Tag Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Tag Color
          </Typography>
          
          <Grid container spacing={1}>
            {predefinedColors.map(color => (
              <Grid item key={color}>
                <ColorSwatch 
                  color={color} 
                  selected={newTagColor === color}
                  onClick={() => setNewTagColor(color)}
                />
              </Grid>
            ))}
            <Grid item>
              <IconButton 
                size="small" 
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{ ml: 1 }}
              >
                <ColorLensIcon />
              </IconButton>
            </Grid>
          </Grid>
          
          {showColorPicker && (
            <Box sx={{ mt: 2 }}>
              <ChromePicker 
                color={newTagColor}
                onChange={(color) => setNewTagColor(color.hex)}
                disableAlpha
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTag} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Tag Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
          {editingTag && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Tag Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editingTag.name}
                onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleEditTag()}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" gutterBottom>
                Tag Color
              </Typography>
              
              <Grid container spacing={1}>
                {predefinedColors.map(color => (
                  <Grid item key={color}>
                    <ColorSwatch 
                      color={color} 
                      selected={editingTag.color === color}
                      onClick={() => setEditingTag({...editingTag, color})}
                    />
                  </Grid>
                ))}
                <Grid item>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    sx={{ ml: 1 }}
                  >
                    <ColorLensIcon />
                  </IconButton>
                </Grid>
              </Grid>
              
              {showColorPicker && (
                <Box sx={{ mt: 2 }}>
                  <ChromePicker 
                    color={editingTag.color}
                    onChange={(color) => setEditingTag({...editingTag, color: color.hex})}
                    disableAlpha
                  />
                </Box>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteTag(editingTag.id);
                    setShowEditDialog(false);
                  }}
                >
                  Delete Tag
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditTag} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </TagManagerContainer>
  );
};

export default TagManager;
