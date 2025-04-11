import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  FormHelperText,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Collapse,
  Alert
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from '@emotion/styled';

const InstructionContainer = styled(Paper)`
  padding: 16px;
  margin: 16px 0;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const InstructionField = styled(TextField)`
  margin: 12px 0;
  .MuiOutlinedInput-root {
    background-color: #ffffff;
    &:hover {
      background-color: #fafafa;
    }
    &.Mui-focused {
      background-color: #fff;
    }
  }
`;

const ModelSelector = styled(FormControl)`
  margin-bottom: 16px;
`;

const CharacterCounter = styled(Typography)`
  text-align: right;
  margin-top: 4px;
  font-size: 0.75rem;
`;

const ExampleChip = styled(Chip)`
  margin: 4px;
  cursor: pointer;
`;

interface CustomInstructionProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  availableModels?: Array<{id: string, name: string}>;
}

const CustomInstructionEditor: React.FC<CustomInstructionProps> = ({
  value,
  onChange,
  error,
  maxLength = 2000,
  selectedModel = 'claude-3-haiku-20240307',
  onModelChange,
  availableModels = [
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Balanced)' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Powerful)' }
  ]
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };
  
  const handleExampleClick = (example: string) => {
    onChange(example);
  };
  
  const handleModelChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    if (onModelChange) {
      onModelChange(e.target.value as string);
    }
  };
  
  const analyzeInstruction = () => {
    setAnalyzing(true);
    
    // Simulate analysis (in a real implementation, this would call an API)
    setTimeout(() => {
      if (value.length < 20) {
        setAnalysis("Your instruction is quite short. Consider adding more details about how you want the documents transformed.");
      } else if (!value.toLowerCase().includes('template')) {
        setAnalysis("Your instruction doesn't mention the template. Consider explaining how the template should be used.");
      } else if (!value.toLowerCase().includes('format')) {
        setAnalysis("Consider specifying the desired format or structure for the output document.");
      } else {
        setAnalysis("Your instruction looks good! It provides clear guidance for the transformation process.");
      }
      setAnalyzing(false);
    }, 1500);
  };
  
  const instructionExamples = [
    "Please transform these 2 documents into the format specified by the template. Maintain the structure of the template while inserting relevant content from the source documents.",
    "Extract key information from the source documents and populate the template. Ensure all sections of the template are filled with appropriate content.",
    "Create a new document using the template format. Use the first document for sections A and B, and the second document for sections C and D."
  ];
  
  return (
    <InstructionContainer elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Custom Instruction for Claude AI
        </Typography>
        <Tooltip title="Claude will use this instruction to understand how to transform your documents using the template">
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {onModelChange && (
        <ModelSelector fullWidth size="small">
          <InputLabel id="model-select-label">AI Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            label="AI Model"
            onChange={handleModelChange}
            size="small"
          >
            {availableModels.map(model => (
              <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select the Claude model to use for document transformation
          </FormHelperText>
        </ModelSelector>
      )}
      
      <InstructionField
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        placeholder="Please transform these documents into the output format specified by the template..."
        value={value}
        onChange={handleChange}
        error={!!error}
        helperText={error || "Provide clear instructions for how Claude should transform your documents"}
        InputProps={{
          sx: { fontSize: '0.9rem' }
        }}
      />
      
      <CharacterCounter color={value.length > maxLength * 0.9 ? "error" : "textSecondary"}>
        {value.length} / {maxLength} characters
      </CharacterCounter>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap' }}>
        <Button 
          size="small" 
          color="primary" 
          onClick={() => setShowExamples(!showExamples)}
          sx={{ textTransform: 'none' }}
        >
          {showExamples ? 'Hide Examples' : 'Show Examples'}
        </Button>
        
        <Button 
          size="small" 
          color="primary" 
          onClick={() => setShowTips(!showTips)}
          sx={{ textTransform: 'none' }}
        >
          {showTips ? 'Hide Tips' : 'Writing Tips'}
        </Button>
        
        <Button 
          size="small" 
          color="secondary" 
          onClick={analyzeInstruction}
          disabled={analyzing || !value.trim()}
          sx={{ textTransform: 'none' }}
          startIcon={analyzing ? <CircularProgress size={16} /> : null}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Instruction'}
        </Button>
      </Box>
      
      <Collapse in={showExamples}>
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4ff', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Example Instructions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {instructionExamples.map((example, index) => (
              <ExampleChip
                key={index}
                label={example.substring(0, 40) + '...'}
                onClick={() => handleExampleClick(example)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            {instructionExamples.map((example, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Example {index + 1}:
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {example}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
      
      <Collapse in={showTips}>
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tips for Writing Effective Instructions:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 24 }}>
            <li>
              <Typography variant="body2">
                Be specific about which parts of the source documents should be used
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Explain how the template structure should be maintained
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Specify any formatting requirements for the output
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Mention if certain sections should be prioritized
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Include any special handling for tables, images, or charts
              </Typography>
            </li>
          </ul>
        </Box>
      </Collapse>
      
      {analysis && (
        <Alert 
          severity={analysis.includes("good") ? "success" : "info"} 
          sx={{ mt: 2 }}
          icon={analysis.includes("good") ? <CheckCircleIcon /> : <InfoIcon />}
        >
          {analysis}
        </Alert>
      )}
    </InstructionContainer>
  );
};

export default CustomInstructionEditor;
