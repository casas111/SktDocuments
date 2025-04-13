import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
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

interface TransformationNodePreviewProps {
  data: TransformationNodeData;
}

const TransformationNodePreview: React.FC<TransformationNodePreviewProps> = ({
  data
}) => {
  return (
    <NodeContainer elevation={1}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
            {data.label}
          </Typography>
        </Box>
        
        <StatusChip 
          label={data.status || 'Ready'} 
          size="small" 
          status={data.status || 'ready'}
        />
        
        <Box sx={{ mt: 2 }}>
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
        </Box>
      </Box>
    </NodeContainer>
  );
};

export default TransformationNodePreview;
