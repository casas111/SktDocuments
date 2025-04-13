import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DocumentSelector from '../documents/DocumentSelector';
import TransformationNodePreview from './TransformationNodePreview';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Styled components
const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 500,
  textTransform: 'none',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'linear-gradient(to bottom, #ffffff, #f9f9ff)',
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(45deg, #f5f7ff 30%, #eef2ff 90%)',
  borderBottom: '1px solid #e0e0e0',
}));

// Types for document selection
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

interface TransformationNodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (nodeData: any) => void;
  initialData?: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`node-tabpanel-${index}`}
      aria-labelledby={`node-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TransformationNodeForm: React.FC<TransformationNodeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [instruction, setInstruction] = useState(initialData?.instruction || '');
  const [outputTemplate, setOutputTemplate] = useState(initialData?.outputTemplate || '');
  const [model, setModel] = useState(initialData?.model || 'claude-3-haiku-20240307');
  const [templateDoc, setTemplateDoc] = useState<FileItem | null>(initialData?.templateDoc || null);
  
  // Document selector state
  const [docSelectorOpen, setDocSelectorOpen] = useState(false);
  const [docSelectorType, setDocSelectorType] = useState<'template' | null>(null);
  
  // Preview state
  const [previewData, setPreviewData] = useState({
    name: '',
    description: '',
    instruction: '',
    outputTemplate: '',
    model: '',
    templateDoc: null as FileItem | null
  });
  
  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setInstruction(initialData?.instruction || '');
      setOutputTemplate(initialData?.outputTemplate || '');
      setModel(initialData?.model || 'claude-3-haiku-20240307');
      setTemplateDoc(initialData?.templateDoc || null);
      setError(null);
      setSuccess(null);
      setTabValue(0);
    }
  }, [isOpen, initialData]);
  
  // Update preview data when form fields change
  React.useEffect(() => {
    setPreviewData({
      name,
      description,
      instruction,
      outputTemplate,
      model,
      templateDoc
    });
  }, [name, description, instruction, outputTemplate, model, templateDoc]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenDocSelector = (type: 'template') => {
    setDocSelectorType(type);
    setDocSelectorOpen(true);
  };
  
  const handleCloseDocSelector = () => {
    setDocSelectorOpen(false);
    setDocSelectorType(null);
  };
  
  const handleDocumentSelected = (document: FileItem) => {
    if (!document) return;
    
    if (docSelectorType === 'template') {
      setTemplateDoc(document);
    }
    
    setDocSelectorOpen(false);
    setDocSelectorType(null);
  };
  
  const handleRemoveDocument = (type: 'template') => {
    if (type === 'template') {
      setTemplateDoc(null);
    }
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!instruction.trim()) {
      setError('Instruction is required');
      return false;
    }
    
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare node data
      const nodeData = {
        name,
        description,
        instruction,
        outputTemplate,
        model,
        templateDocId: templateDoc?.id || null
      };
      
      // Call API to create node
      const response = await axios.post(`${API_BASE_URL}/transformation/node`, nodeData);
      
      if (response.data.success) {
        setSuccess('Transformation node created successfully');
        
        // Call onSave callback with created node data
        if (onSave) {
          onSave(response.data.data);
        }
        
        // Close dialog after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.data.error || 'Failed to create transformation node');
      }
    } catch (error: any) {
      console.error('Error creating transformation node:', error);
      setError(error.message || 'An error occurred while creating the transformation node');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : '90vh'
        }
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6">
          {initialData ? 'Edit Transformation Node' : 'Create Transformation Node'}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="node form tabs"
          variant={isMobile ? "fullWidth" : "standard"}
          centered
          sx={{ px: 2 }}
        >
          <StyledTab label="Configuration" id="node-tab-0" />
          <StyledTab label="Preview" id="node-tab-1" />
        </Tabs>
      </Box>
      
      <DialogContent sx={{ p: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <FormContainer>
            <StyledPaper elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ color: '#334155', fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Node Name*
                    </Typography>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter node name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        '&:focus': {
                          borderColor: '#6366F1'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Description
                    </Typography>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter node description"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s',
                        '&:focus': {
                          borderColor: '#6366F1'
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </StyledPaper>
            
            <Box sx={{ my: 3 }}>
              <Divider />
            </Box>
            
            <StyledPaper elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ color: '#334155', fontWeight: 600, mb: 2 }}>
                Transformation Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Instruction*
                    </Typography>
                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Enter transformation instruction"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s',
                        '&:focus': {
                          borderColor: '#6366F1'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Output Template
                    </Typography>
                    <textarea
                      value={outputTemplate}
                      onChange={(e) => setOutputTemplate(e.target.value)}
                      placeholder="Enter output template (optional)"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s',
                        '&:focus': {
                          borderColor: '#6366F1'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Model
                    </Typography>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        outline: 'none',
                        backgroundColor: 'white',
                        transition: 'border-color 0.2s',
                        '&:focus': {
                          borderColor: '#6366F1'
                        }
                      }}
                    >
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    </select>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Template Document (Optional)
                    </Typography>
                    
                    {templateDoc ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 1.5,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <Typography variant="body2">{templateDoc.name}</Typography>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => handleRemoveDocument('template')}
                          variant="outlined"
                          sx={{ borderRadius: 4 }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Button 
                        variant="outlined" 
                        onClick={() => handleOpenDocSelector('template')}
                        fullWidth
                        startIcon={<AddIcon />}
                        sx={{ 
                          borderRadius: 2,
                          py: 1,
                          borderStyle: 'dashed',
                          borderWidth: 2
                        }}
                      >
                        Select Template Document
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </StyledPaper>
            
            {error && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#fff1f2', 
                borderRadius: 2,
                border: '1px solid #fecdd3'
              }}>
                <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                  Error: {error}
                </Typography>
              </Box>
            )}
            
            {success && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}>
                <Typography color="success.main" variant="body2" sx={{ fontWeight: 500 }}>
                  Success: {success}
                </Typography>
              </Box>
            )}
          </FormContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 400, width: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Node Preview
              </Typography>
              
              <TransformationNodePreview
                data={{
                  label: previewData.name || 'Untitled Node',
                  description: previewData.description,
                  instruction: previewData.instruction,
                  outputTemplate: previewData.outputTemplate,
                  model: previewData.model,
                  templateDoc: previewData.templateDoc,
                  status: 'ready'
                }}
              />
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ 
        borderTop: '1px solid #e0e0e0',
        px: 3,
        py: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ 
            borderRadius: 2,
            px: 3,
            background: loading ? undefined : 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
            '&:hover': {
              background: loading ? undefined : 'linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)',
            }
          }}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Node' : 'Create Node')}
        </Button>
      </DialogActions>
      
      {/* Document Selector Dialog */}
      {docSelectorOpen && (
        <Dialog 
          open={docSelectorOpen} 
          onClose={handleCloseDocSelector}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select {docSelectorType === 'template' ? 'Template' : ''} Document
          </DialogTitle>
          <DialogContent sx={{ height: '500px', p: 0 }}>
            <DocumentSelector
              onSelect={handleDocumentSelected}
              initialPath="/"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDocSelector}>Cancel</Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};

export default TransformationNodeForm;
