import React, { useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TransformationNodeCreator from './TransformationNodeCreator';

interface WorkflowToolbarProps {
  onAddNode?: (nodeType: string) => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onAddNode
}) => {
  const [isTransformationCreatorOpen, setIsTransformationCreatorOpen] = useState(false);

  const handleOpenTransformationCreator = () => {
    setIsTransformationCreatorOpen(true);
  };

  const handleCloseTransformationCreator = () => {
    setIsTransformationCreatorOpen(false);
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
          onClick={handleOpenTransformationCreator}
        >
          Add Transformation Node
        </Button>
      </Box>

      {/* Transformation Node Creator Dialog */}
      <TransformationNodeCreator
        isOpen={isTransformationCreatorOpen}
        onClose={handleCloseTransformationCreator}
      />
    </Box>
  );
};

export default WorkflowToolbar;
