import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styled from '@emotion/styled';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Chip,
  Collapse,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FileUploader from '../common/FileUploader';
import FileDownloader from '../common/FileDownloader';
import DocumentSelector from '../documents/DocumentSelector';

// Styled components for the node
const NodeCard = styled(Card)`
  min-width: 320px;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #e8f5e9;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const NodeContent = styled(CardContent)`
  padding: 16px !important;
  overflow: visible !important;
`;

const NodeFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
`;

const InputOutputSection = styled.div`
  margin-top: 12px;
  font-size: 0.85rem;
`;

// Fixed position handles that don't move on hover
const InputHandle = styled(Handle)`
  background-color: #4caf50;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  left: -7px !important;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const OutputHandle = styled(Handle)`
  background-color: #ff9800;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  right: -7px !important;
  
  &:hover {
    background-color: #f57c00;
  }
`;

const FilePreview = styled(Paper)`
  padding: 8px 12px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const InstructionField = styled(TextField)`
  margin: 12px 0;
  .MuiOutlinedInput-root {
    background-color: #fafafa;
    &:hover {
      background-color: #f5f5f5;
    }
    &.Mui-focused {
      background-color: #fff;
    }
  }
`;

interface TranslationNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    onDelete?: () => void;
    inputDoc1?: any;
    inputDoc2?: any;
    templateDoc?: any;
    instruction?: string;
    outputDoc?: any;
  };
  selected: boolean;
}

const EnhancedTranslationNode: React.FC<TranslationNodeProps> = ({ id, data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const [docSelectorOpen, setDocSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'doc1' | 'doc2' | 'template'>('doc1');
  const [instruction, setInstruction] = useState(data.instruction || '');
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    doc1?: string;
    doc2?: string;
    template?: string;
    instruction?: string;
  }>({});
  
  // Update instruction in data when it changes
  useEffect(() => {
    if (data.instruction !== instruction) {
      // This would typically update the node data in the parent component
      console.log('Instruction updated:', instruction);
    }
  }, [instruction, data.instruction]);
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to node drag
    setExpanded(!expanded);
  };
  
  const openDocumentSelector = (type: 'doc1' | 'doc2' | 'template') => {
    setSelectorType(type);
    setDocSelectorOpen(true);
  };
  
  const handleDocumentSelected = (document: any) => {
    // This would typically update the node data in the parent component
    console.log(`Selected document for ${selectorType}:`, document);
    setDocSelectorOpen(false);
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [selectorType]: undefined
    }));
  };
  
  const handleInstructionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstruction(e.target.value);
    
    // Clear validation error for instruction
    if (e.target.value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        instruction: undefined
      }));
    }
  };
  
  const validateInputs = () => {
    const errors: {
      doc1?: string;
      doc2?: string;
      template?: string;
      instruction?: string;
    } = {};
    
    if (!data.inputDoc1) {
      errors.doc1 = 'First document is required';
    }
    
    if (!data.inputDoc2) {
      errors.doc2 = 'Second document is required';
    }
    
    if (!data.templateDoc) {
      errors.template = 'Template document is required';
    } else if (data.templateDoc.type !== 'application/pdf') {
      errors.template = 'Template must be a PDF file';
    }
    
    if (!instruction.trim()) {
      errors.instruction = 'Instruction is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProcessTranslation = () => {
    if (!validateInputs()) {
      return;
    }
    
    setProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      // This would typically update the node data with the output document
      console.log('Translation processed');
    }, 2000);
  };
  
  return (
    <NodeCard 
      variant="outlined" 
      sx={{ 
        borderColor: selected ? '#388e3c' : 'transparent',
        transform: 'none !important', // Prevent transform conflicts with ReactFlow
      }}
    >
      {/* Fixed position input handles */}
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="inputDoc1" 
        style={{ top: 60 }} 
      />
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="inputDoc2" 
        style={{ top: 100 }} 
      />
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="templateDoc" 
        style={{ top: 140 }} 
      />
      
      <NodeHeader>
        <TranslateIcon style={{ color: '#4caf50', marginRight: '8px' }} />
        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ flexGrow: 1 }}>
          {data.label || 'Document Translation'}
        </Typography>
        <Chip 
          size="small" 
          label="Translate" 
          color="success" 
          variant="outlined" 
          sx={{ ml: 1, fontSize: '0.7rem', flexShrink: 0 }}
        />
      </NodeHeader>
      
      <NodeContent>
        <Typography variant="body2" color="text.secondary">
          {data.description || 'Transforms documents using a template format with Claude AI'}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <InputOutputSection>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="success.main" fontWeight="bold">
              Inputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• 2 source documents</Typography>
              <Typography variant="caption" display="block">• 1 PDF template</Typography>
              <Typography variant="caption" display="block">• Custom instruction</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="caption" color="warning.main" fontWeight="bold">
              Outputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• Transformed document (saved to "translations" folder)</Typography>
            </Box>
          </Box>
        </InputOutputSection>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              Document Selection
              <Tooltip title="Select 2 documents and 1 PDF template from your document library">
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            {/* Document 1 Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Document 1:
              </Typography>
              
              {data.inputDoc1 ? (
                <FilePreview>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>{data.inputDoc1.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.inputDoc1.size ? `${(data.inputDoc1.size / 1024).toFixed(1)} KB` : ''}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => console.log('Remove doc1')}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </FilePreview>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => openDocumentSelector('doc1')}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                    color={validationErrors.doc1 ? 'error' : 'primary'}
                  >
                    Select Document 1
                  </Button>
                  {validationErrors.doc1 && (
                    <FormHelperText error>{validationErrors.doc1}</FormHelperText>
                  )}
                </>
              )}
            </Box>
            
            {/* Document 2 Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Document 2:
              </Typography>
              
              {data.inputDoc2 ? (
                <FilePreview>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>{data.inputDoc2.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.inputDoc2.size ? `${(data.inputDoc2.size / 1024).toFixed(1)} KB` : ''}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => console.log('Remove doc2')}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </FilePreview>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => openDocumentSelector('doc2')}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                    color={validationErrors.doc2 ? 'error' : 'primary'}
                  >
                    Select Document 2
                  </Button>
                  {validationErrors.doc2 && (
                    <FormHelperText error>{validationErrors.doc2}</FormHelperText>
                  )}
                </>
              )}
            </Box>
            
            {/* Template Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                PDF Template:
              </Typography>
              
              {data.templateDoc ? (
                <FilePreview>
                  <PictureAsPdfIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>{data.templateDoc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.templateDoc.size ? `${(data.templateDoc.size / 1024).toFixed(1)} KB` : ''}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => console.log('Remove template')}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </FilePreview>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => openDocumentSelector('template')}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                    color={validationErrors.template ? 'error' : 'primary'}
                  >
                    Select PDF Template
                  </Button>
                  {validationErrors.template && (
                    <FormHelperText error>{validationErrors.template}</FormHelperText>
                  )}
                </>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Custom Instruction */}
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              Custom Instruction
              <Tooltip title="Provide instructions to Claude AI on how to transform the documents using the template">
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <InstructionField
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              placeholder="Please transform these documents into the output format..."
              value={instruction}
              onChange={handleInstructionChange}
              error={!!validationErrors.instruction}
              helperText={validationErrors.instruction || 'Provide clear instructions for Claude AI'}
              InputProps={{
                sx: { fontSize: '0.9rem' }
              }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            {/* Process Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleProcessTranslation}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <TranslateIcon />}
              sx={{ mb: 2 }}
            >
              {processing ? 'Processing...' : 'Process Translation'}
            </Button>
            
            {/* Output Section */}
            <Typography variant="subtitle2" gutterBottom>
              Output
            </Typography>
            
            {data.outputDoc ? (
              <Box sx={{ mb: 1 }}>
                <FilePreview>
                  <DescriptionIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>{data.outputDoc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.outputDoc.size ? `${(data.outputDoc.size / 1024).toFixed(1)} KB` : ''}
                      <Chip 
                        size="small" 
                        label="Saved to translations folder" 
                        color="success" 
                        variant="outlined"
                        sx={{ ml: 1, fontSize: '0.6rem' }}
                      />
                    </Typography>
                  </Box>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => console.log('Download output')}>
                      <FileDownloader
                        nodeId={id}
                        outputId="translatedDocument" 
                        label=""
                        buttonOnly
                      />
                    </IconButton>
                  </Tooltip>
                </FilePreview>
              </Box>
            ) : (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                Processed document will appear here and be saved to the "translations" folder
              </Alert>
            )}
          </Box>
        </Collapse>
      </NodeContent>
      
      <NodeFooter>
        <IconButton size="small" onClick={toggleExpanded}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        <IconButton 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            if (data.onDelete) data.onDelete();
          }} 
          aria-label="delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </NodeFooter>
      
      {/* Fixed position output handle */}
      <OutputHandle 
        type="source" 
        position={Position.Right} 
        id="translatedDocument" 
        style={{ top: 100 }}
      />
      
      {/* Document Selector Dialog */}
      <Dialog 
        open={docSelectorOpen} 
        onClose={() => setDocSelectorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectorType === 'template' ? 'Select PDF Template' : `Select Document ${selectorType === 'doc1' ? '1' : '2'}`}
        </DialogTitle>
        <DialogContent>
          <DocumentSelector 
            onSelect={handleDocumentSelected}
            fileTypeFilter={selectorType === 'template' ? ['application/pdf'] : undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocSelectorOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </NodeCard>
  );
};

export default EnhancedTranslationNode;
