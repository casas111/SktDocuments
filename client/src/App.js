import React from 'react';
import { AppProvider } from './context/AppContext';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Workflows from './pages/Workflows';
import WorkflowEditor from './pages/WorkflowEditor';
import DocumentViewer from './pages/DocumentViewer';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AppProvider>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentViewer />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/:id" element={<WorkflowEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </Box>
    </AppProvider>
  );
}

export default App;
