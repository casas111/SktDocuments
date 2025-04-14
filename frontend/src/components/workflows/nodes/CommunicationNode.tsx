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
  MenuItem,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Handle, Position, NodeProps } from 'reactflow';

interface CommunicationNodeData {
  label: string;
  config: {
    communicationType?: string;
    recipients?: string;
    subject?: string;
    message?: string;
    triggerCondition?: string;
  };
}

const CommunicationNode: React.FC<NodeProps<CommunicationNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [communicationType, setCommunicationType] = useState(data.config.communicationType || 'email');
  const [recipients, setRecipients] = useState(data.config.recipients || '');
  const [subject, setSubject] = useState(data.config.subject || '');
  const [message, setMessage] = useState(data.config.message || '');
  const [triggerCondition, setTriggerCondition] = useState(data.config.triggerCondition || 'always');
  const [loading, setLoading] = useState(false);

  // Update local state when node data changes
  useEffect(() => {
    setCommunicationType(data.config.communicationType || 'email');
    setRecipients(data.config.recipients || '');
    setSubject(data.config.subject || '');
    setMessage(data.config.message || '');
    setTriggerCondition(data.config.triggerCondition || 'always');
  }, [data.config]);

  const handleSave = () => {
    // In a real implementation, this would update the node data in the parent component
    console.log('Saving communication node config:', { 
      communicationType, 
      recipients, 
      subject, 
      message,
      triggerCondition 
    });
    setIsEditing(false);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCancel = () => {
    setCommunicationType(data.config.communicationType || 'email');
    setRecipients(data.config.recipients || '');
    setSubject(data.config.subject || '');
    setMessage(data.config.message || '');
    setTriggerCondition(data.config.triggerCondition || 'always');
    setIsEditing(false);
  };

  // Parse recipients into an array for display
  const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        width: 300,
        borderRadius: 2,
        border: selected ? '2px solid #e65100' : '1px solid #ddd',
        overflow: 'hidden'
      }}
    >
      {/* Node Header */}
      <Box 
        sx={{ 
          p: 1, 
          backgroundColor: '#e65100', 
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
              <InputLabel>Communication Type</InputLabel>
              <Select
                value={communicationType}
                label="Communication Type"
                onChange={(e) => setCommunicationType(e.target.value)}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="notification">System Notification</MenuItem>
                <MenuItem value="slack">Slack Message</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter recipients (comma-separated)..."
              helperText="For emails: email addresses, for Slack: channel names"
            />
            
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter subject..."
            />
            
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              size="small"
              margin="normal"
              placeholder="Enter message content..."
            />
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Trigger Condition</InputLabel>
              <Select
                value={triggerCondition}
                label="Trigger Condition"
                onChange={(e) => setTriggerCondition(e.target.value)}
              >
                <MenuItem value="always">Always</MenuItem>
                <MenuItem value="on_success">On Success</MenuItem>
                <MenuItem value="on_error">On Error</MenuItem>
                <MenuItem value="on_threshold">On Threshold</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Communication Type:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {communicationType === 'email' && 'Email'}
              {communicationType === 'notification' && 'System Notification'}
              {communicationType === 'slack' && 'Slack Message'}
              {communicationType === 'webhook' && 'Webhook'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Recipients:
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {recipientList.length > 0 ? (
                recipientList.map((recipient, index) => (
                  <Chip 
                    key={index} 
                    label={recipient} 
                    size="small" 
                    icon={communicationType === 'email' ? <EmailIcon /> : <NotificationsIcon />}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recipients configured
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Subject:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {subject || 'No subject configured'}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Trigger:
            </Typography>
            <Typography variant="body2">
              {triggerCondition === 'always' && 'Always'}
              {triggerCondition === 'on_success' && 'On Success'}
              {triggerCondition === 'on_error' && 'On Error'}
              {triggerCondition === 'on_threshold' && 'On Threshold'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Node Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#e65100' }}
        id="input"
      />
    </Paper>
  );
};

export default CommunicationNode;
