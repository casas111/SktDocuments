# Frontend Integration Guide

This document provides instructions for integrating the React frontend with the Node.js backend for the Workflow UI application.

## API Endpoints

### Document API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/documents/upload` | POST | Upload a document | Form data with `file` and metadata | Document object with ID and URL |
| `/api/documents` | GET | Get all documents | None | Array of document objects |
| `/api/documents/:id` | GET | Get document by ID | None | Document object |
| `/api/documents/:id/download` | GET | Download document | None | File download |
| `/api/documents/:id` | DELETE | Delete document | None | Success message |

### Workflow API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/workflow/translate` | POST | Process translation | `{ documentId, exampleDocumentId }` | Process object with ID and status |
| `/api/workflow/communicate` | POST | Process communication (stub) | `{ documentId, instructions, channel }` | Stub response |
| `/api/workflow/compare` | POST | Process comparison (stub) | `{ documentsA, documentsB }` | Stub response |
| `/api/workflow/simetrik` | POST | Process Simetrik (stub) | `{ documentId, sourceFormat }` | Stub response |
| `/api/workflow/status/:id` | GET | Get process status | None | Process object with status and result |
| `/api/workflow/status` | GET | Get all processes | None | Array of process objects |

## Integration Steps

### 1. Configure API Base URL

Add the backend API URL to your frontend configuration:

```javascript
// src/config.js
export const API_BASE_URL = 'http://localhost:3001/api';
```

### 2. Create API Service

Create a service to handle API requests:

```javascript
// src/services/api.js
import { API_BASE_URL } from '../config';

// Document API
export const uploadDocument = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add metadata fields
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });
  
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

export const getAllDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/documents`);
  return response.json();
};

export const getDocumentById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`);
  return response.json();
};

export const downloadDocument = (id) => {
  window.open(`${API_BASE_URL}/documents/${id}/download`);
};

export const deleteDocument = async (id) => {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Workflow API
export const processTranslation = async (documentId, exampleDocumentId) => {
  const response = await fetch(`${API_BASE_URL}/workflow/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentId, exampleDocumentId }),
  });
  return response.json();
};

export const getProcessStatus = async (processId) => {
  const response = await fetch(`${API_BASE_URL}/workflow/status/${processId}`);
  return response.json();
};

export const getAllProcesses = async () => {
  const response = await fetch(`${API_BASE_URL}/workflow/status`);
  return response.json();
};
```

### 3. Update Document Components

Update your document upload and management components to use the API:

```javascript
// Example: Document upload component
import { uploadDocument } from '../services/api';

const handleUpload = async (event) => {
  const file = event.target.files[0];
  const metadata = {
    nodeId: props.nodeId,
    nodeType: props.nodeType,
    inputId: props.inputId,
    description: 'Document for processing'
  };
  
  try {
    const result = await uploadDocument(file, metadata);
    if (result.success) {
      // Handle successful upload
      props.onUploadSuccess(result.document);
    } else {
      // Handle error
      console.error(result.message);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 4. Update Workflow Components

Update your workflow processing components to use the API:

```javascript
// Example: Translation node component
import { processTranslation, getProcessStatus } from '../services/api';

const handleTranslate = async () => {
  try {
    // Start translation process
    const result = await processTranslation(inputDocumentId, exampleDocumentId);
    
    if (result.success) {
      // Store process ID
      setProcessId(result.process.id);
      
      // Poll for status updates
      const statusInterval = setInterval(async () => {
        const statusResult = await getProcessStatus(result.process.id);
        
        if (statusResult.success) {
          setProcessStatus(statusResult.process.status);
          
          // If process is completed or failed, stop polling
          if (statusResult.process.status === 'completed' || statusResult.process.status === 'failed') {
            clearInterval(statusInterval);
            
            if (statusResult.process.status === 'completed') {
              // Handle completed process
              setOutputDocumentId(statusResult.process.result.documentId);
            }
          }
        }
      }, 2000);
    } else {
      // Handle error
      console.error(result.message);
    }
  } catch (error) {
    console.error('Translation failed:', error);
  }
};
```

### 5. Update Document Explorer

Update your document explorer component to fetch and display documents:

```javascript
// Example: Document explorer component
import { useEffect, useState } from 'react';
import { getAllDocuments, deleteDocument } from '../services/api';

const DocumentExplorer = () => {
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const result = await getAllDocuments();
        if (result.success) {
          setDocuments(result.documents);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleDelete = async (id) => {
    try {
      const result = await deleteDocument(id);
      if (result.success) {
        // Remove document from state
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };
  
  return (
    <div>
      {/* Render documents */}
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.originalName}</h3>
          <p>Type: {doc.type}</p>
          <button onClick={() => window.open(doc.url)}>View</button>
          <button onClick={() => handleDelete(doc.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

## CORS Configuration

The backend is already configured to allow cross-origin requests from the frontend. If you encounter CORS issues, ensure your frontend is running on a supported origin.

## Error Handling

All API endpoints return a consistent response format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "error": "Error details (only when success is false)",
  "data": {} // Endpoint-specific data
}
```

Implement proper error handling in your frontend components to handle API errors gracefully.

## File URLs

Documents can be accessed via their URLs:
- Uploaded documents: `/files/uploads/{filename}`
- Processed documents: `/files/processed/{filename}`

These URLs are included in the document objects returned by the API.
