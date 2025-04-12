import React, { useState } from 'react';
import { Button, Tooltip, IconButton, Box, Typography, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

interface FileUploaderProps {
  nodeId?: string;
  inputId?: string;
  label?: string;
  buttonOnly?: boolean;
  uploadPath?: string;
  acceptedFileTypes?: string;
  onUploadStart?: () => void;
  onUploadComplete?: (fileData: any) => void;
  onUploadError?: (error: Error) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  nodeId,
  inputId,
  label = 'Upload File',
  buttonOnly = false,
  uploadPath,
  acceptedFileTypes = '*',
  onUploadStart,
  onUploadComplete,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      if (onUploadStart) {
        onUploadStart();
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      let response;
      
      // If uploadPath is provided, use it for direct file upload
      if (uploadPath) {
        formData.append('path', uploadPath);
        response = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } 
      // Otherwise use nodeId and inputId for workflow node upload
      else if (nodeId && inputId) {
        response = await axios.post(`/api/nodes/${nodeId}/inputs/${inputId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        throw new Error('Either uploadPath or nodeId+inputId must be provided');
      }
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Upload failed');
      }
      
      if (onUploadComplete) {
        onUploadComplete(response.data.file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
      />
      
      {buttonOnly ? (
        <IconButton 
          size="small" 
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={24} /> : <UploadFileIcon fontSize="small" />}
        </IconButton>
      ) : (
        <Tooltip title="Upload file">
          <Button
            variant="outlined"
            size="small"
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : label}
          </Button>
        </Tooltip>
      )}
    </>
  );
};

export default FileUploader;
