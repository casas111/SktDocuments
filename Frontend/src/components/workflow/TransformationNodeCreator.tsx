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
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TransformationNodeForm from '../transformation/TransformationNodeForm';

// Styled components
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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1, 3),
  background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
  color: 'white',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  }
}));

interface TransformationNodeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeCreated?: (nodeData: any) => void;
}

const TransformationNodeCreator: React.FC<TransformationNodeCreatorProps> = ({
  isOpen,
  onClose,
  onNodeCreated
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [nodeFormOpen, setNodeFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleOpenNodeForm = () => {
    setNodeFormOpen(true);
  };
  
  const handleCloseNodeForm = () => {
    setNodeFormOpen(false);
  };
  
  const handleNodeCreated = (nodeData: any) => {
    if (onNodeCreated) {
      onNodeCreated(nodeData);
    }
    handleCloseNodeForm();
  };
  
  return (
    <>
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
          }
        }}
      >
        <StyledDialogTitle>
          <Typography variant="h6">
            Add Transformation Node
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#334155', mb: 3 }}>
              Create a New Transformation Node
            </Typography>
            
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4, maxWidth: 600 }}>
              Transformation nodes allow you to process documents using Claude AI. You can specify instructions,
              templates, and input documents to generate transformed content.
            </Typography>
            
            <StyledPaper elevation={0} sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#334155' }}>
                  What can you do with transformation nodes?
                </Typography>
                
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Chip 
                      label="1" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#6366F1', 
                        color: 'white', 
                        fontWeight: 'bold',
                        mr: 2,
                        mt: 0.5
                      }} 
                    />
                    <Typography variant="body2">
                      <strong>Transform documents</strong> using Claude AI with custom instructions
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Chip 
                      label="2" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#6366F1', 
                        color: 'white', 
                        fontWeight: 'bold',
                        mr: 2,
                        mt: 0.5
                      }} 
                    />
                    <Typography variant="body2">
                      <strong>Connect nodes together</strong> to create complex document processing workflows
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Chip 
                      label="3" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#6366F1', 
                        color: 'white', 
                        fontWeight: 'bold',
                        mr: 2,
                        mt: 0.5
                      }} 
                    />
                    <Typography variant="body2">
                      <strong>Trigger transformations manually</strong> or automatically when connected nodes complete
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </StyledPaper>
            
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNodeForm}
              size="large"
            >
              Create Transformation Node
            </ActionButton>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Node Form Dialog */}
      <TransformationNodeForm
        isOpen={nodeFormOpen}
        onClose={handleCloseNodeForm}
        onSave={handleNodeCreated}
      />
    </>
  );
};

export default TransformationNodeCreator;
