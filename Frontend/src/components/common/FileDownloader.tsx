import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import styled from '@emotion/styled';
import axios from 'axios';

// Styled components
const DownloadButton = styled(Button)`
  margin-top: 8px;
`;

interface FileDownloaderProps {
  filePath?: string;
  fileName?: string;
  label?: string;
  buttonVariant?: 'text' | 'outlined' | 'contained';
  buttonColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  buttonSize?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

const FileDownloader: React.FC<FileDownloaderProps> = ({
  filePath,
  fileName,
  label = 'Download',
  buttonVariant = 'contained',
  buttonColor = 'primary',
  buttonSize = 'medium',
  showIcon = true,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError
}) => {
  const [downloading, setDownloading] = React.useState(false);
  
  const handleDownload = async () => {
    if (!filePath) {
      console.error('No file path provided for download');
      if (onDownloadError) {
        onDownloadError(new Error('No file path provided for download'));
      }
      return;
    }
    
    setDownloading(true);
    
    try {
      if (onDownloadStart) {
        onDownloadStart();
      }
      
      // Get download URL from API
      const response = await axios.get('/api/files/download', {
        params: { path: filePath }
      });
      
      if (!response.data.success || !response.data.downloadUrl) {
        throw new Error(response.data.error || 'Failed to get download URL');
      }
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = fileName || filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      if (onDownloadError && error instanceof Error) {
        onDownloadError(error);
      }
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <DownloadButton
      variant={buttonVariant}
      color={buttonColor}
      size={buttonSize}
      onClick={handleDownload}
      disabled={downloading || !filePath}
      startIcon={showIcon ? (downloading ? <CircularProgress size={16} /> : <DownloadIcon />) : undefined}
    >
      {downloading ? 'Downloading...' : label}
    </DownloadButton>
  );
};

export default FileDownloader;
