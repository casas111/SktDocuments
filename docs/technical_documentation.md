# Simetrik AI Documents - Technical Documentation

## System Architecture

Simetrik AI Documents is built using a modern web application architecture with a clear separation between frontend and backend components.

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄───►│  Node.js API    │◄───►│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │  File Storage   │     │   Claude API    │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

### Technology Stack

#### Frontend
- React.js for UI components
- Material-UI for component library
- React Router for navigation
- React Flow for workflow canvas
- Framer Motion for animations
- Axios for API communication

#### Backend
- Node.js runtime
- Express.js framework
- Sequelize ORM
- PostgreSQL database
- Multer for file uploads
- Claude API integration

#### DevOps
- Jest for testing
- React Testing Library for frontend testing
- Supertest for API testing
- ESLint for code quality
- Git for version control

## Backend Implementation

### Database Schema

The application uses PostgreSQL with the following main tables:

#### Documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(255) NOT NULL,
  folder_id UUID REFERENCES folders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Folders
```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Workflows
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_run TIMESTAMP WITH TIME ZONE
);
```

#### Nodes
```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Edges
```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Labels
```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### DocumentLabels
```sql
CREATE TABLE document_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, label_id)
);
```

#### NodeExecutions
```sql
CREATE TABLE node_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  input_documents JSONB,
  output_documents JSONB,
  execution_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### API Endpoints

#### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents | Get all documents |
| GET | /api/documents/:id | Get document by ID |
| POST | /api/documents | Create new document |
| PUT | /api/documents/:id | Update document |
| DELETE | /api/documents/:id | Delete document |
| GET | /api/documents/folder/:folderId | Get documents in folder |
| GET | /api/documents/search/:query | Search documents |
| POST | /api/documents/:id/process | Process document with Claude |

#### Folder Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/folders | Get all folders |
| GET | /api/folders/:id | Get folder by ID |
| POST | /api/folders | Create new folder |
| PUT | /api/folders/:id | Update folder |
| DELETE | /api/folders/:id | Delete folder |
| GET | /api/folders/:id/children | Get child folders |

#### Workflow Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workflows | Get all workflows |
| GET | /api/workflows/:id | Get workflow by ID |
| POST | /api/workflows | Create new workflow |
| PUT | /api/workflows/:id | Update workflow |
| DELETE | /api/workflows/:id | Delete workflow |
| POST | /api/workflows/:id/execute | Execute workflow |
| GET | /api/workflows/:id/executions | Get workflow execution history |

#### Node Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/nodes | Get all nodes |
| GET | /api/nodes/:id | Get node by ID |
| POST | /api/nodes | Create new node |
| PUT | /api/nodes/:id | Update node |
| DELETE | /api/nodes/:id | Delete node |
| GET | /api/nodes/workflow/:workflowId | Get nodes in workflow |
| POST | /api/nodes/:id/execute | Execute node |

#### Edge Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/edges | Get all edges |
| GET | /api/edges/:id | Get edge by ID |
| POST | /api/edges | Create new edge |
| DELETE | /api/edges/:id | Delete edge |
| GET | /api/edges/workflow/:workflowId | Get edges in workflow |

#### Label Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/labels | Get all labels |
| GET | /api/labels/:id | Get label by ID |
| POST | /api/labels | Create new label |
| PUT | /api/labels/:id | Update label |
| DELETE | /api/labels/:id | Delete label |
| POST | /api/documents/:id/labels/:labelId | Add label to document |
| DELETE | /api/documents/:id/labels/:labelId | Remove label from document |

### File Storage

The application uses a file storage service to manage document files. Files are stored in a structured directory hierarchy:

```
/storage
  /documents
    /{folder_id}
      /{document_id}.{extension}
  /transformations
    /{node_execution_id}
      /{output_document_id}.{extension}
  /comparisons
    /{node_execution_id}
      /{output_document_id}.{extension}
```

### Node Types Implementation

#### Transformation Node

The transformation node uses Claude to transform document content based on a template. The implementation includes:

- Template validation
- Document content extraction
- Claude API integration for processing
- Output document generation

#### Comparison Node

The comparison node uses Claude to compare multiple documents. The implementation includes:

- Document content extraction
- Claude API integration for comparison
- Comparison report generation

#### Simetrik Integration Node

The Simetrik integration node connects with other Simetrik systems. The implementation includes:

- API endpoint configuration
- Data mapping
- Error handling and retries

#### Communication Node

The communication node sends information to external systems. The implementation includes:

- Email sending via SMTP
- Webhook integration
- API call functionality

## Frontend Implementation

### Component Structure

The frontend is organized into the following main components:

```
/src
  /components
    /layout
      MainLayout.js
    /documents
      DocumentCard.js
      DocumentList.js
      DocumentGrid.js
      FolderItem.js
    /workflows
      WorkflowCard.js
      WorkflowList.js
    /nodes
      TransformationNode.js
      ComparisonNode.js
      SimetrikIntegrationNode.js
      CommunicationNode.js
  /pages
    Dashboard.js
    Documents.js
    DocumentViewer.js
    Workflows.js
    WorkflowEditor.js
    Settings.js
  /context
    AppContext.js
  /utils
    api.js
    fileUtils.js
  /hooks
    useDebounce.js
    useLocalStorage.js
  App.js
  index.js
  theme.js
```

### State Management

The application uses React Context API for state management. The main context is AppContext, which provides:

- Document management functions
- Workflow management functions
- Node management functions
- Error handling
- Loading states

### Routing

React Router is used for navigation with the following main routes:

- `/` - Dashboard
- `/documents` - Document list
- `/documents/:id` - Document viewer
- `/workflows` - Workflow list
- `/workflows/:id` - Workflow editor
- `/settings` - Settings page

### Workflow Canvas

The workflow canvas is implemented using React Flow, which provides:

- Node rendering
- Edge connections
- Dragging and zooming
- Node selection
- Mini-map and controls

### UI/UX Design

The application uses Material-UI with a custom theme for consistent styling. Key UI/UX features include:

- Responsive design for all screen sizes
- Consistent color palette and typography
- Smooth animations and transitions
- Clear visual hierarchy
- Intuitive navigation
- Comprehensive error handling and feedback

## Claude AI Integration

### Claude API Configuration

The application integrates with Claude API using the following configuration:

```javascript
const claudeService = {
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-opus-20240229',
  baseUrl: 'https://api.anthropic.com/v1/messages',
  
  initialize(config) {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.model) this.model = config.model;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  },
  
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
  },
  
  // API methods...
};
```

### Document Processing

Claude is used to process documents with the following method:

```javascript
async processDocument(documentContent, instruction) {
  try {
    const response = await axios.post(
      this.baseUrl,
      {
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Document content:
${documentContent}

Instructions:
${instruction}

Please process this document according to the instructions.`
          }
        ]
      },
      {
        headers: this.getHeaders()
      }
    );
    
    return {
      success: true,
      result: response.data.content[0].text,
      usage: response.data.usage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Document Comparison

Claude is used to compare documents with the following method:

```javascript
async compareDocuments(document1Content, document2Content, instruction) {
  try {
    const response = await axios.post(
      this.baseUrl,
      {
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Document 1:
${document1Content}

Document 2:
${document2Content}

Instructions:
${instruction}

Please compare these documents according to the instructions.`
          }
        ]
      },
      {
        headers: this.getHeaders()
      }
    );
    
    return {
      success: true,
      result: response.data.content[0].text,
      usage: response.data.usage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Template Generation

Claude is used to generate transformation templates with the following method:

```javascript
async generateTransformationTemplate(exampleInput, exampleOutput) {
  try {
    const response = await axios.post(
      this.baseUrl,
      {
        model: this.model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `I need to create a transformation template that can convert input documents to a specific format.

Example input:
${exampleInput}

Example output:
${exampleOutput}

Please create a transformation template that can be used to convert similar inputs to the desired output format.`
          }
        ]
      },
      {
        headers: this.getHeaders()
      }
    );
    
    return {
      success: true,
      template: response.data.content[0].text,
      usage: response.data.usage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Testing

### Unit Testing

The application includes comprehensive unit tests for both backend and frontend components:

- Backend API routes
- Service functions
- Model validations
- Frontend components
- Context providers

### Integration Testing

Integration tests verify the interaction between components:

- Workflow execution process
- Document management flow
- Frontend-backend communication

### Test Coverage

The test suite aims for high coverage of critical functionality:

- Document management: 95%
- Workflow execution: 90%
- Node operations: 85%
- Claude integration: 80%

## Deployment

### Requirements

- Node.js 16+
- PostgreSQL 13+
- 2GB RAM minimum
- 10GB storage minimum
- Claude API key

### Environment Variables

```
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simetrik_documents
DB_USER=postgres
DB_PASSWORD=your_password

# File Storage
STORAGE_PATH=/path/to/storage

# Claude API
CLAUDE_API_KEY=your_api_key
CLAUDE_MODEL=claude-3-opus-20240229
```

### Deployment Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Build the frontend: `npm run build`
5. Start the server: `npm start`

## Security Considerations

- All API endpoints require authentication
- File uploads are validated and sanitized
- SQL injection protection via ORM
- XSS protection in frontend
- CSRF protection for API requests
- Rate limiting for API endpoints
- Secure storage of Claude API key
- Regular security audits

## Performance Optimization

- Database indexing for frequently queried fields
- Caching of document metadata
- Pagination for large document lists
- Lazy loading of document content
- Optimized Claude API usage
- Frontend bundle optimization
- Image and file compression

## Future Enhancements

- Advanced search with filters
- Document versioning
- Collaborative editing
- Workflow templates
- Mobile application
- Batch processing
- Advanced analytics dashboard
- Integration with more AI models
- Custom node types

---

© 2025 Simetrik. All rights reserved.
