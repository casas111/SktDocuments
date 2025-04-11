import React, { useState, useEffect, KeyboardEvent } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import claudeService from '../services/claudeService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

interface Model {
  id: string;
  name: string;
}

/**
 * Claude Chat Component
 * Provides a user interface for interacting with Claude AI
 */
const ClaudeChat: React.FC = () => {
  // State for user input
  const [prompt, setPrompt] = useState<string>('');
  
  // State for chat history
  const [messages, setMessages] = useState<Message[]>([]);
  
  // State for loading status
  const [loading, setLoading] = useState<boolean>(false);
  
  // State for error messages
  const [error, setError] = useState<string>('');
  
  // State for available models
  const [models, setModels] = useState<Model[]>([]);
  
  // State for selected model
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-haiku-20240307');

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await claudeService.getAvailableModels();
        setModels(availableModels);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load available models');
      }
    };

    fetchModels();
  }, []);

  // Handle sending a message to Claude
  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    
    // Clear any previous errors
    setError('');
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setPrompt('');
    
    // Set loading state
    setLoading(true);
    
    try {
      // Format messages for API
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call Claude API
      const response = await claudeService.sendMessage(
        userMessage.content,
        selectedModel,
        1000,
        messageHistory
      );
      
      // Add Claude's response to chat
      if (response.success) {
        const claudeMessage: Message = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          model: response.model
        };
        
        setMessages(prev => [...prev, claudeMessage]);
      } else {
        setError(response.error || 'Failed to get response from Claude');
      }
    } catch (err) {
      console.error('Error sending message to Claude:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while communicating with Claude');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press in the input field
  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle model selection change
  const handleModelChange = (e: SelectChangeEvent<string>) => {
    setSelectedModel(e.target.value);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: '800px',
        mx: 'auto'
      }}
    >
      <Typography variant="h5" gutterBottom>
        Claude AI Chat
      </Typography>
      
      <FormControl variant="outlined" sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          value={selectedModel}
          onChange={handleModelChange}
          label="Model"
          size="small"
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Chat messages display area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          mb: 2,
          p: 1,
          bgcolor: 'background.default',
          borderRadius: 1
        }}
      >
        {messages.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            Start a conversation with Claude AI
          </Typography>
        ) : (
          messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                
                {message.role === 'assistant' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Model: {message.model}
                  </Typography>
                )}
              </Paper>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          ))
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'error.light',
              color: 'error.dark',
              borderRadius: 1
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Input area */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          variant="outlined"
          placeholder="Type your message to Claude..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !prompt.trim()}
          startIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ClaudeChat; 