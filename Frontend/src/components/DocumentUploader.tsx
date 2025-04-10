import React, { useCallback, useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { 
  Button, 
  CircularProgress, 
  Typography, 
  Box,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DocumentUploader: React.FC = () => {
  const { handleUpload, loading } = useDocuments();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadProgress(0);

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    const metadata = {
      description: 'Uploaded document',
      type: file.type,
    };

    try {
      const result = await handleUpload(file, metadata);
      if (result) {
        setShowSuccess(true);
        setUploadProgress(100);
        // Reset file input
        event.target.value = '';
      }
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    }
  }, [handleUpload]);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <input
        accept="*/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={onFileChange}
        disabled={loading}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </label>

      {loading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          Document uploaded successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentUploader; 