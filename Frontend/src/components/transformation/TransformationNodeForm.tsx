import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import styled from '@emotion/styled';
import CustomInstructionEditor from '../common/CustomInstructionEditor';
import { Position } from 'reactflow';
import TransformationNodePreview from './TransformationNodePreview';
import { TransformationService } from './TransformationService';

// Create an instance of TransformationService
const transformationService = new TransformationService();

// Styled components
const FormContainer = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 500;
`;

const UrlInput = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

// Types
interface DocumentUrl {
  id: string;
  url: string;
}

interface TransformationNodeFormProps {
  onSubmit: (formData: TransformationNodeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TransformationNodeFormData>;
}

export interface TransformationNodeFormData {
  nodeName: string;
  inputDocumentUrls: DocumentUrl[];
  exampleFormatUrl: string;
  instructions: string;
  outputTemplate: string;
  model: string;
  outputDoc?: {
    name: string;
    path: string;
  } | null;
}

const TransformationNodeForm: React.FC<TransformationNodeFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  // Form state
  const [nodeName, setNodeName] = useState(initialData?.nodeName || 'Document Transformation');
  const [inputDocumentUrls, setInputDocumentUrls] = useState<DocumentUrl[]>(
    initialData?.inputDocumentUrls || [{ id: `doc-${Date.now()}`, url: '' }]
  );
  const [exampleFormatUrl, setExampleFormatUrl] = useState(initialData?.exampleFormatUrl || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [outputTemplate, setOutputTemplate] = useState(initialData?.outputTemplate || '');
  const [model, setModel] = useState(initialData?.model || 'claude-3-haiku-20240307');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Add new document URL input
  const handleAddDocumentUrl = () => {
    setInputDocumentUrls([
      ...inputDocumentUrls,
      { id: `doc-${Date.now()}`, url: '' }
    ]);
  };
  
  // Remove document URL input
  const handleRemoveDocumentUrl = (id: string) => {
    setInputDocumentUrls(inputDocumentUrls.filter(doc => doc.id !== id));
  };
  
  // Update document URL
  const handleDocumentUrlChange = (id: string, value: string) => {
    setInputDocumentUrls(
      inputDocumentUrls.map(doc => 
        doc.id === id ? { ...doc, url: value } : doc
      )
    );
    
    // Clear error when user types
    if (errors[`doc-${id}`]) {
      setErrors({ ...errors, [`doc-${id}`]: '' });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate node name
    if (!nodeName.trim()) {
      newErrors.nodeName = 'Node name is required';
    }
    
    // Validate document URLs
    inputDocumentUrls.forEach((doc, index) => {
      if (!doc.url.trim()) {
        newErrors[`doc-${doc.id}`] = 'Document URL is required';
      } else if (!isValidUrl(doc.url)) {
        newErrors[`doc-${doc.id}`] = 'Invalid URL format';
      }
    });
    
    // Validate example format URL
    if (!exampleFormatUrl.trim()) {
      newErrors.exampleFormatUrl = 'Example format URL is required';
    } else if (!isValidUrl(exampleFormatUrl)) {
      newErrors.exampleFormatUrl = 'Invalid URL format';
    } else if (!exampleFormatUrl.toLowerCase().endsWith('.pdf')) {
      newErrors.exampleFormatUrl = 'Example format must be a PDF file';
    }
    
    // Validate instructions
    if (!instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    } else if (instructions.trim().length < 10) {
      newErrors.instructions = 'Instructions must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Create transformation request
        const transformationRequest = {
          nodeName,
          inputDocumentUrls,
          exampleFormatUrl,
          instruction: instructions,
          outputTemplate: outputTemplate,
          model
        };

        // Call transformation service
        const result = await transformationService.processTransformation({
          sourceDocIds: inputDocumentUrls.map(doc => doc.url),
          templateDocId: exampleFormatUrl,
          instruction: instructions,
          outputTemplate: outputTemplate,
          model: model
        });
        
        if (result.success) {
          // Call the parent onSubmit with the result
          onSubmit({
            nodeName,
            inputDocumentUrls,
            exampleFormatUrl,
            instructions,
            outputTemplate,
            model,
            outputDoc: result.data?.transformedDocument ? {
              name: result.data.transformedDocument.name,
              path: result.data.transformedDocument.path
            } : null
          });
        } else {
          // Show error message
          setErrors({ submit: result.error || 'Failed to process transformation' });
        }
      } catch (error) {
        console.error('Error processing transformation:', error);
        setErrors({ submit: error instanceof Error ? error.message : 'Unknown error occurred' });
      }
    }
  };
  
  // Toggle node preview
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
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
  
  // Create preview node data
  const createPreviewNodeData = () => ({
    label: 'Document Transformation',
    description: 'Transforms documents using Claude AI',
    sourceDoc: inputDocumentUrls[0]?.url ? {
      name: getFilenameFromUrl(inputDocumentUrls[0].url),
      path: inputDocumentUrls[0].url
    } : null,
    templateDoc: exampleFormatUrl ? {
      name: getFilenameFromUrl(exampleFormatUrl),
      path: exampleFormatUrl
    } : null,
    instruction: instructions,
    outputTemplate: outputTemplate,
    model: model,
    status: 'idle' as const,
    outputDoc: null
  });
  
  return (
    <FormContainer elevation={3}>
      <SectionTitle variant="h5">
        Transformation Node Setup
      </SectionTitle>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure your transformation node with document URLs and instructions for Claude AI.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Node Name */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">
          Node Name
        </SectionTitle>
        <TextField
          fullWidth
          label="Node Name"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          error={!!errors.nodeName}
          helperText={errors.nodeName || 'Enter a descriptive name for this transformation node'}
          variant="outlined"
        />
      </Box>
      
      {/* Input Document URLs */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">
          Input Document URLs
        </SectionTitle>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add URLs to the documents you want to process (e.g., http://localhost:3000/file/document.txt)
        </Typography>
        
        <List disablePadding>
          {inputDocumentUrls.map((doc, index) => (
            <ListItem key={doc.id} disablePadding sx={{ mb: 1 }}>
              <UrlInput sx={{ width: '100%' }}>
                <ListItemIcon>
                  <LinkIcon />
                </ListItemIcon>
                <TextField
                  fullWidth
                  label={`Document ${index + 1} URL`}
                  value={doc.url}
                  onChange={(e) => handleDocumentUrlChange(doc.id, e.target.value)}
                  error={!!errors[`doc-${doc.id}`]}
                  helperText={errors[`doc-${doc.id}`] || ''}
                  variant="outlined"
                  size="small"
                />
                <IconButton 
                  onClick={() => handleRemoveDocumentUrl(doc.id)}
                  disabled={inputDocumentUrls.length <= 1}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </UrlInput>
            </ListItem>
          ))}
        </List>
        
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddDocumentUrl}
          variant="outlined"
          sx={{ mt: 1 }}
          disabled={inputDocumentUrls.length >= 5}
        >
          Add Document URL
        </Button>
      </Box>
      
      {/* Example Format URL */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">
          Example Format URL (PDF)
        </SectionTitle>
        <TextField
          fullWidth
          label="Example Format URL"
          value={exampleFormatUrl}
          onChange={(e) => setExampleFormatUrl(e.target.value)}
          error={!!errors.exampleFormatUrl}
          helperText={errors.exampleFormatUrl || 'Enter the URL to a PDF file that serves as a template'}
          variant="outlined"
        />
      </Box>
      
      {/* Instructions */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">
          Instructions for Claude AI
        </SectionTitle>
        <CustomInstructionEditor
          value={instructions}
          onChange={setInstructions}
          error={errors.instructions}
          onModelChange={setModel}
          defaultModel={model}
        />
      </Box>
      
      {/* Output Template */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">
          Output Template
        </SectionTitle>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Output Template"
          value={outputTemplate}
          onChange={(e) => setOutputTemplate(e.target.value)}
          helperText="Optional template for structuring the output"
          variant="outlined"
        />
      </Box>
      
      {/* Preview */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleTogglePreview}
          sx={{ mb: 2 }}
        >
          {showPreview ? 'Hide Preview' : 'Show Node Preview'}
        </Button>
        
        {showPreview && (
          <Box sx={{ 
            border: '1px dashed #ccc', 
            borderRadius: 2, 
            p: 2, 
            bgcolor: '#fafafa',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <TransformationNodePreview 
              data={createPreviewNodeData()}
            />
          </Box>
        )}
      </Box>
      
      {/* Form Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Create Transformation Node
        </Button>
      </Box>
    </FormContainer>
  );
};

export default TransformationNodeForm;
