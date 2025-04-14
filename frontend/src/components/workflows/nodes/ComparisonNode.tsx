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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { Handle, Position, NodeProps } from 'reactflow';

interface ComparisonNodeData {
  label: string;
  config: {
    comparisonType?: string;
    instruction?: string;
    threshold?: number;
  };
}

const ComparisonNode: React.FC<NodeProps<ComparisonNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comparisonType, setComparisonType] = useState(data.config.comparisonType || 'content');
  const [instruction, setInstruction] = useState(data.config.instruction || '');
  const [threshold, setThreshold] = useState(data.config.threshold || 80);
  const [loading, setLoading] = useState(false);

  // Update local state when node data changes
  useEffect(() => {
    setComparisonType(data.config.comparisonType || 'content');
    setInstruction(data.config.instruction || '');
    setThreshold(data.config.threshold || 80);
  }, [data.config]);

  const handleSave = () => {
    // In a real implementation, this would update the node data in the parent component
    console.log('Saving comparison node config:', { comparisonType, instruction, threshold });
    setIsEditing(false);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCancel = () => {
    setComparisonType(data.config.comparisonType || 'content');
    setInstruction(data.config.instruction || '');
    setThreshold(data.config.threshold || 80);
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        width: 300,
        borderRadius: 2,
        border: selected ? '2px solid #6a1b9a' : '1px solid #ddd',
        overflow: 'hidden'
      }}
    >
      {/* Node Header */}
      <Box 
        sx={{ 
          p: 1, 
          backgroundColor: '#6a1b9a', 
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
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Comparison Type</InputLabel>
              <Select
                value={comparisonType}
                label="Comparison Type"
                onChange={(e) => setComparisonType(e.target.value)}
              >
                <MenuItem value="content">Content Comparison</MenuItem>
                <MenuItem value="structure">Structure Comparison</MenuItem>
                <MenuItem value="metadata">Metadata Comparison</MenuItem>
                <MenuItem value="custom">Custom Comparison</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Comparison Instructions"
              multiline
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter instructions for document comparison..."
            />
            
            <TextField
              fullWidth
              label="Similarity Threshold (%)"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              size="small"
              margin="normal"
              inputProps={{ min: 0, max: 100 }}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Comparison Type:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {comparisonType === 'content' && 'Content Comparison'}
              {comparisonType === 'structure' && 'Structure Comparison'}
              {comparisonType === 'metadata' && 'Metadata Comparison'}
              {comparisonType === 'custom' && 'Custom Comparison'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
              {data.config.instruction || 'No instructions configured'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Similarity Threshold:
            </Typography>
            <Typography variant="body2">
              {threshold}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Node Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#6a1b9a', top: '30%' }}
        id="input1"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#6a1b9a', top: '70%' }}
        id="input2"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#6a1b9a' }}
        id="output"
      />
    </Paper>
  );
};

export default ComparisonNode;
