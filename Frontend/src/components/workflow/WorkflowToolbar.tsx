import React, { useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TranslationNodeCreator from './TranslationNodeCreator';

interface WorkflowToolbarProps {
  onAddNode?: (nodeType: string) => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onAddNode
}) => {
  const [isTranslationCreatorOpen, setIsTranslationCreatorOpen] = useState(false);

  const handleOpenTranslationCreator = () => {
    setIsTranslationCreatorOpen(true);
  };

  const handleCloseTranslationCreator = () => {
    setIsTranslationCreatorOpen(false);
  };

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom>
        Workflow Tools
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenTranslationCreator}
        >
          Add Translation Node
        </Button>
      </Box>

      {/* Translation Node Creator Dialog */}
      <TranslationNodeCreator
        isOpen={isTranslationCreatorOpen}
        onClose={handleCloseTranslationCreator}
      />
    </Box>
  );
};

export default WorkflowToolbar;
