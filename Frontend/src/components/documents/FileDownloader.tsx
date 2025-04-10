import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DocumentStore from '../../utils/DocumentStore';
import { Document } from '../../types/document';

interface FileDownloaderProps {
  nodeId: string;
  outputId: string;
  label?: string;
  documents?: Document[];
  onGenerateOutput?: () => Promise<Document[]>;
}

const FileDownloader: React.FC<FileDownloaderProps> = ({ 
  nodeId, 
  outputId, 
  label = 'Output Documents', 
  documents: externalDocuments,
  onGenerateOutput
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const documentStore = DocumentStore.getInstance();
  
  // Load documents on component mount or when external documents change
  useEffect(() => {
    if (externalDocuments) {
      setDocuments(externalDocuments);
    } else {
      const docs = documentStore.getNodeInputDocuments(nodeId, outputId);
      setDocuments(docs);
    }
  }, [nodeId, outputId, externalDocuments]);
  
  const handleDownloadDocument = (documentId: string) => {
    documentStore.downloadDocument(documentId);
  };
  
  const handleDownloadAll = () => {
    documents.forEach(doc => {
      documentStore.downloadDocument(doc.id);
    });
  };
  
  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsDialogOpen(true);
  };
  
  const handleClosePreview = () => {
    setIsDialogOpen(false);
    setPreviewDocument(null);
  };
  
  const handleGenerateOutput = async () => {
    if (!onGenerateOutput) return;
    
    setIsGenerating(true);
    try {
      const generatedDocuments = await onGenerateOutput();
      setDocuments(generatedDocuments);
    } catch (error) {
      console.error('Error generating output:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <AttachFileIcon color="primary" />;
    } else if (fileType.startsWith('application/pdf')) {
      return <AttachFileIcon color="error" />;
    } else if (fileType.startsWith('text/')) {
      return <AttachFileIcon color="success" />;
    } else {
      return <AttachFileIcon />;
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const renderPreview = () => {
    if (!previewDocument) return null;
    
    if (previewDocument.type.startsWith('image/')) {
      return (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <img 
            src={previewDocument.url} 
            alt={previewDocument.originalName}
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </Box>
      );
    } else if (previewDocument.type.startsWith('text/')) {
      // For text files, we need to extract the base64 content
      const content = previewDocument.url as string;
      const base64Content = content.split(',')[1];
      const decodedContent = atob(base64Content);
      
      return (
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 2, 
            maxHeight: '400px', 
            overflow: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '0.875rem'
          }}
        >
          {decodedContent}
        </Paper>
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Preview not available for this file type.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadDocument(previewDocument.id)}
            sx={{ mt: 2 }}
          >
            Download to view
          </Button>
        </Box>
      );
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Box>
          {onGenerateOutput && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleGenerateOutput}
              disabled={isGenerating}
              sx={{ mr: 1 }}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          )}
          {documents.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadAll}
            >
              Download All
            </Button>
          )}
        </Box>
      </Box>
      
      {documents.length > 0 ? (
        <List dense sx={{ maxHeight: '150px', overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
          {documents.map((doc) => (
            <ListItem key={doc.id} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getFileIcon(doc.type)}
              </ListItemIcon>
              <ListItemText
                primary={doc.originalName}
                secondary={formatFileSize(doc.size)}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Preview">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => handlePreviewDocument(doc)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={() => handleDownloadDocument(doc.id)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          p: 2, 
          border: '1px dashed #ccc', 
          borderRadius: '4px', 
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="body2" color="text.secondary">
            No output documents available
          </Typography>
          {onGenerateOutput && (
            <Chip 
              label="Click 'Generate' to create output" 
              size="small" 
              variant="outlined" 
              sx={{ mt: 1 }} 
            />
          )}
        </Box>
      )}
      
      <Dialog 
        open={isDialogOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDocument?.originalName}
          <Typography variant="caption" display="block" color="text.secondary">
            {previewDocument?.type} • {previewDocument && formatFileSize(previewDocument.size)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {renderPreview()}
        </DialogContent>
        <DialogActions>
          {previewDocument && (
            <Button 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDocument(previewDocument.id)}
            >
              Download
            </Button>
          )}
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileDownloader;
