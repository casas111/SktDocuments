import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

// This is a placeholder Settings page that would be connected to the backend API
const Settings = () => {
  const { initializeClaudeApi, isClaudeInitialized, error, setError } = useApp();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Claude API settings
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [claudeModel, setClaudeModel] = useState('claude-3-opus-20240229');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle save Claude API settings
  const handleSaveClaudeSettings = async () => {
    if (!claudeApiKey.trim()) {
      setSnackbar({
        open: true,
        message: 'API key is required',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would call the backend API via the context
      // const success = await initializeClaudeApi(claudeApiKey, claudeModel);
      
      // Simulated API call
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Claude API settings saved successfully',
          severity: 'success'
        });
      }, 1500);
    } catch (err) {
      console.error('Error saving Claude API settings:', err);
      setError('Failed to save Claude API settings. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Settings
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="General" />
          <Tab label="Claude API" />
          <Tab label="Notifications" />
        </Tabs>
      </Paper>
      
      {/* Tab content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure general application settings.
          </Typography>
          
          <TextField
            label="Application Name"
            fullWidth
            defaultValue="Simetrik AI Documents"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Default Document View</InputLabel>
            <Select
              value="list"
              label="Default Document View"
            >
              <MenuItem value="list">List</MenuItem>
              <MenuItem value="grid">Grid</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Default Sort Order</InputLabel>
            <Select
              value="name_asc"
              label="Default Sort Order"
            >
              <MenuItem value="name_asc">Name (A-Z)</MenuItem>
              <MenuItem value="name_desc">Name (Z-A)</MenuItem>
              <MenuItem value="date_asc">Date (Oldest first)</MenuItem>
              <MenuItem value="date_desc">Date (Newest first)</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Save Settings
          </Button>
        </Paper>
      )}
      
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Claude API Settings
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your Claude API settings to enable AI-powered document processing.
          </Typography>
          
          <TextField
            label="Claude API Key"
            fullWidth
            value={claudeApiKey}
            onChange={(e) => setClaudeApiKey(e.target.value)}
            type={showApiKey ? 'text' : 'password'}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <Button 
                  variant="text" 
                  size="small"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
              )
            }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Claude Model</InputLabel>
            <Select
              value={claudeModel}
              label="Claude Model"
              onChange={(e) => setClaudeModel(e.target.value)}
            >
              <MenuItem value="claude-3-opus-20240229">Claude 3 Opus</MenuItem>
              <MenuItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</MenuItem>
              <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={<ApiIcon />}
            onClick={handleSaveClaudeSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save API Settings'}
          </Button>
        </Paper>
      )}
      
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure notification preferences for the application.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Email Notifications</InputLabel>
            <Select
              value="all"
              label="Email Notifications"
            >
              <MenuItem value="all">All notifications</MenuItem>
              <MenuItem value="important">Important only</MenuItem>
              <MenuItem value="none">None</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>In-App Notifications</InputLabel>
            <Select
              value="all"
              label="In-App Notifications"
            >
              <MenuItem value="all">All notifications</MenuItem>
              <MenuItem value="important">Important only</MenuItem>
              <MenuItem value="none">None</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Save Notification Settings
          </Button>
        </Paper>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
