import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import StatusChip from '../common/StatusChip';
import { TransformationNodeData } from './types';

const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

interface TransformationNodePreviewProps {
  data: TransformationNodeData;
}

const TransformationNodePreview: React.FC<TransformationNodePreviewProps> = ({
  data
}) => {
  return (
    <NodeContainer elevation={2}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1">
            {data.label}
          </Typography>
          <StatusChip 
            label={data.status || 'Ready'} 
            size="small" 
            status={data.status || 'ready'}
            theme={{}}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {data.description}
        </Typography>
        {data.sourceDoc && (
          <Typography variant="caption" display="block">
            Source: {data.sourceDoc.name}
          </Typography>
        )}
        {data.templateDoc && (
          <Typography variant="caption" display="block">
            Template: {data.templateDoc.name}
          </Typography>
        )}
      </Box>
    </NodeContainer>
  );
};

export default TransformationNodePreview;
