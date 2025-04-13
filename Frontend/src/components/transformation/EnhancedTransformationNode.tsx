import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
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
  LinearProgress,
  Divider,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DocumentSelector from '../documents/DocumentSelector';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { TransformationNodeData } from './types';

// Enhanced styling for the node container with subtle gradient
const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 250,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(to bottom, #ffffff, #f9f9ff)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

// Styled handles for better visibility
const StyledHandle = styled(Handle)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.background.paper}`,
  zIndex: 1
}));

// Status chip with appropriate colors
const StatusChip = styled(Chip)(({ theme, status }: { theme: any, status: string }) => {
  let color = theme.palette.info.main;
  let backgroundColor = theme.palette.info.light;
  
  if (status === 'completed') {
    color = theme.palette.success.main;
    backgroundColor = theme.palette.success.light;
  } else if (status === 'failed') {
    color = theme.palette.error.main;
    backgroundColor = theme.palette.error.light;
  } else if (status === 'running') {
    color = theme.palette.warning.main;
    backgroundColor = theme.palette.warning.light;
  }
  
  return {
    color: color,
    backgroundColor: backgroundColor,
    fontSize: '0.75rem',
    height: 24
  };
});

interface EnhancedTransformationNodeProps {
  id: string;
  data: TransformationNodeData;
  selected: boolean;
  dragging: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
  isPreview?: boolean;
}

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

const EnhancedTransformationNode: React.FC<EnhancedTransformationNodeProps> = ({
  id,
  data,
  selected,
  dragging,
  targetPosition = Position.Left,
  sourcePosition = Position.Right,
  isPreview = false
}) => {
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<FileItem[]>([]);
  const [docSelectorOpen, setDocSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transformationProgress, setTransformationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleOpenTriggerDialog = () => {
    setTriggerDialogOpen(true);
    setSelectedDocs([]);
    setError(null);
    setSuccess(null);
    setTransformationProgress(0);
  };

  const handleCloseTriggerDialog = () => {
    setTriggerDialogOpen(false);
  };

  const handleOpenDocSelector = () => {
    setDocSelectorOpen(true);
  };

  const handleCloseDocSelector = () => {
    setDocSelectorOpen(false);
  };

  const handleDocumentSelected = (document: FileItem) => {
    if (!document) return;
    
    // Add document to selected docs if not already selected
    if (!selectedDocs.some(doc => doc.id === document.id)) {
      setSelectedDocs(prev => [...prev, document]);
    }
    
    setDocSelectorOpen(false);
  };

  const handleRemoveDocument = (docId: string) => {
    setSelectedDocs(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleTriggerTransformation = async () => {
    if (selectedDocs.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setTransformationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setTransformationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 500);

    try {
      // Create node data from the current node
      const nodeData = {
        name: data.label,
        instruction: data.instruction || '',
        templateId: data.templateDoc?.id || '',
        model: data.model || 'claude-3-haiku-20240307'
      };

      // Get document IDs
      const sourceDocIds = selectedDocs.map(doc => doc.id);

      // Call the transformation trigger API
      const response = await axios.post(`${API_BASE_URL}/transformation/trigger`, {
        node: nodeData,
        sourceDocIds
      });

      clearInterval(progressInterval);
      setTransformationProgress(100);

      if (response.data.success) {
        setSuccess('Transformation completed successfully');
        
        // Update node data with the result
        if (response.data.data && response.data.data.transformedDocument) {
          // Here we would update the node data with the result
          // This would typically be handled by the parent component
          console.log('Transformation result:', response.data.data.transformedDocument);
        }
      } else {
        setError(response.data.error || 'Failed to trigger transformation');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Error triggering transformation:', error);
      setError(error.message || 'An error occurred while triggering the transformation');
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Determine node status color
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <NodeContainer elevation={selected ? 4 : 1}>
      {!isPreview && (
        <>
          <Tooltip title="Input Connection" placement="left">
            <StyledHandle
              type="target"
              position={targetPosition}
              style={{ background: '#6366F1' }}
            />
          </Tooltip>
          <Tooltip title="Output Connection" placement="right">
            <StyledHandle
              type="source"
              position={sourcePosition}
              style={{ background: '#8B5CF6' }}
            />
          </Tooltip>
        </>
      )}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
            {data.label}
          </Typography>
          <Tooltip title="Toggle Details">
            <IconButton size="small" onClick={toggleDetails}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <StatusChip 
          label={data.status || 'Ready'} 
          size="small" 
          status={data.status || 'ready'}
        />
        
        {showDetails && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.875rem' }}>
              {data.description || 'No description provided'}
            </Typography>
            
            {data.sourceDoc1 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Source 1:</strong> {data.sourceDoc1.name}
              </Typography>
            )}
            {data.sourceDoc2 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Source 2:</strong> {data.sourceDoc2.name}
              </Typography>
            )}
            {data.templateDoc && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Template:</strong> {data.templateDoc.name}
              </Typography>
            )}
            {data.model && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Model:</strong> {data.model}
              </Typography>
            )}
          </>
        )}
        
        {!isPreview && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleOpenTriggerDialog}
              color="primary"
              sx={{ 
                borderRadius: '20px', 
                px: 2,
                background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)',
                }
              }}
            >
              Trigger Manually
            </Button>
          </Box>
        )}
      </Box>

      {/* Trigger Dialog */}
      <Dialog 
        open={triggerDialogOpen} 
        onClose={handleCloseTriggerDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          background: 'linear-gradient(45deg, #f5f7ff 30%, #eef2ff 90%)',
          py: 2
        }}>
          <Typography variant="h6">Trigger Transformation: {data.label}</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#334155', fontWeight: 600 }}>
              Select Input Documents
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="outlined" 
                onClick={handleOpenDocSelector}
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  borderStyle: 'dashed',
                  borderWidth: 2
                }}
              >
                Select Documents
              </Button>
            </Box>
            
            {selectedDocs.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Selected Documents:
                </Typography>
                {selectedDocs.map(doc => (
                  <Box 
                    key={doc.id} 
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
                    <Typography variant="body2">{doc.name}</Typography>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveDocument(doc.id)}
                      variant="outlined"
                      sx={{ borderRadius: 4 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            
            {loading && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Transformation Progress:
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={transformationProgress} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {transformationProgress < 100 
                    ? `Processing... ${Math.round(transformationProgress)}%` 
                    : 'Processing complete!'}
                </Typography>
              </Box>
            )}
            
            {error && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: '#fff1f2', 
                borderRadius: 2,
                border: '1px solid #fecdd3'
              }}>
                <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                  Error: {error}
                </Typography>
                <Typography color="error" variant="caption">
                  Please try again or contact support if the issue persists.
                </Typography>
              </Box>
            )}
            
            {success && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}>
                <Typography color="success.main" variant="body2" sx={{ fontWeight: 500 }}>
                  Success: {success}
                </Typography>
                <Typography color="success.main" variant="caption">
                  Your document has been transformed successfully.
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Document Selector */}
          {docSelectorOpen && (
            <Box sx={{ 
              height: '400px', 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <DocumentSelector
                onSelect={handleDocumentSelected}
                initialPath="/"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          px: 3,
          py: 2
        }}>
          <Button 
            onClick={handleCloseTriggerDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTriggerTransformation}
            variant="contained"
            color="primary"
            disabled={loading || selectedDocs.length === 0}
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
            {loading ? 'Processing...' : 'Trigger Transformation'}
          </Button>
        </DialogActions>
      </Dialog>
    </NodeContainer>
  );
};

export default EnhancedTransformationNode;
