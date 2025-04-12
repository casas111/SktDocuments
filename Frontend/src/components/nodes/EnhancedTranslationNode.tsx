import React, { useState, useCallback } from 'react';
import { Node, NodeProps, Handle, Position } from 'reactflow';
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Chip
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import styled from '@emotion/styled';

// Styled components
const NodeContainer = styled(Paper)`
  width: 280px;
  border-radius: 8px;
  overflow: hidden;
`;

const NodeHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
`;

const NodeTitle = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NodeIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #e3f2fd;
  color: #1976d2;
`;

const NodeContent = styled(Box)`
  padding: 16px;
`;

const DocumentItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const ModelChip = styled(Chip)`
  margin-top: 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-size: 0.75rem;
`;

// Types
interface FileItem {
  id?: string;
  name: string;
  path: string;
  type?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface TranslationNodeData {
  label: string;
  description: string;
  sourceDoc1: FileItem | null;
  sourceDoc2: FileItem | null;
  templateDoc: FileItem | null;
  instruction: string;
  model: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  outputDoc: FileItem | null;
}

// Enhanced Translation Node Component
const EnhancedTranslationNode: React.FC<NodeProps<TranslationNodeData>> = ({ 
  id, 
  data,
  selected,
  isConnectable,
  targetPosition = Position.Left,
  sourcePosition = Position.Right
}) => {
  // State
  const [expanded, setExpanded] = useState(false);
  
  // Default data if not provided
  const nodeData = {
    label: data?.label || 'Document Translation',
    description: data?.description || 'Transforms documents using Claude AI',
    sourceDoc1: data?.sourceDoc1 || null,
    sourceDoc2: data?.sourceDoc2 || null,
    templateDoc: data?.templateDoc || null,
    instruction: data?.instruction || '',
    model: data?.model || 'claude-3-haiku-20240307',
    status: data?.status || 'idle',
    outputDoc: data?.outputDoc || null
  };
  
  // Get model name from ID
  const getModelName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-opus-20240229': 'Claude 3 Opus'
    };
    
    return modelMap[modelId] || modelId;
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (nodeData.status) {
      case 'processing':
        return null;
      case 'success':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#4caf50' }} />;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };
  
  return (
    <NodeContainer elevation={selected ? 3 : 1}>
      {/* Input handle */}
      <Handle
        type="target"
        position={targetPosition}
        style={{ background: '#4caf50', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <TranslateIcon fontSize="small" />
          </NodeIcon>
          <Box>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {nodeData.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {nodeData.description}
            </Typography>
          </Box>
        </NodeTitle>
        
        <Tooltip title={expanded ? "Collapse" : "Expand"}>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ padding: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </NodeHeader>
      
      <Divider />
      
      <NodeContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Input Documents
          </Typography>
          {getStatusIcon()}
        </Box>
        
        {nodeData.sourceDoc1 ? (
          <DocumentItem>
            <DescriptionIcon fontSize="small" sx={{ color: '#2196f3' }} />
            <Typography variant="caption" noWrap sx={{ flex: 1 }}>
              {nodeData.sourceDoc1.name}
            </Typography>
          </DocumentItem>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Document 1 not selected
          </Typography>
        )}
        
        {nodeData.sourceDoc2 ? (
          <DocumentItem>
            <DescriptionIcon fontSize="small" sx={{ color: '#2196f3' }} />
            <Typography variant="caption" noWrap sx={{ flex: 1 }}>
              {nodeData.sourceDoc2.name}
            </Typography>
          </DocumentItem>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Document 2 not selected
          </Typography>
        )}
        
        {nodeData.templateDoc ? (
          <DocumentItem>
            <PictureAsPdfIcon fontSize="small" sx={{ color: '#f44336' }} />
            <Typography variant="caption" noWrap sx={{ flex: 1 }}>
              {nodeData.templateDoc.name}
            </Typography>
          </DocumentItem>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Template not selected
          </Typography>
        )}
        
        <ModelChip
          label={getModelName(nodeData.model)}
          size="small"
        />
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Instructions
            </Typography>
            <Box sx={{ 
              p: 1, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1, 
              fontSize: '0.75rem',
              mt: 0.5,
              maxHeight: 100,
              overflow: 'auto'
            }}>
              {nodeData.instruction || 'No instructions provided'}
            </Box>
          </Box>
          
          {nodeData.outputDoc && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Output Document
              </Typography>
              <DocumentItem>
                <DescriptionIcon fontSize="small" sx={{ color: '#4caf50' }} />
                <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                  {nodeData.outputDoc.name}
                </Typography>
              </DocumentItem>
            </Box>
          )}
        </Collapse>
      </NodeContent>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={sourcePosition}
        style={{ background: '#4caf50', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
    </NodeContainer>
  );
};

export default EnhancedTranslationNode;
