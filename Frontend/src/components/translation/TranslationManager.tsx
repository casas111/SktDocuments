import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import styled from '@emotion/styled';
import TranslationNodeForm, { TranslationNodeFormData } from './TranslationNodeForm';
import TranslationService, { TranslationResult } from '../../services/TranslationService';
import { Position } from 'reactflow';
import EnhancedTranslationNode from '../nodes/EnhancedTranslationNode';

// Styled components
const TranslationManagerContainer = styled(Box)`
  padding: 24px;
`;

const ResultContainer = styled(Paper)`
  padding: 24px;
  margin-top: 24px;
  background-color: #f9f9f9;
`;

interface TranslationManagerProps {
  onNodeCreated?: (nodeData: any) => void;
  onClose?: () => void;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({
  onNodeCreated,
  onClose
}) => {
  // State
  const [showForm, setShowForm] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'info' | 'warning' | 'error'
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Services
  const translationService = new TranslationService();
  
  // Handle form submission
  const handleFormSubmit = async (formData: TranslationNodeFormData) => {
    setProcessing(true);
    
    try {
      // Process translation
      const result = await translationService.processTranslation({
        sourceDocIds: formData.inputDocumentUrls.map(doc => doc.url),
        templateDocId: formData.exampleFormatUrl,
        instruction: formData.instructions,
        model: formData.model
      });
      
      if (result.success) {
        setResult({
          success: true,
          status: 'success',
          data: result.data
        });
        
        // Create node data for workflow
        if (onNodeCreated) {
          const nodeData = {
            label: formData.nodeName,
            description: 'Transforms documents using Claude AI',
            sourceDoc1: formData.inputDocumentUrls[0]?.url ? {
              name: getFilenameFromUrl(formData.inputDocumentUrls[0].url),
              path: formData.inputDocumentUrls[0].url
            } : null,
            sourceDoc2: formData.inputDocumentUrls[1]?.url ? {
              name: getFilenameFromUrl(formData.inputDocumentUrls[1].url),
              path: formData.inputDocumentUrls[1].url
            } : null,
            templateDoc: formData.exampleFormatUrl ? {
              name: getFilenameFromUrl(formData.exampleFormatUrl),
              path: formData.exampleFormatUrl
            } : null,
            instruction: formData.instructions,
            model: formData.model,
            status: 'success',
            outputDoc: result.data?.translatedDocument ? {
              name: result.data.translatedDocument.name,
              path: result.data.translatedDocument.path
            } : null
          };
          
          onNodeCreated(nodeData);
        }
        
        // Hide form
        setShowForm(false);
      } else {
        setResult({
          success: false,
          status: 'error',
          error: result.error || 'Failed to process translation'
        });
      }
    } catch (error) {
      console.error('Error processing translation:', error);
      
      // Show error notification
      setNotification({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    if (processing) {
      // Show confirmation dialog
      setConfirmDialogOpen(true);
    } else {
      // Close directly
      if (onClose) onClose();
    }
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Handle confirm dialog close
  const handleConfirmDialogClose = (confirm: boolean) => {
    setConfirmDialogOpen(false);
    
    if (confirm && onClose) {
      onClose();
    }
  };
  
  // Handle create another
  const handleCreateAnother = () => {
    setResult(null);
    setShowForm(true);
  };
  
  // Extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'Unknown file';
    } catch (e) {
      return 'Invalid URL';
    }
  };
  
  return (
    <TranslationManagerContainer>
      <Typography variant="h4" gutterBottom>
        Translation Node Manager
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Create a translation node to process documents with Claude AI.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {showForm ? (
        <TranslationNodeForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : result?.status === 'success' ? (
        <ResultContainer elevation={2}>
          <Typography variant="h5" gutterBottom color="primary">
            Translation Completed Successfully
          </Typography>
          
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1">
              Output Document:
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box component="span" sx={{ mr: 1 }}>
                  {result.data?.translatedDocument?.name || 'Translated Document'}
                </Box>
                {result.data?.translatedDocument?.path && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={`http://localhost:3000/file/${result.data.translatedDocument.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </Button>
                )}
              </Box>
            </Typography>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCreateAnother}
            >
              Create Another Translation
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
            >
              Done
            </Button>
          </Box>
        </ResultContainer>
      ) : (
        <ResultContainer elevation={2}>
          <Typography variant="h5" gutterBottom color="error">
            Translation Failed
          </Typography>
          
          <Typography variant="body1" paragraph>
            {result?.error || 'An unknown error occurred during translation.'}
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCreateAnother}
            >
              Try Again
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Box>
        </ResultContainer>
      )}
      
      {/* Processing overlay */}
      {processing && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999
        }}>
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing Translation
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Claude AI is processing your documents. This may take a few minutes depending on document size and complexity.
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* Notifications */}
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
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleConfirmDialogClose(false)}
      >
        <DialogTitle>
          Cancel Translation?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            A translation is currently being processed. Are you sure you want to cancel?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)}>
            Continue Processing
          </Button>
          <Button onClick={() => handleConfirmDialogClose(true)} color="error">
            Cancel Translation
          </Button>
        </DialogActions>
      </Dialog>
    </TranslationManagerContainer>
  );
};

export default TranslationManager;
