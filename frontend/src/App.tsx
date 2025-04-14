import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import MainLayout from './components/layouts/MainLayout';
import DocumentsPage from './pages/DocumentsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DocumentsPage />} />
          <Route path="documents/*" element={<DocumentsPage />} />
          <Route path="workflows/*" element={<WorkflowsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default App;
