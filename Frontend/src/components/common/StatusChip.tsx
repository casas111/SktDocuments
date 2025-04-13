import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StatusChipProps {
  status: string;
  label: string;
  size: 'small' | 'medium';
  theme?: any;
}

const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const StatusChip: React.FC<StatusChipProps> = ({ status, label, size, theme }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing':
      case 'running':
        return 'primary';
      case 'success':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={label} 
      size={size} 
      color={getStatusColor()} 
      variant="outlined"
    />
  );
};

export default StatusChip;
