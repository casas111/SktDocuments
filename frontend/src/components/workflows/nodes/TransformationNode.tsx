import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  TextField,
  Button,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Handle, Position, NodeProps } from 'reactflow';

interface TransformationNodeData {
  label: string;
  config: {
    instruction?: string;
    outputTemplate?: string;
  };
}

const TransformationNode: React.FC<NodeProps<TransformationNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [instruction, setInstruction] = useState(data.config.instruction || '');
  const [outputTemplate, setOutputTemplate] = useState(data.config.outputTemplate || '');
  const [loading, setLoading] = useState(false);

  // Update local state when node data changes
  useEffect(() => {
    setInstruction(data.config.instruction || '');
    setOutputTemplate(data.config.outputTemplate || '');
  }, [data.config]);

  const handleSave = () => {
    // In a real implementation, this would update the node data in the parent component
    console.log('Saving transformation node config:', { instruction, outputTemplate });
    setIsEditing(false);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCancel = () => {
    setInstruction(data.config.instruction || '');
    setOutputTemplate(data.config.outputTemplate || '');
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        width: 300,
        borderRadius: 2,
        border: selected ? '2px solid #0F4C81' : '1px solid #ddd',
        overflow: 'hidden'
      }}
    >
      {/* Node Header */}
      <Box 
        sx={{ 
          p: 1, 
          backgroundColor: '#0F4C81', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle1">{data.label}</Typography>
        <Box>
          {isEditing ? (
            <>
              <Tooltip title="Save">
                <IconButton size="small" onClick={handleSave} sx={{ color: 'white' }}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={handleCancel} sx={{ color: 'white' }}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Edit Configuration">
              <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ color: 'white' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Node Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : isEditing ? (
          <Box>
            <TextField
              fullWidth
              label="Transformation Instruction"
              multiline
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter instructions for document transformation..."
            />
            <TextField
              fullWidth
              label="Output Template"
              multiline
              rows={3}
              value={outputTemplate}
              onChange={(e) => setOutputTemplate(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter output template (optional)..."
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Transformation Instructions:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
              {data.config.instruction || 'No instructions configured'}
            </Typography>
            
            {data.config.outputTemplate && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Output Template:
                </Typography>
                <Typography variant="body2" sx={{ minHeight: 60 }}>
                  {data.config.outputTemplate}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Node Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#0F4C81' }}
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#0F4C81' }}
        id="output"
      />
    </Paper>
  );
};

export default TransformationNode;
