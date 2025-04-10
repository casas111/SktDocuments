import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import WorkflowBuilder from './components/workflow/WorkflowBuilder';
import DocumentDrive from './components/documents/DocumentDrive';
import { DocumentStoreProvider } from './utils/DocumentStore';
import { WorkflowStoreProvider } from './utils/WorkflowStore';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#9c27b0',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DocumentStoreProvider>
        <WorkflowStoreProvider>
          <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<WorkflowBuilder />} />
              <Route path="/workflow" element={<WorkflowBuilder />} />
              <Route path="/workflow/:id" element={<WorkflowBuilder />} />
              <Route path="/documents/*" element={<DocumentDrive />} />
            </Routes>
          </Box>
        </WorkflowStoreProvider>
      </DocumentStoreProvider>
    </ThemeProvider>
  );
}

export default App;
