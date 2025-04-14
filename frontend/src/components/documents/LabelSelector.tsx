import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  TextField, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Label as LabelIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelSelectorProps {
  selectedLabels: string[];
  availableLabels: Label[];
  onLabelsChange: (labelIds: string[]) => void;
  onCreateLabel?: (name: string, color: string) => Promise<void>;
  onDeleteLabel?: (id: string) => Promise<void>;
  loading?: boolean;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  availableLabels,
  onLabelsChange,
  onCreateLabel,
  onDeleteLabel,
  loading = false
}) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#0F4C81'); // Default Simetrik blue
  const [createLabelLoading, setCreateLabelLoading] = useState(false);
  
  const handleToggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onLabelsChange(selectedLabels.filter(id => id !== labelId));
    } else {
      onLabelsChange([...selectedLabels, labelId]);
    }
  };
  
  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !onCreateLabel) return;
    
    try {
      setCreateLabelLoading(true);
      await onCreateLabel(newLabelName, newLabelColor);
      setNewLabelName('');
      setNewLabelColor('#0F4C81');
    } catch (error) {
      console.error('Error creating label:', error);
    } finally {
      setCreateLabelLoading(false);
    }
  };
  
  const handleDeleteLabel = async (labelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!onDeleteLabel) return;
    
    try {
      await onDeleteLabel(labelId);
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Selected Labels */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Selected Labels
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedLabels.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No labels selected
            </Typography>
          ) : (
            selectedLabels.map(labelId => {
              const label = availableLabels.find(l => l.id === labelId);
              return label ? (
                <Chip
                  key={label.id}
                  label={label.name}
                  icon={<LabelIcon />}
                  sx={{ 
                    backgroundColor: label.color,
                    color: '#fff'
                  }}
                  onDelete={() => handleToggleLabel(label.id)}
                />
              ) : null;
            })
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Available Labels */}
      <Typography variant="subtitle2" gutterBottom>
        Available Labels
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {availableLabels.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No labels available" 
                primaryTypographyProps={{ color: 'text.secondary' }} 
              />
            </ListItem>
          ) : (
            availableLabels.map(label => (
              <ListItem 
                key={label.id}
                button
                onClick={() => handleToggleLabel(label.id)}
                secondaryAction={
                  onDeleteLabel && (
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => handleDeleteLabel(label.id, e)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedLabels.includes(label.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LabelIcon 
                        sx={{ 
                          mr: 1, 
                          color: label.color,
                          fontSize: 16
                        }} 
                      />
                      {label.name}
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      )}
      
      {/* Create New Label */}
      {onCreateLabel && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Create New Label
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <TextField
              size="small"
              label="Label Name"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              style={{ 
                width: 40, 
                height: 40, 
                padding: 0,
                border: 'none',
                cursor: 'pointer'
              }}
            />
            <Button
              variant="contained"
              startIcon={createLabelLoading ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim() || createLabelLoading}
            >
              Add
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default LabelSelector;
