import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAllDocuments, 
  getDocumentById, 
  getDocumentsByFolder,
  uploadDocument,
  deleteDocument,
  moveDocumentToFolder,
  getAllFolders,
  createFolder,
  deleteFolder
} from '../services/api';
import { Document, DocumentType, AccessLevel, DocumentMetadata } from '../types/document';

// Context interface
interface DocumentStoreContextType {
  documents: Document[];
  folders: any[];
  currentFolder: string;
  loading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
  refreshFolders: () => Promise<void>;
  setCurrentFolder: (folderId: string) => void;
  addDocument: (file: File, nodeId?: string, inputId?: string) => Promise<Document>;
  getDocument: (id: string) => Document | undefined;
  getNodeInputDocuments: (nodeId: string, inputId: string) => Document[];
  removeDocument: (id: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string) => void;
  createNewFolder: (name: string, parentId?: string) => Promise<any>;
  deleteFolder: (id: string) => Promise<boolean>;
  moveDocument: (documentId: string, folderId: string) => Promise<boolean>;
}

// Create context
const DocumentStoreContext = createContext<DocumentStoreContextType | undefined>(undefined);

// Provider component
export const DocumentStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount and when currentFolder changes
  useEffect(() => {
    refreshDocuments();
  }, [currentFolder]);

  // Load folders on mount
  useEffect(() => {
    refreshFolders();
  }, []);

  // Refresh documents from API
  const refreshDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (currentFolder === 'root') {
        response = await getAllDocuments();
      } else {
        response = await getDocumentsByFolder(currentFolder);
      }
      
      if (response.success && response.data) {
        // Convert API documents to our Document interface
        const convertedDocs = response.data.map((doc: any) => ({
          id: doc.id,
          originalName: doc.name,
          filename: doc.name,
          mimetype: doc.type,
          size: doc.size,
          type: doc.type as unknown as DocumentType,
          uploadDate: new Date(doc.lastModified),
          metadata: {
            nodeId: null,
            nodeType: null,
            inputId: null,
            description: ''
          },
          folderId: doc.folderId || 'root',
          tags: doc.tags || [],
          starred: false,
          locked: false,
          accessLevel: 'private' as AccessLevel,
          url: doc.content || '',
          sharedWith: []
        }));
        
        setDocuments(convertedDocs);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Refresh folders from API
  const refreshFolders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllFolders();
      
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        setError('Failed to load folders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  // Add document
  const addDocument = async (file: File, nodeId?: string, inputId?: string): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();

      const newDoc: Document = {
        id: data.id,
        originalName: file.name,
        filename: data.filename,
        mimetype: file.type,
        size: file.size,
        type: 'input' as DocumentType,
        uploadDate: new Date(file.lastModified),
        metadata: {
          nodeId: null,
          nodeType: null,
          inputId: null,
          description: ''
        },
        folderId: '',
        tags: [],
        starred: false,
        locked: false,
        accessLevel: 'private' as AccessLevel,
        url: data.url,
        sharedWith: []
      };

      return newDoc;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  // Get document by ID
  const getDocument = (id: string): Document | undefined => {
    return documents.find(doc => doc.id === id);
  };

  // Get documents for a specific node input
  const getNodeInputDocuments = (nodeId: string, inputId: string): Document[] => {
    // For now, we're just returning all documents
    // In a real implementation, we would filter by nodeId and inputId
    return documents;
  };

  // Remove document (mark as removed)
  const removeDocument = async (id: string): Promise<boolean> => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    } catch (error) {
      console.error('Error removing document:', error);
      return false;
    }
  };

  // Delete document from server
  const deleteDocumentFromStore = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteDocument(id);
      
      if (response.success) {
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      
      // If server delete fails, try to remove from localStorage
      if (id.startsWith('local-')) {
        const storedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
        const updatedDocs = storedDocs.filter((doc: Document) => doc.id !== id);
        localStorage.setItem('documents', JSON.stringify(updatedDocs));
        
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        return true;
      }
      
      return false;
    }
  };

  // Download document
  const downloadDocument = (id: string): void => {
    const document = getDocument(id);
    
    if (!document) {
      console.error('Document not found');
      return;
    }
    
    // If url is a URL, open in new tab
    if (document.url.startsWith('http')) {
      window.open(document.url, '_blank');
      return;
    }
    
    // Otherwise, create a download link
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.originalName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Create new folder
  const createNewFolder = async (name: string, parentId: string = currentFolder): Promise<any> => {
    try {
      const response = await createFolder(name, parentId);
      
      if (response.success && response.data) {
        // Add to local state
        setFolders(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  // Delete folder
  const deleteFolderFromStore = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteFolder(id);
      
      if (response.success) {
        // Remove from local state
        setFolders(prev => prev.filter(folder => folder.id !== id));
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  };

  // Move document to folder
  const moveDocument = async (documentId: string, folderId: string): Promise<boolean> => {
    try {
      const response = await moveDocumentToFolder(documentId, folderId);
      
      if (response.success) {
        // If moving out of current folder, remove from local state
        if (folderId !== currentFolder) {
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } else {
          // Update document in local state
          setDocuments(prev => prev.map(doc => 
            doc.id === documentId ? { ...doc, folderId } : doc
          ));
        }
        return true;
      } else {
        throw new Error(response.error || 'Failed to move document');
      }
    } catch (error) {
      console.error('Error moving document:', error);
      return false;
    }
  };

  const value = {
    documents,
    folders,
    currentFolder,
    loading,
    error,
    refreshDocuments,
    refreshFolders,
    setCurrentFolder,
    addDocument,
    getDocument,
    getNodeInputDocuments,
    removeDocument,
    deleteDocument: deleteDocumentFromStore,
    downloadDocument,
    createNewFolder,
    deleteFolder: deleteFolderFromStore,
    moveDocument
  };

  return React.createElement(
    DocumentStoreContext.Provider,
    { value },
    children
  );
};

// Custom hook to use the document store
export const useDocumentStore = () => {
  const context = useContext(DocumentStoreContext);
  if (context === undefined) {
    throw new Error('useDocumentStore must be used within a DocumentStoreProvider');
  }
  return context;
};

// Singleton pattern for backward compatibility
class DocumentStore {
  private static instance: DocumentStore;
  private documents: Document[] = [];

  private constructor() {
    // Initialize from localStorage
    try {
      const storedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      this.documents = storedDocs;
    } catch (error) {
      console.error('Error loading documents from localStorage:', error);
    }
  }

  public static getInstance(): DocumentStore {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore();
    }
    return DocumentStore.instance;
  }

  // Methods to maintain backward compatibility
  public getNodeInputDocuments(nodeId: string, inputId: string): Document[] {
    return this.documents.filter(doc => 
      doc.id.includes(`${nodeId}-${inputId}`) || 
      doc.id.includes(nodeId)
    );
  }

  public async addDocument(file: File, nodeId?: string, inputId?: string): Promise<Document> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          const newDoc: Document = {
            id,
            originalName: file.name,
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            type: 'input' as DocumentType,
            uploadDate: new Date(file.lastModified),
            metadata: {
              nodeId: null,
              nodeType: null,
              inputId: null,
              description: ''
            },
            folderId: 'root',
            tags: [],
            starred: false,
            locked: false,
            accessLevel: 'private' as AccessLevel,
            url: event.target?.result?.toString() || '',
            sharedWith: []
          };
          
          this.documents.push(newDoc);
          
          // Store in localStorage
          localStorage.setItem('documents', JSON.stringify(this.documents));
          
          resolve(newDoc);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }

  public removeDocument(id: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== id);
    
    // Update localStorage
    localStorage.setItem('documents', JSON.stringify(this.documents));
    
    return this.documents.length < initialLength;
  }

  public deleteDocument(id: string): Promise<boolean> {
    return Promise.resolve(this.removeDocument(id));
  }

  public downloadDocument(id: string): void {
    const document = this.documents.find(doc => doc.id === id);
    
    if (!document) {
      console.error('Document not found');
      return;
    }
    
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.originalName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  }
}

export default DocumentStore;
