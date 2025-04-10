import { useState, useEffect } from 'react';
import { 
  uploadDocument, 
  getAllDocuments, 
  deleteDocument,
  Document
} from '../services/api';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setError(response.message || 'Failed to fetch documents');
      }
    } catch (err) {
      setError('An error occurred while fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, metadata: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await uploadDocument(file, metadata);
      if (response.success && response.data) {
        const newDocument = response.data;
        setDocuments(prev => [...prev, newDocument]);
        return newDocument;
      } else {
        setError(response.message || 'Failed to upload document');
        return null;
      }
    } catch (err) {
      setError('An error occurred while uploading the document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteDocument(id);
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } else {
        setError(response.message || 'Failed to delete document');
      }
    } catch (err) {
      setError('An error occurred while deleting the document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    handleUpload,
    handleDelete,
    refresh: fetchDocuments,
  };
}; 