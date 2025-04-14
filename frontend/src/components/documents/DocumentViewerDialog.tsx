import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import axios from 'axios';

interface DocumentViewerDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentName: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DocumentViewerDialog: React.FC<DocumentViewerDialogProps> = ({
  open,
  onClose,
  documentId,
  documentName
}) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch document when dialog opens
  useEffect(() => {
    if (open && documentId) {
      fetchDocument(documentId);
    }
  }, [open, documentId]);

  const fetchDocument = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/documents/${id}`);
      setDocument(response.data.data || null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to fetch document');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderDocumentContent = () => {
    if (!document) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="body1" color="text.secondary">
            No document content available
          </Typography>
        </Box>
      );
    }

    // In a real implementation, we would render different content based on document type
    return (
      <Box sx={{ p: 3, height: '50vh', overflow: 'auto' }}>
        <Typography variant="body1">
          Document content would be displayed here based on the document type.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Document ID: {document.id}
          <br />
          Name: {document.name}
          <br />
          Type: {document.type}
          <br />
          Size: {document.size} bytes
          <br />
          URL: {document.url}
          <br />
          Created: {new Date(document.createdAt).toLocaleString()}
          <br />
          Updated: {new Date(document.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    );
  };

  const renderMetadata = () => {
    if (!document) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="body1" color="text.secondary">
            No metadata available
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3, height: '50vh', overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Document Metadata
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            <strong>ID:</strong> {document.id}
          </Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {document.name}
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> {document.type}
          </Typography>
          <Typography variant="body2">
            <strong>Size:</strong> {document.size} bytes
          </Typography>
          <Typography variant="body2">
            <strong>Folder:</strong> {document.folderId}
          </Typography>
          <Typography variant="body2">
            <strong>Created:</strong> {new Date(document.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>Updated:</strong> {new Date(document.updatedAt).toLocaleString()}
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Labels
        </Typography>
        <Paper sx={{ p: 2 }}>
          {document.labels && document.labels.length > 0 ? (
            document.labels.map((label: any) => (
              <Box key={label.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{label.name}</strong> - {label.color}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No labels assigned
            </Typography>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{documentName}</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="document tabs">
                <Tab label="Document" />
                <Tab label="Metadata" />
              </Tabs>
            </Box>
            <Box sx={{ p: 0 }}>
              {activeTab === 0 && renderDocumentContent()}
              {activeTab === 1 && renderMetadata()}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.open(document?.url, '_blank')}
          disabled={!document?.url}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewerDialog;
