import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, IconButton, Divider, Chip, Box, Collapse } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import styled from 'styled-components';
import FileUploader from '../documents/FileUploader';
import FileDownloader from '../documents/FileDownloader';

// Auto-resizing card that adjusts based on content
const NodeCard = styled(Card)`
  width: 100%;
  min-width: 300px;
  max-width: 450px;
  border-left: 5px solid #ff9800;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  position: relative;
  overflow: visible !important;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff3e0;
`;

const NodeContent = styled(CardContent)`
  padding: 16px !important;
  overflow: visible !important;
`;

const NodeFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #e0e0e0;
`;

const InputOutputSection = styled.div`
  margin-top: 12px;
  font-size: 0.85rem;
`;

// Fixed position handles that don't move on hover
const InputHandle = styled(Handle)`
  background-color: #ff9800;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  left: -7px !important;
  
  &:hover {
    background-color: #f57c00;
  }
`;

const OutputHandle = styled(Handle)`
  background-color: #ff9800;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  right: -7px !important;
  
  &:hover {
    background-color: #f57c00;
  }
`;

interface ComparisonNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    onDelete?: () => void;
  };
  selected: boolean;
}

const ComparisonNode: React.FC<ComparisonNodeProps> = ({ id, data, selected }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to node drag
    setExpanded(!expanded);
  };
  
  return (
    <NodeCard 
      variant="outlined" 
      sx={{ 
        borderColor: selected ? '#f57c00' : 'transparent',
        transform: 'none !important', // Prevent transform conflicts with ReactFlow
      }}
    >
      {/* Fixed position input handles */}
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="documentsA" 
        style={{ top: 60 }} 
      />
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="documentsB" 
        style={{ top: 100 }} 
      />
      
      <NodeHeader>
        <CompareIcon style={{ color: '#ff9800', marginRight: '8px' }} />
        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ flexGrow: 1 }}>
          {data.label || 'Comparison'}
        </Typography>
        <Chip 
          size="small" 
          label="Compare" 
          color="warning" 
          variant="outlined" 
          sx={{ ml: 1, fontSize: '0.7rem', flexShrink: 0 }}
        />
      </NodeHeader>
      
      <NodeContent>
        <Typography variant="body2" color="text.secondary">
          {data.description || 'Compares two sets of documents and identifies differences'}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <InputOutputSection>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="warning.main" fontWeight="bold">
              Inputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• List of documents A</Typography>
              <Typography variant="caption" display="block">• List of documents B</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="caption" color="warning.main" fontWeight="bold">
              Outputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• Flag analysis</Typography>
              <Typography variant="caption" display="block">• Differences & inconsistencies</Typography>
            </Box>
          </Box>
        </InputOutputSection>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Document Set A
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FileUploader 
                nodeId={id} 
                inputId="documentsA" 
                label="Upload Documents A"
                multiple={true}
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Document Set B
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FileUploader 
                nodeId={id} 
                inputId="documentsB" 
                label="Upload Documents B"
                multiple={true}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Output
            </Typography>
            <Box sx={{ mb: 1 }}>
              <FileDownloader 
                nodeId={id} 
                outputId="flagAnalysis" 
                label="Flag Analysis"
              />
            </Box>
            <FileDownloader 
              nodeId={id} 
              outputId="differences" 
              label="Differences & Inconsistencies"
            />
          </Box>
        </Collapse>
      </NodeContent>
      
      <NodeFooter>
        <IconButton size="small" onClick={toggleExpanded}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        <IconButton 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            if (data.onDelete) data.onDelete();
          }} 
          aria-label="delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </NodeFooter>
      
      {/* Fixed position output handles */}
      <OutputHandle 
        type="source" 
        position={Position.Right} 
        id="flagAnalysis" 
        style={{ top: 60 }}
      />
      <OutputHandle 
        type="source" 
        position={Position.Right} 
        id="differences" 
        style={{ top: 100 }}
      />
    </NodeCard>
  );
};

export default ComparisonNode;
