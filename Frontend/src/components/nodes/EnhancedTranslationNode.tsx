import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  Paper
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import styled from '@emotion/styled';
import CustomInstructionEditor from '../common/CustomInstructionEditor';
import DocumentSelector from '../documents/DocumentSelector';

// Styled components for the node
const NodeContainer = styled(Paper)`
  padding: 12px;
  border-radius: 8px;
  min-width: 280px;
  max-width: 320px;
  background-color: #e8f5e9;
  border: 1px solid #4caf50;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NodeHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const NodeTitle = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NodeIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #4caf50;
  color: white;
`;

const NodeContent = styled(Box)`
  margin-top: 8px;
`;

const DocumentItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
  margin-bottom: 4px;
  font-size: 0.8rem;
`;

const ModelChip = styled(Chip)`
  margin-top: 8px;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  font-size: 0.75rem;
`;

// Types
interface FileItem {
  id?: string;
  name: string;
  path?: string;
  type?: string;
  size?: number;
  mimeType?: string;
}

interface EnhancedTranslationNodeData {
  label: string;
  description?: string;
  sourceDoc1: FileItem | null;
  sourceDoc2: FileItem | null;
  templateDoc: FileItem | null;
  instruction: string;
  model: string;
  status?: 'idle' | 'processing' | 'success' | 'error';
  outputDoc?: FileItem | null;
}

const EnhancedTranslationNode: React.FC<NodeProps<EnhancedTranslationNodeData>> = ({ 
  id, 
  data,
  selected
}) => {
  const [expanded, setExpanded] = React.useState(false);
  
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
        position={Position.Left}
        style={{ background: '#4caf50', width: 10, height: 10 }}
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
        </Collapse>
      </NodeContent>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#4caf50', width: 10, height: 10 }}
      />
    </NodeContainer>
  );
};

export default EnhancedTranslationNode;
