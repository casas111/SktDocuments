import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { DocumentStoreProvider } from './utils/DocumentStore';
import { WorkflowStoreProvider } from './utils/WorkflowStore';
import MainLayout from './components/layout/MainLayout';

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
          <MainLayout />
        </WorkflowStoreProvider>
      </DocumentStoreProvider>
    </ThemeProvider>
  );
}

export default App;
