# Simetrik AI Documents - API Documentation

## Overview

The Simetrik AI Documents API provides programmatic access to the document management system, workflow functionality, and AI capabilities. This documentation covers all available endpoints, request/response formats, and authentication requirements.

## Base URL

```
https://api.simetrik-documents.com/v1
```

## Authentication

All API requests require authentication using an API key. Include the API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Metadata (pagination, etc.)
  }
}
```

For error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - The request was invalid |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are limited to 100 requests per minute per API key. Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1618329600
```

## Endpoints

### Documents

#### List Documents

```
GET /documents
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| folder_id | string | Filter by folder ID |
| search | string | Search query |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| sort | string | Sort field (name, created_at, updated_at) |
| order | string | Sort order (asc, desc) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
      "name": "Financial Report Q1 2025.pdf",
      "type": "pdf",
      "size": 1024567,
      "folder_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
      "created_at": "2025-03-15T10:30:00Z",
      "updated_at": "2025-03-15T10:30:00Z",
      "labels": [
        {
          "id": "l1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f",
          "name": "Financial",
          "color": "#4caf50"
        }
      ]
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Get Document

```
GET /documents/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
    "name": "Financial Report Q1 2025.pdf",
    "type": "pdf",
    "size": 1024567,
    "folder_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "path": "/storage/documents/f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f/d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c.pdf",
    "created_at": "2025-03-15T10:30:00Z",
    "updated_at": "2025-03-15T10:30:00Z",
    "labels": [
      {
        "id": "l1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f",
        "name": "Financial",
        "color": "#4caf50"
      }
    ]
  }
}
```

#### Upload Document

```
POST /documents
```

Request (multipart/form-data):

| Parameter | Type | Description |
|-----------|------|-------------|
| file | file | Document file |
| name | string | Document name (optional, defaults to filename) |
| folder_id | string | Folder ID (optional) |

Response:

```json
{
  "success": true,
  "data": {
    "id": "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
    "name": "Financial Report Q1 2025.pdf",
    "type": "pdf",
    "size": 1024567,
    "folder_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "created_at": "2025-03-15T10:30:00Z",
    "updated_at": "2025-03-15T10:30:00Z"
  }
}
```

#### Update Document

```
PUT /documents/:id
```

Request:

```json
{
  "name": "Updated Financial Report Q1 2025.pdf",
  "folder_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
    "name": "Updated Financial Report Q1 2025.pdf",
    "type": "pdf",
    "size": 1024567,
    "folder_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "created_at": "2025-03-15T10:30:00Z",
    "updated_at": "2025-03-15T11:45:00Z"
  }
}
```

#### Delete Document

```
DELETE /documents/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully"
  }
}
```

#### Process Document with Claude

```
POST /documents/:id/process
```

Request:

```json
{
  "instruction": "Extract all financial data from this report and format as a JSON object with the following structure: { \"revenue\": number, \"expenses\": number, \"profit\": number }"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "result": {
      "revenue": 1250000,
      "expenses": 875000,
      "profit": 375000
    },
    "usage": {
      "input_tokens": 1543,
      "output_tokens": 25
    }
  }
}
```

### Folders

#### List Folders

```
GET /folders
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| parent_id | string | Filter by parent folder ID |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
      "name": "Financial Reports",
      "parent_id": null,
      "created_at": "2025-02-10T09:15:00Z",
      "updated_at": "2025-02-10T09:15:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get Folder

```
GET /folders/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "name": "Financial Reports",
    "parent_id": null,
    "created_at": "2025-02-10T09:15:00Z",
    "updated_at": "2025-02-10T09:15:00Z"
  }
}
```

#### Create Folder

```
POST /folders
```

Request:

```json
{
  "name": "Q2 Reports",
  "parent_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Q2 Reports",
    "parent_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "created_at": "2025-04-16T14:20:00Z",
    "updated_at": "2025-04-16T14:20:00Z"
  }
}
```

#### Update Folder

```
PUT /folders/:id
```

Request:

```json
{
  "name": "Q2 Financial Reports",
  "parent_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Q2 Financial Reports",
    "parent_id": "f8e7d6c5-b4a3-2c1d-0e9f-8a7b6c5d4e3f",
    "created_at": "2025-04-16T14:20:00Z",
    "updated_at": "2025-04-16T15:30:00Z"
  }
}
```

#### Delete Folder

```
DELETE /folders/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Folder deleted successfully"
  }
}
```

### Workflows

#### List Workflows

```
GET /workflows
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (draft, active, inactive) |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
      "name": "Monthly Reconciliation",
      "description": "Automated workflow for monthly financial reconciliation",
      "status": "active",
      "created_at": "2025-03-10T09:00:00Z",
      "updated_at": "2025-04-15T11:20:00Z",
      "last_run": "2025-04-15T11:20:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get Workflow

```
GET /workflows/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "name": "Monthly Reconciliation",
    "description": "Automated workflow for monthly financial reconciliation",
    "status": "active",
    "created_at": "2025-03-10T09:00:00Z",
    "updated_at": "2025-04-15T11:20:00Z",
    "last_run": "2025-04-15T11:20:00Z"
  }
}
```

#### Create Workflow

```
POST /workflows
```

Request:

```json
{
  "name": "Quarterly Financial Analysis",
  "description": "Analyze quarterly financial reports",
  "status": "draft"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "q7w8e9r0-t1y2-u3i4-o5p6-a7s8d9f0g1h2",
    "name": "Quarterly Financial Analysis",
    "description": "Analyze quarterly financial reports",
    "status": "draft",
    "created_at": "2025-04-16T16:00:00Z",
    "updated_at": "2025-04-16T16:00:00Z",
    "last_run": null
  }
}
```

#### Update Workflow

```
PUT /workflows/:id
```

Request:

```json
{
  "name": "Quarterly Financial Analysis",
  "description": "Comprehensive analysis of quarterly financial reports",
  "status": "active"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "q7w8e9r0-t1y2-u3i4-o5p6-a7s8d9f0g1h2",
    "name": "Quarterly Financial Analysis",
    "description": "Comprehensive analysis of quarterly financial reports",
    "status": "active",
    "created_at": "2025-04-16T16:00:00Z",
    "updated_at": "2025-04-16T16:30:00Z",
    "last_run": null
  }
}
```

#### Delete Workflow

```
DELETE /workflows/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Workflow deleted successfully"
  }
}
```

#### Execute Workflow

```
POST /workflows/:id/execute
```

Request:

```json
{
  "input_documents": [
    "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
    "e9f8d7c6-b5a4-3c2d-1e0f-9a8b7c6d5e4f"
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "execution_id": "x1c2v3b4-n5m6-a7s8-d9f0-g1h2j3k4l5z6",
    "status": "started",
    "message": "Workflow execution started"
  }
}
```

#### Get Workflow Execution Status

```
GET /workflows/:id/executions/:execution_id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "x1c2v3b4-n5m6-a7s8-d9f0-g1h2j3k4l5z6",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "status": "completed",
    "started_at": "2025-04-16T16:45:00Z",
    "completed_at": "2025-04-16T16:47:30Z",
    "input_documents": [
      "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c",
      "e9f8d7c6-b5a4-3c2d-1e0f-9a8b7c6d5e4f"
    ],
    "output_documents": [
      "o1p2a3s4-d5f6-g7h8-j9k0-l1z2x3c4v5b6"
    ],
    "node_executions": [
      {
        "id": "n1e2x3e4-c5u6-t7i8-o9n0-i1d2n3o4d5e6",
        "node_id": "node1",
        "status": "completed",
        "started_at": "2025-04-16T16:45:10Z",
        "completed_at": "2025-04-16T16:45:45Z"
      },
      {
        "id": "n7e8x9e0-c1u2-t3i4-o5n6-i7d8n9o0d1e2",
        "node_id": "node2",
        "status": "completed",
        "started_at": "2025-04-16T16:45:50Z",
        "completed_at": "2025-04-16T16:46:20Z"
      }
    ]
  }
}
```

### Nodes

#### List Nodes

```
GET /nodes
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| workflow_id | string | Filter by workflow ID |
| type | string | Filter by node type |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "node1",
      "name": "Extract Data",
      "type": "transformation",
      "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
      "config": {
        "template": "Extract all financial data from the document and format as JSON"
      },
      "position_x": 250,
      "position_y": 100,
      "created_at": "2025-03-10T09:15:00Z",
      "updated_at": "2025-03-10T09:15:00Z"
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get Node

```
GET /nodes/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "node1",
    "name": "Extract Data",
    "type": "transformation",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "config": {
      "template": "Extract all financial data from the document and format as JSON"
    },
    "position_x": 250,
    "position_y": 100,
    "created_at": "2025-03-10T09:15:00Z",
    "updated_at": "2025-03-10T09:15:00Z"
  }
}
```

#### Create Node

```
POST /nodes
```

Request:

```json
{
  "name": "Format Data",
  "type": "transformation",
  "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
  "config": {
    "template": "Format the financial data as a table with columns: Date, Description, Amount"
  },
  "position_x": 250,
  "position_y": 250
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "node5",
    "name": "Format Data",
    "type": "transformation",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "config": {
      "template": "Format the financial data as a table with columns: Date, Description, Amount"
    },
    "position_x": 250,
    "position_y": 250,
    "created_at": "2025-04-16T17:00:00Z",
    "updated_at": "2025-04-16T17:00:00Z"
  }
}
```

#### Update Node

```
PUT /nodes/:id
```

Request:

```json
{
  "name": "Format Financial Data",
  "config": {
    "template": "Format the financial data as a table with columns: Date, Description, Amount, Category"
  },
  "position_x": 300,
  "position_y": 250
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "node5",
    "name": "Format Financial Data",
    "type": "transformation",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "config": {
      "template": "Format the financial data as a table with columns: Date, Description, Amount, Category"
    },
    "position_x": 300,
    "position_y": 250,
    "created_at": "2025-04-16T17:00:00Z",
    "updated_at": "2025-04-16T17:15:00Z"
  }
}
```

#### Delete Node

```
DELETE /nodes/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Node deleted successfully"
  }
}
```

#### Execute Node

```
POST /nodes/:id/execute
```

Request:

```json
{
  "input_documents": [
    "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c"
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "execution_id": "n1e2x3e4-c5u6-t7i8-o9n0-i1d2n3o4d5e6",
    "status": "completed",
    "input_documents": [
      "d8f3b8e0-9e7a-4e5c-8f1d-3c2b1a9e8d7c"
    ],
    "output_documents": [
      "o1p2a3s4-d5f6-g7h8-j9k0-l1z2x3c4v5b6"
    ],
    "execution_details": {
      "started_at": "2025-04-16T17:30:00Z",
      "completed_at": "2025-04-16T17:30:35Z",
      "claude_usage": {
        "input_tokens": 1543,
        "output_tokens": 256
      }
    }
  }
}
```

### Edges

#### List Edges

```
GET /edges
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| workflow_id | string | Filter by workflow ID |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "edge1-2",
      "source": "node1",
      "target": "node2",
      "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
      "created_at": "2025-03-10T09:20:00Z",
      "updated_at": "2025-03-10T09:20:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get Edge

```
GET /edges/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "edge1-2",
    "source": "node1",
    "target": "node2",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "created_at": "2025-03-10T09:20:00Z",
    "updated_at": "2025-03-10T09:20:00Z"
  }
}
```

#### Create Edge

```
POST /edges
```

Request:

```json
{
  "source": "node2",
  "target": "node5",
  "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "edge2-5",
    "source": "node2",
    "target": "node5",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "created_at": "2025-04-16T17:45:00Z",
    "updated_at": "2025-04-16T17:45:00Z"
  }
}
```

#### Delete Edge

```
DELETE /edges/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Edge deleted successfully"
  }
}
```

### Labels

#### List Labels

```
GET /labels
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "l1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f",
      "name": "Financial",
      "color": "#4caf50",
      "created_at": "2025-02-15T08:30:00Z",
      "updated_at": "2025-02-15T08:30:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get Label

```
GET /labels/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "l1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f",
    "name": "Financial",
    "color": "#4caf50",
    "created_at": "2025-02-15T08:30:00Z",
    "updated_at": "2025-02-15T08:30:00Z"
  }
}
```

#### Create Label

```
POST /labels
```

Request:

```json
{
  "name": "Quarterly",
  "color": "#2196f3"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "q1u2a3r4-t5e6-r7l8-y9l0-a1b2e3l4i5d6",
    "name": "Quarterly",
    "color": "#2196f3",
    "created_at": "2025-04-16T18:00:00Z",
    "updated_at": "2025-04-16T18:00:00Z"
  }
}
```

#### Update Label

```
PUT /labels/:id
```

Request:

```json
{
  "name": "Quarterly Report",
  "color": "#1976d2"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "q1u2a3r4-t5e6-r7l8-y9l0-a1b2e3l4i5d6",
    "name": "Quarterly Report",
    "color": "#1976d2",
    "created_at": "2025-04-16T18:00:00Z",
    "updated_at": "2025-04-16T18:15:00Z"
  }
}
```

#### Delete Label

```
DELETE /labels/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Label deleted successfully"
  }
}
```

#### Add Label to Document

```
POST /documents/:document_id/labels/:label_id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Label added to document successfully"
  }
}
```

#### Remove Label from Document

```
DELETE /documents/:document_id/labels/:label_id
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Label removed from document successfully"
  }
}
```

## Webhooks

Simetrik AI Documents supports webhooks for real-time notifications of events. To register a webhook:

```
POST /webhooks
```

Request:

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["document.created", "workflow.executed"],
  "secret": "your_webhook_secret"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "w1e2b3h4-o5o6-k7i8-d9a0-b1c2d3e4f5g6",
    "url": "https://your-server.com/webhook",
    "events": ["document.created", "workflow.executed"],
    "created_at": "2025-04-16T18:30:00Z",
    "updated_at": "2025-04-16T18:30:00Z"
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| document.created | Triggered when a document is created |
| document.updated | Triggered when a document is updated |
| document.deleted | Triggered when a document is deleted |
| workflow.created | Triggered when a workflow is created |
| workflow.updated | Triggered when a workflow is updated |
| workflow.deleted | Triggered when a workflow is deleted |
| workflow.executed | Triggered when a workflow is executed |
| node.executed | Triggered when a node is executed |

### Webhook Payload

```json
{
  "event": "workflow.executed",
  "timestamp": "2025-04-16T19:00:00Z",
  "data": {
    "id": "x1c2v3b4-n5m6-a7s8-d9f0-g1h2j3k4l5z6",
    "workflow_id": "w1e2r3t4-y5u6-i7o8-p9a0-s1d2f3g4h5j6",
    "status": "completed",
    "started_at": "2025-04-16T18:55:00Z",
    "completed_at": "2025-04-16T18:57:30Z"
  }
}
```

## SDKs

Official SDKs are available for the following languages:

- JavaScript/TypeScript: [simetrik-documents-js](https://github.com/simetrik/simetrik-documents-js)
- Python: [simetrik-documents-python](https://github.com/simetrik/simetrik-documents-python)
- Java: [simetrik-documents-java](https://github.com/simetrik/simetrik-documents-java)

## Support

For API support, please contact api-support@simetrik.com or visit our [Developer Portal](https://developers.simetrik.com).

---

© 2025 Simetrik. All rights reserved.
