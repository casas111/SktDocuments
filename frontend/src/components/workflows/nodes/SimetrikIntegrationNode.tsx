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
  Cloud as CloudIcon
} from '@mui/icons-material';
import { Handle, Position, NodeProps } from 'reactflow';

interface SimetrikIntegrationNodeData {
  label: string;
  config: {
    integrationType?: string;
    endpoint?: string;
    apiKey?: string;
    parameters?: string;
  };
}

const SimetrikIntegrationNode: React.FC<NodeProps<SimetrikIntegrationNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [integrationType, setIntegrationType] = useState(data.config.integrationType || 'api');
  const [endpoint, setEndpoint] = useState(data.config.endpoint || '');
  const [apiKey, setApiKey] = useState(data.config.apiKey || '');
  const [parameters, setParameters] = useState(data.config.parameters || '');
  const [loading, setLoading] = useState(false);

  // Update local state when node data changes
  useEffect(() => {
    setIntegrationType(data.config.integrationType || 'api');
    setEndpoint(data.config.endpoint || '');
    setApiKey(data.config.apiKey || '');
    setParameters(data.config.parameters || '');
  }, [data.config]);

  const handleSave = () => {
    // In a real implementation, this would update the node data in the parent component
    console.log('Saving Simetrik integration node config:', { integrationType, endpoint, apiKey, parameters });
    setIsEditing(false);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCancel = () => {
    setIntegrationType(data.config.integrationType || 'api');
    setEndpoint(data.config.endpoint || '');
    setApiKey(data.config.apiKey || '');
    setParameters(data.config.parameters || '');
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        width: 300,
        borderRadius: 2,
        border: selected ? '2px solid #00796b' : '1px solid #ddd',
        overflow: 'hidden'
      }}
    >
      {/* Node Header */}
      <Box 
        sx={{ 
          p: 1, 
          backgroundColor: '#00796b', 
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
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={integrationType}
                label="Integration Type"
                onChange={(e) => setIntegrationType(e.target.value)}
              >
                <MenuItem value="api">API Integration</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
                <MenuItem value="database">Database Connection</MenuItem>
                <MenuItem value="custom">Custom Integration</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Endpoint URL"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter Simetrik endpoint URL..."
            />
            
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter API key (if required)..."
            />
            
            <TextField
              fullWidth
              label="Parameters (JSON)"
              multiline
              rows={3}
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter parameters as JSON..."
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Integration Type:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {integrationType === 'api' && 'API Integration'}
              {integrationType === 'webhook' && 'Webhook'}
              {integrationType === 'database' && 'Database Connection'}
              {integrationType === 'custom' && 'Custom Integration'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Endpoint:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
              {endpoint || 'No endpoint configured'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Parameters:
            </Typography>
            <Typography variant="body2" sx={{ minHeight: 40, wordBreak: 'break-all' }}>
              {parameters ? (
                <Box component="pre" sx={{ fontSize: '0.75rem', margin: 0 }}>
                  {parameters}
                </Box>
              ) : (
                'No parameters configured'
              )}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Node Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#00796b' }}
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#00796b' }}
        id="output"
      />
    </Paper>
  );
};

export default SimetrikIntegrationNode;
