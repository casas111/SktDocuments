import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TranslationNodeData } from './types';

const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

interface TranslationNodePreviewProps {
  data: TranslationNodeData;
}

const TranslationNodePreview: React.FC<TranslationNodePreviewProps> = ({
  data
}) => {
  return (
    <NodeContainer elevation={1}>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {data.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {data.description}
        </Typography>
        {data.sourceDoc1 && (
          <Typography variant="caption" display="block">
            Source 1: {data.sourceDoc1.name}
          </Typography>
        )}
        {data.sourceDoc2 && (
          <Typography variant="caption" display="block">
            Source 2: {data.sourceDoc2.name}
          </Typography>
        )}
        {data.templateDoc && (
          <Typography variant="caption" display="block">
            Template: {data.templateDoc.name}
          </Typography>
        )}
        <Typography variant="caption" display="block" color="text.secondary">
          Status: {data.status}
        </Typography>
      </Box>
    </NodeContainer>
  );
};

export default TranslationNodePreview; 