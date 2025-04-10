import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, IconButton, Divider, Chip, Box, Collapse } from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EditIcon from '@mui/icons-material/Edit';
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
  border-left: 5px solid #f44336;
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
  background-color: #ffebee;
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
  background-color: #f44336;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  left: -7px !important;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const OutputHandle = styled(Handle)`
  background-color: #f44336;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  right: -7px !important;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

interface RedNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    onDelete?: () => void;
  };
  selected: boolean;
}

const RedNode: React.FC<RedNodeProps> = ({ id, data, selected }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to node drag
    setExpanded(!expanded);
  };
  
  return (
    <NodeCard 
      variant="outlined" 
      sx={{ 
        borderColor: selected ? '#d32f2f' : 'transparent',
        transform: 'none !important', // Prevent transform conflicts with ReactFlow
      }}
    >
      {/* Fixed position input handles */}
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="priority" 
        style={{ top: 40 }} 
      />
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="alert" 
        style={{ top: 80 }} 
      />
      <InputHandle 
        type="target" 
        position={Position.Left} 
        id="critical" 
        style={{ top: 120 }} 
      />
      
      <NodeHeader>
        <PriorityHighIcon style={{ color: '#f44336', marginRight: '8px' }} />
        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ flexGrow: 1 }}>
          {data.label || 'High Priority Node'}
        </Typography>
        <Chip 
          size="small" 
          label="Priority" 
          color="error" 
          variant="outlined" 
          sx={{ ml: 1, fontSize: '0.7rem', flexShrink: 0 }}
        />
      </NodeHeader>
      
      <NodeContent>
        <Typography variant="body2" color="text.secondary">
          {data.description || 'Processes high priority tasks and alerts'}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <InputOutputSection>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="error" fontWeight="bold">
              Inputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• Priority Level</Typography>
              <Typography variant="caption" display="block">• Alert Conditions</Typography>
              <Typography variant="caption" display="block">• Critical Data</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="caption" color="error" fontWeight="bold">
              Outputs:
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Typography variant="caption" display="block">• Priority Results</Typography>
            </Box>
          </Box>
        </InputOutputSection>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Priority Settings
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FileUploader 
                nodeId={id} 
                inputId="priority" 
                label="Upload Priority Settings"
                acceptedFileTypes=".json,.yaml"
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Alert Configuration
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FileUploader 
                nodeId={id} 
                inputId="alert" 
                label="Upload Alert Configuration"
                acceptedFileTypes=".json,.yaml,.txt"
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Critical Data
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FileUploader 
                nodeId={id} 
                inputId="critical" 
                label="Upload Critical Data"
                acceptedFileTypes=".json,.csv,.xlsx"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Output
            </Typography>
            <FileDownloader 
              nodeId={id} 
              outputId="output" 
              label="Priority Results"
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
      
      {/* Fixed position output handle */}
      <OutputHandle 
        type="source" 
        position={Position.Right} 
        id="output" 
        style={{ top: 80 }}
      />
    </NodeCard>
  );
};

export default RedNode;
