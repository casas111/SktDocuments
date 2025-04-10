import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDocuments } from '../hooks/useDocuments';
import { formatFileSize } from '../utils/format';

const DocumentList: React.FC = () => {
  const { documents, loading, error, handleDelete, refresh } = useDocuments();

  const handleDownload = async (documentId: string) => {
    try {
      // TODO: Implement download functionality
      console.log('Downloading document:', documentId);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Documents</Typography>
        <IconButton onClick={refresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <List>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="download"
                  onClick={() => handleDownload(doc.id)}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(doc.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={doc.originalName}
              secondary={
                <>
                  Type: {doc.mimetype} - Size: {formatFileSize(doc.size)}
                  <br />
                  Uploaded: {new Date(doc.uploadDate).toLocaleString()}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DocumentList; 