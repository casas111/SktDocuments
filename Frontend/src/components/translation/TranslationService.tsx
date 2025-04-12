import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
  Divider
} from '@mui/material';
import styled from '@emotion/styled';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import EnhancedTranslationNode from '../nodes/EnhancedTranslationNode';
import CustomInstructionEditor from '../common/CustomInstructionEditor';
import DocumentSelector from '../documents/DocumentSelector';
import TranslationsOutput from '../documents/TranslationsOutput';
import { UnifiedDocumentService } from '../../services/unifiedDocumentService';
import { Node } from 'reactflow';
import { Position } from 'reactflow';

// Styled components
const TranslationServiceContainer = styled(Box)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Available Claude models
const availableModels = [
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Balanced)' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Powerful)' }
];

// Types
interface FileItem {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ValidationErrors {
  doc1?: string;
  doc2?: string;
  template?: string;
  instruction?: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface EnhancedTranslationNodeData {
  label: string;
  description: string;
  sourceDoc1: FileItem | null;
  sourceDoc2: FileItem | null;
  templateDoc: FileItem | null;
  instruction: string;
  model: string;
}

const TranslationService: React.FC = () => {
  // Document state
  const [sourceDoc1, setSourceDoc1] = useState<FileItem | null>(null);
  const [sourceDoc2, setSourceDoc2] = useState<FileItem | null>(null);
  const [templateDoc, setTemplateDoc] = useState<FileItem | null>(null);
  const [outputDoc, setOutputDoc] = useState<FileItem | null>(null);
  
  // UI state
  const [instruction, setInstruction] = useState('');
  const [model, setModel] = useState('claude-3-haiku-20240307');
  const [loading, setLoading] = useState(false);
  const [docSelectorOpen, setDocSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'doc1' | 'doc2' | 'template'>('doc1');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [notification, setNotification] = useState<NotificationState>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Node data for preview
  const [nodeData, setNodeData] = useState<EnhancedTranslationNodeData>({
    label: 'Document Translation',
    description: 'Transforms documents using Claude AI',
    sourceDoc1: null,
    sourceDoc2: null,
    templateDoc: null,
    instruction: '',
    model: 'claude-3-haiku-20240307'
  });
  
  // Update node data when inputs change
  useEffect(() => {
    setNodeData({
      label: 'Document Translation',
      description: 'Transforms documents using Claude AI',
      sourceDoc1: sourceDoc1,
      sourceDoc2: sourceDoc2,
      templateDoc: templateDoc,
      instruction: instruction.substring(0, 50) + (instruction.length > 50 ? '...' : ''),
      model
    });
  }, [sourceDoc1, sourceDoc2, templateDoc, instruction, model]);
  
  // Handle document selection
  const handleDocumentSelected = (document: FileItem) => {
    if (!document) return;
    
    switch (selectorType) {
      case 'doc1':
        setSourceDoc1(document);
        // Clear validation error
        setValidationErrors(prev => ({ ...prev, doc1: undefined }));
        break;
      case 'doc2':
        setSourceDoc2(document);
        // Clear validation error
        setValidationErrors(prev => ({ ...prev, doc2: undefined }));
        break;
      case 'template':
        if (document.mimeType === 'application/pdf') {
          setTemplateDoc(document);
          // Clear validation error
          setValidationErrors(prev => ({ ...prev, template: undefined }));
        } else {
          setNotification({
            open: true,
            message: 'Template must be a PDF file',
            severity: 'error'
          });
        }
        break;
    }
    
    setDocSelectorOpen(false);
  };
  
  // Open document selector
  const openDocumentSelector = (type: 'doc1' | 'doc2' | 'template') => {
    setSelectorType(type);
    setDocSelectorOpen(true);
  };
  
  // Handle instruction change
  const handleInstructionChange = (value: string) => {
    setInstruction(value);
    
    // Clear validation error for instruction
    if (value.trim()) {
      setValidationErrors(prev => ({ ...prev, instruction: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
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
  
  // Process translation
  const handleProcessTranslation = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/translation/process`, {
        sourceDoc1Id: sourceDoc1!.id,
        sourceDoc2Id: sourceDoc2!.id,
        templateDocId: templateDoc!.id,
        instruction,
        model
      });
      
      if (response.data.success) {
        setNotification({
          open: true,
          message: 'Translation processed successfully',
          severity: 'success'
        });
        
        // Refresh translations list
        setRefreshTrigger(prev => prev + 1);
        
        // Set output document
        if (response.data.data && response.data.data.translatedDocument) {
          setOutputDoc(response.data.data.translatedDocument);
        }
      } else {
        setNotification({
          open: true,
          message: response.data.error || 'Error processing translation',
          severity: 'error'
        });
      }
    } catch (error: unknown) {
      console.error('Error processing translation:', error);
      setNotification({
        open: true,
        message: error instanceof Error && error.message ? error.message : 'Error processing translation',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Clear form
  const handleClearForm = () => {
    setSourceDoc1(null);
    setSourceDoc2(null);
    setTemplateDoc(null);
    setInstruction('');
    setValidationErrors({});
  };
  
  // Handle output file selection
  const handleOutputFileSelect = (file: FileItem | null) => {
    setOutputDoc(file);
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <TranslationServiceContainer>
      <Typography variant="h4" gutterBottom>
        Document Translation Service
      </Typography>
      <Typography variant="body1" paragraph>
        Transform documents using Claude AI by providing two source documents and a PDF template.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
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
            onModelChange={setModel}
            defaultModel={model}
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
            onFileSelect={handleOutputFileSelect}
            unifiedDocumentService={{} as any} // This will be fixed in the component
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
              dragging={false}
              targetPosition={Position.Left}
              sourcePosition={Position.Right}
              zIndex={1}
              type="translation"
              isConnectable={true}
              xPos={0}
              yPos={0}
              dragHandle=".drag-handle"
            />
          </Box>
        </Box>
      </Box>
      
      {/* Document Selector */}
      {docSelectorOpen && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectorType === 'template' ? 'Select PDF Template' : `Select Document ${selectorType === 'doc1' ? '1' : '2'}`}
          </Typography>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', height: '400px' }}>
            <DocumentSelector
              onSelect={handleDocumentSelected}
              fileTypeFilter={selectorType === 'template' ? ['application/pdf'] : undefined}
              initialPath="/"
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setDocSelectorOpen(false)}>Cancel</Button>
          </Box>
        </Box>
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
