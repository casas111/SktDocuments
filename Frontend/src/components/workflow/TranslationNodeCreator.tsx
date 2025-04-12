import React, { useState, useCallback } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import TranslationManager from '../../components/translation/TranslationManager';
import { useReactFlow, Node } from 'reactflow';

// Types
interface TranslationNodeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranslationNodeCreator: React.FC<TranslationNodeCreatorProps> = ({
  isOpen,
  onClose
}) => {
  const { addNodes } = useReactFlow();
  
  // Handle node creation
  const handleNodeCreated = useCallback((nodeData: any) => {
    // Create a unique node ID
    const nodeId = `translation-${Date.now()}`;
    
    // Create node position (center of the viewport)
    const position = { x: 100, y: 100 };
    
    // Create the new node
    const newNode: Node = {
      id: nodeId,
      type: 'translation',
      position,
      data: nodeData,
    };
    
    // Add the node to the flow
    addNodes(newNode);
    
    // Close the dialog
    onClose();
  }, [addNodes, onClose]);
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent sx={{ p: 0 }}>
        <TranslationManager
          onNodeCreated={handleNodeCreated}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TranslationNodeCreator;
