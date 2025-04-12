import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';

interface TranslationAPIProps {
  nodeId: string;
  sourceDoc1Id?: string;
  sourceDoc2Id?: string;
  templateDocId?: string;
  instruction?: string;
  model?: string;
  onProcessingStart?: () => void;
  onProcessingComplete?: (result: any) => void;
  onProcessingError?: (error: Error) => void;
}

const TranslationAPI: React.FC<TranslationAPIProps> = ({
  nodeId,
  sourceDoc1Id,
  sourceDoc2Id,
  templateDocId,
  instruction,
  model = 'claude-3-haiku-20240307',
  onProcessingStart,
  onProcessingComplete,
  onProcessingError
}) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const processTranslation = async () => {
    if (!sourceDoc1Id || !sourceDoc2Id || !templateDocId || !instruction) {
      setError('Missing required parameters');
      if (onProcessingError) {
        onProcessingError(new Error('Missing required parameters'));
      }
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      if (onProcessingStart) {
        onProcessingStart();
      }
      
      const response = await axios.post(`${API_ENDPOINTS.TRANSLATION}/process`, {
        nodeId,
        sourceDoc1Id,
        sourceDoc2Id,
        templateDocId,
        instruction,
        model
      });
      
      if (response.data.success) {
        setResult(response.data.data);
        if (onProcessingComplete) {
          onProcessingComplete(response.data.data);
        }
      } else {
        throw new Error(response.data.error || 'Failed to process translation');
      }
    } catch (error) {
      console.error('Error processing translation:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      if (onProcessingError && error instanceof Error) {
        onProcessingError(error);
      }
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={processTranslation}
        disabled={processing || !sourceDoc1Id || !sourceDoc2Id || !templateDocId || !instruction}
        startIcon={processing ? <CircularProgress size={20} /> : null}
        fullWidth
      >
        {processing ? 'Processing...' : 'Process Translation'}
      </Button>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      
      {result && !error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Translation Complete
          </Typography>
          <Typography variant="body2">
            Output file: {result.translatedDocument?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TranslationAPI;
