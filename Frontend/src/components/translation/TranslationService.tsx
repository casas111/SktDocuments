import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import styled from '@emotion/styled';
import { API_BASE_URL } from '../../config/api';
import EnhancedTranslationNode from '../nodes/EnhancedTranslationNode';
import CustomInstructionEditor from '../common/CustomInstructionEditor';
import DocumentSelector from '../documents/DocumentSelector';
import TranslationsOutput from '../documents/TranslationsOutput';

const TranslationServiceContainer = styled(Box)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TranslationService = () => {
  const [loading, setLoading] = useState(false);
  const [sourceDoc1, setSourceDoc1] = useState(null);
  const [sourceDoc2, setSourceDoc2] = useState(null);
  const [templateDoc, setTemplateDoc] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [model, setModel] = useState('claude-3-haiku-20240307');
  const [outputDoc, setOutputDoc] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [docSelectorOpen, setDocSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/translation/models`);
        if (response.data.success && response.data.models) {
          setAvailableModels(response.data.models);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  const handleDocumentSelected = (document) => {
    if (!document) return;

    switch (selectorType) {
      case 'doc1':
        setSourceDoc1(document);
        break;
      case 'doc2':
        setSourceDoc2(document);
        break;
      case 'template':
        if (document.mimeType !== 'application/pdf') {
          setNotification({
            open: true,
            message: 'Template must be a PDF file',
            severity: 'error'
          });
          return;
        }
        setTemplateDoc(document);
        break;
      default:
        break;
    }

    setDocSelectorOpen(false);
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [selectorType]: undefined
    }));
  };

  const openDocumentSelector = (type) => {
    setSelectorType(type);
    setDocSelectorOpen(true);
  };

  const handleInstructionChange = (value) => {
    setInstruction(value);
    
    // Clear validation error for instruction
    if (value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        instruction: undefined
      }));
    }
  };

  const validateInputs = () => {
    const errors = {};
    
    if (!sourceDoc1) {
      errors.doc1 = 'First document is required';
    }
    
    if (!sourceDoc2) {
      errors.doc2 = 'Second document is required';
    }
    
    if (!templateDoc) {
      errors.template = 'Template document is required';
    } else if (templateDoc.mimeType !== 'application/pdf') {
      errors.template = 'Template must be a PDF file';
    }
    
    if (!instruction.trim()) {
      errors.instruction = 'Instruction is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProcessTranslation = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/translation/process`, {
        sourceDoc1Id: sourceDoc1.id,
        sourceDoc2Id: sourceDoc2.id,
        templateDocId: templateDoc.id,
        instruction,
        model
      });

      if (response.data.success) {
        setOutputDoc(response.data.data.translatedDocument);
        setNotification({
          open: true,
          message: 'Translation completed successfully',
          severity: 'success'
        });
        setRefreshTrigger(prev => prev + 1);
      } else {
        setNotification({
          open: true,
          message: response.data.error || 'Translation failed',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error processing translation:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Error processing translation',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleOutputFileSelect = (file) => {
    setOutputDoc(file);
  };

  const handleClearForm = () => {
    setSourceDoc1(null);
    setSourceDoc2(null);
    setTemplateDoc(null);
    setInstruction('');
    setOutputDoc(null);
    setValidationErrors({});
  };

  // Mock node data for the preview
  const nodeData = {
    label: 'Document Translation',
    description: 'Transforms documents using a template format with Claude AI',
    inputDoc1: sourceDoc1,
    inputDoc2: sourceDoc2,
    templateDoc: templateDoc,
    instruction: instruction,
    outputDoc: outputDoc
  };

  return (
    <TranslationServiceContainer>
      <Typography variant="h4" gutterBottom>
        Document Translation Service
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Transform documents using a template format with Claude AI. Select two source documents and a PDF template, 
        then provide custom instructions for how Claude should transform them.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', md: 'nowrap' }, mt: 4 }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '60%' } }}>
          <Typography variant="h6" gutterBottom>
            Input Documents
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Document 1
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => openDocumentSelector('doc1')}
              fullWidth
              sx={{ mb: 1 }}
              color={validationErrors.doc1 ? 'error' : 'primary'}
            >
              {sourceDoc1 ? `Selected: ${sourceDoc1.name}` : 'Select Document 1'}
            </Button>
            {validationErrors.doc1 && (
              <Typography color="error" variant="caption">
                {validationErrors.doc1}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Document 2
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => openDocumentSelector('doc2')}
              fullWidth
              sx={{ mb: 1 }}
              color={validationErrors.doc2 ? 'error' : 'primary'}
            >
              {sourceDoc2 ? `Selected: ${sourceDoc2.name}` : 'Select Document 2'}
            </Button>
            {validationErrors.doc2 && (
              <Typography color="error" variant="caption">
                {validationErrors.doc2}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              PDF Template
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => openDocumentSelector('template')}
              fullWidth
              sx={{ mb: 1 }}
              color={validationErrors.template ? 'error' : 'primary'}
            >
              {templateDoc ? `Selected: ${templateDoc.name}` : 'Select PDF Template'}
            </Button>
            {validationErrors.template && (
              <Typography color="error" variant="caption">
                {validationErrors.template}
              </Typography>
            )}
          </Box>
          
          <CustomInstructionEditor 
            value={instruction}
            onChange={handleInstructionChange}
            error={validationErrors.instruction}
            selectedModel={model}
            onModelChange={setModel}
            availableModels={availableModels.map(m => ({ id: m.id, name: m.name }))}
          />
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleProcessTranslation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ flex: 1 }}
            >
              {loading ? 'Processing...' : 'Process Translation'}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={handleClearForm}
              disabled={loading}
              sx={{ flex: 0.3 }}
            >
              Clear
            </Button>
          </Box>
          
          <TranslationsOutput 
            nodeId="translation-service" 
            refreshTrigger={refreshTrigger}
            onFileSelect={handleOutputFileSelect}
          />
        </Box>
        
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '40%' } }}>
          <Typography variant="h6" gutterBottom>
            Node Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This is how the translation node will appear in the workflow canvas.
          </Typography>
          
          <Box sx={{ 
            border: '1px dashed #ccc', 
            borderRadius: 2, 
            p: 2, 
            bgcolor: '#fafafa',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <EnhancedTranslationNode 
              id="preview-node"
              data={nodeData}
              selected={false}
            />
          </Box>
        </Box>
      </Box>
      
      {/* Document Selector Dialog */}
      {docSelectorOpen && (
        <DocumentSelector 
          open={docSelectorOpen}
          onClose={() => setDocSelectorOpen(false)}
          onSelect={handleDocumentSelected}
          fileTypeFilter={selectorType === 'template' ? ['application/pdf'] : undefined}
          title={selectorType === 'template' ? 'Select PDF Template' : `Select Document ${selectorType === 'doc1' ? '1' : '2'}`}
        />
      )}
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </TranslationServiceContainer>
  );
};

export default TranslationService;
