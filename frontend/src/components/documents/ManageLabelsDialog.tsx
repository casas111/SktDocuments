import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ManageLabelsDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageLabelsDialog: React.FC<ManageLabelsDialogProps> = ({
  open,
  onClose,
  documentId,
  documentName
}) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [documentLabels, setDocumentLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#0F4C81'); // Default Simetrik blue
  const [createLabelLoading, setCreateLabelLoading] = useState(false);

  // Fetch labels and document labels when dialog opens
  useEffect(() => {
    if (open && documentId) {
      fetchLabels();
      fetchDocumentLabels(documentId);
    }
  }, [open, documentId]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/labels`);
      setLabels(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to fetch labels');
      setLoading(false);
    }
  };

  const fetchDocumentLabels = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/documents/${id}`);
      const document = response.data.data || {};
      setDocumentLabels((document.labels || []).map((label: Label) => label.id));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching document labels:', err);
      setError('Failed to fetch document labels');
      setLoading(false);
    }
  };

  const handleToggleLabel = async (labelId: string) => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      
      if (documentLabels.includes(labelId)) {
        // Remove label from document
        await axios.delete(`${API_URL}/labels/document/${documentId}/${labelId}`);
        setDocumentLabels(documentLabels.filter(id => id !== labelId));
      } else {
        // Add label to document
        await axios.post(`${API_URL}/labels/document`, {
          documentId,
          labelId
        });
        setDocumentLabels([...documentLabels, labelId]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error toggling label:', err);
      setError('Failed to update document labels');
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    try {
      setCreateLabelLoading(true);
      
      const response = await axios.post(`${API_URL}/labels`, {
        name: newLabelName,
        color: newLabelColor
      });
      
      const newLabel = response.data.data;
      setLabels([...labels, newLabel]);
      
      // Automatically add the new label to the document
      if (documentId) {
        await axios.post(`${API_URL}/labels/document`, {
          documentId,
          labelId: newLabel.id
        });
        setDocumentLabels([...documentLabels, newLabel.id]);
      }
      
      setNewLabelName('');
      setNewLabelColor('#0F4C81');
      setCreateLabelLoading(false);
    } catch (err) {
      console.error('Error creating label:', err);
      setError('Failed to create label');
      setCreateLabelLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Labels for {documentName}</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Typography variant="subtitle1" gutterBottom>
          Applied Labels
        </Typography>
        
        <Box sx={{ mb: 3, minHeight: 50 }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : documentLabels.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No labels applied to this document
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {documentLabels.map(labelId => {
                const label = labels.find(l => l.id === labelId);
                return label ? (
                  <Chip
                    key={label.id}
                    label={label.name}
                    sx={{ 
                      backgroundColor: label.color,
                      color: '#fff'
                    }}
                    onDelete={() => handleToggleLabel(label.id)}
                  />
                ) : null;
              })}
            </Box>
          )}
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Available Labels
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {labels.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No labels available
                </Typography>
              </Grid>
            ) : (
              labels
                .filter(label => !documentLabels.includes(label.id))
                .map(label => (
                  <Grid item key={label.id}>
                    <Chip
                      label={label.name}
                      sx={{ 
                        backgroundColor: label.color,
                        color: '#fff'
                      }}
                      onClick={() => handleToggleLabel(label.id)}
                    />
                  </Grid>
                ))
            )}
          </Grid>
        )}
        
        <Typography variant="subtitle1" gutterBottom>
          Create New Label
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageLabelsDialog;
