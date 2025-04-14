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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider
} from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import axios from 'axios';

interface MoveDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName: string;
  currentFolderId: string | null;
  onMove: (documentId: string, folderId: string) => Promise<void>;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MoveDocumentDialog: React.FC<MoveDocumentDialogProps> = ({
  open,
  onClose,
  documentId,
  documentName,
  currentFolderId,
  onMove
}) => {
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);

  // Fetch folders when dialog opens
  useEffect(() => {
    if (open) {
      fetchFolders();
    }
  }, [open]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/folders`);
      setFolders(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to fetch folders');
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (!documentId || !selectedFolderId) return;
    
    try {
      setMoveLoading(true);
      await onMove(documentId, selectedFolderId);
      setMoveLoading(false);
      onClose();
    } catch (err) {
      console.error('Error moving document:', err);
      setError('Failed to move document');
      setMoveLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Move {documentName}</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          Select a destination folder:
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {folders.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No folders available" 
                  primaryTypographyProps={{ color: 'text.secondary' }} 
                />
              </ListItem>
            ) : (
              folders.map(folder => (
                <ListItem 
                  key={folder.id}
                  button
                  selected={selectedFolderId === folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  disabled={folder.id === currentFolderId}
                >
                  <ListItemIcon>
                    <FolderIcon color={folder.id === currentFolderId ? 'disabled' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={folder.name}
                    secondary={folder.id === currentFolderId ? 'Current folder' : ''}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleMove} 
          variant="contained"
          disabled={!selectedFolderId || selectedFolderId === currentFolderId || moveLoading}
        >
          {moveLoading ? <CircularProgress size={24} /> : 'Move'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveDocumentDialog;
