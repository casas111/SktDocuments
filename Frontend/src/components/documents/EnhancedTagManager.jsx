import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert, Chip, Grid, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Label as LabelIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Check as CheckIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';

// Styled components for enhanced UI
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    boxShadow: theme.shadows[5],
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontWeight: 600,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TagChip = styled(Chip)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: color || theme.palette.primary.main,
  color: theme.palette.getContrastText(color || theme.palette.primary.main),
  '&:hover': {
    backgroundColor: color ? `${color}dd` : theme.palette.primary.dark,
  },
}));

const ColorSwatch = styled(Box)(({ theme, color, selected }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: color,
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['border'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
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

// Enhanced Tag Manager Component
const EnhancedTagManager = ({ 
  tags = [],
  onTagCreate,
  onTagDelete,
  onTagEdit,
  onClose
}) => {
  const [allTags, setAllTags] = useState(tags);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  // Predefined colors
  const predefinedColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
  ];

  useEffect(() => {
    setAllTags(tags);
  }, [tags]);

  const handleNewTagNameChange = (event) => {
    setNewTagName(event.target.value);
  };

  const handleColorSelect = (color) => {
    setNewTagColor(color);
    setShowColorPicker(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTag = {
        id: editingTag ? editingTag.id : `tag-${Date.now()}`,
        name: newTagName,
        color: newTagColor
      };
      
      if (editingTag) {
        // Update existing tag
        const updatedTags = allTags.map(tag => 
          tag.id === editingTag.id ? newTag : tag
        );
        setAllTags(updatedTags);
        
        if (onTagEdit) {
          onTagEdit(newTag);
        }
        
        setNotification({
          open: true,
          message: `Tag "${newTagName}" updated successfully`,
          severity: 'success'
        });
      } else {
        // Create new tag
        setAllTags([...allTags, newTag]);
        
        if (onTagCreate) {
          onTagCreate(newTag);
        }
        
        setNotification({
          open: true,
          message: `Tag "${newTagName}" created successfully`,
          severity: 'success'
        });
      }
      
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setShowCreateDialog(false);
      setEditingTag(null);
    } catch (err) {
      setError(`Failed to ${editingTag ? 'update' : 'create'} tag: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedTags = allTags.filter(tag => tag.id !== tagId);
      setAllTags(updatedTags);
      
      if (onTagDelete) {
        onTagDelete(tagId);
      }
      
      setNotification({
        open: true,
        message: 'Tag deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to delete tag: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setShowCreateDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
    setNewTagName('');
    setNewTagColor('#3b82f6');
    setError(null);
    setEditingTag(null);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setError(null);
    setEditingTag(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Tag Manager
        </Typography>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Tag
        </ActionButton>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Available Tags
        </Typography>
        
        {allTags.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No tags available. Create your first tag to organize documents.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {allTags.map(tag => (
              <TagChip
                key={tag.id}
                label={tag.name}
                color={tag.color}
                icon={<LabelIcon />}
                onDelete={() => handleDeleteTag(tag.id)}
                onClick={() => handleEditTag(tag)}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Create/Edit Tag Dialog */}
      <StyledDialog
        open={showCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogTitle>
          <Typography variant="h6">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleCloseCreateDialog} aria-label="close">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <StyledDialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {editingTag 
              ? 'Edit this tag to update its name or color.'
              : 'Create a new tag to categorize and organize your documents.'}
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="tagName"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={handleNewTagNameChange}
            error={!!error}
            helperText={error}
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LabelIcon style={{ color: newTagColor }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Tag Color
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {predefinedColors.map(color => (
                <Grid item key={color}>
                  <Tooltip title={color}>
                    <ColorSwatch 
                      color={color} 
                      selected={newTagColor === color}
                      onClick={() => handleColorSelect(color)}
                    />
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
            
            <Button
              startIcon={<ColorLensIcon />}
              onClick={() => setShowColorPicker(!showColorPicker)}
              variant="outlined"
              color="primary"
              sx={{ mt: 1 }}
            >
              {showColorPicker ? 'Hide Color Picker' : 'Custom Color'}
            </Button>
            
            {showColorPicker && (
              <Box sx={{ mt: 2 }}>
                <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorSwatch color={newTagColor} selected />
                  <Typography variant="body2">{newTagColor}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </StyledDialogContent>
        <StyledDialogActions>
          <Button onClick={handleCloseCreateDialog} color="inherit">
            Cancel
          </Button>
          <ActionButton
            onClick={handleCreateTag}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loading 
              ? (editingTag ? 'Updating...' : 'Creating...') 
              : (editingTag ? 'Update Tag' : 'Create Tag')}
          </ActionButton>
        </StyledDialogActions>
      </StyledDialog>

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

export default EnhancedTagManager;
