import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Document, Page } from 'react-pdf';

// Note: In a real implementation, we would need to import these properly
// and set up the PDF.js worker
const pdfjs = {
  version: '3.4.120'
};

interface DocumentViewerProps {
  documentUrl: string;
  documentType: string;
  isLoading?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentUrl, 
  documentType,
  isLoading = false
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load document. Please try again later.');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    // In a real implementation, we would have proper document type detection
    // and rendering based on the file type
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>
          Document preview for {documentUrl}
          <br />
          Type: {documentType}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', minHeight: '50vh' }}>
      {renderContent()}
    </Box>
  );
};

export default DocumentViewer;
