import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Chip,
  Collapse,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from '@emotion/styled';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Styled components
const InstructionContainer = styled(Box)`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
`;

const InstructionField = styled(TextField)`
  margin-top: 16px;
  margin-bottom: 8px;
  
  .MuiOutlinedInput-root {
    background-color: white;
  }
`;

const CharacterCounter = styled(Typography)`
  text-align: right;
  font-size: 0.75rem;
  margin-top: 4px;
`;

const ExampleChip = styled(Chip)`
  margin: 4px;
  cursor: pointer;
`;

const ModelSelector = styled(FormControl)`
  margin-top: 16px;
  width: 100%;
`;

// Example instructions
const instructionExamples = [
  "Please transform these documents into a quarterly report using the provided template. Extract company information from the first document and financial data from the second document.",
  "Create a comprehensive business proposal by combining the executive summary from document 1 with the financial projections from document 2, following the template structure.",
  "Generate a client presentation by extracting key metrics from document 1 and case studies from document 2, formatting according to the template."
];

// Available Claude models
const availableModels = [
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Balanced)' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Powerful)' }
];

interface CustomInstructionEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  showModelSelector?: boolean;
  onModelChange?: (model: string) => void;
  defaultModel?: string;
}

const CustomInstructionEditor: React.FC<CustomInstructionEditorProps> = ({
  value,
  onChange,
  error,
  maxLength = 2000,
  showModelSelector = true,
  onModelChange,
  defaultModel = 'claude-3-haiku-20240307'
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };
  
  const handleExampleClick = (example: string) => {
    if (example.length + value.length <= maxLength) {
      onChange(value ? `${value}\n\n${example}` : example);
    } else {
      onChange(example.substring(0, maxLength));
    }
  };
  
  const handleModelChange = (e: SelectChangeEvent<string>) => {
    const model = e.target.value;
    setSelectedModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };
  
  const analyzeInstruction = async () => {
    if (!value.trim()) return;
    
    setAnalyzing(true);
    try {
      const response = await axios.post(`${API_ENDPOINTS.CLAUDE}/analyze-instruction`, {
        instruction: value
      });
      
      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        setAnalysis('Could not analyze instruction. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing instruction:', error);
      setAnalysis('Error analyzing instruction. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <InstructionContainer>
      <Typography variant="subtitle1" gutterBottom>
        Instructions for Claude AI
      </Typography>
      
      {showModelSelector && (
        <ModelSelector size="small">
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
