# Simetrik AI Documents - System Architecture

## Overview

Simetrik AI Documents is a no-code building blocks platform for unstructured data, complementary to Simetrik Reconciliation SaaS. The system consists of two main sections:

1. **Documents**: A file repository system similar to Google Drive
2. **Workflows**: A canvas-based workflow builder with four types of nodes

## System Architecture

The architecture follows a modern client-server model with clear separation of concerns:

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit for global state, React Query for server state
- **UI Components**: Material UI with custom theming based on Simetrik branding
- **Routing**: React Router v6
- **Canvas Implementation**: React Flow for workflow canvas and node connections
- **Form Management**: Formik with Yup validation
- **HTTP Client**: Axios for API communication
- **Testing**: Jest and React Testing Library

### Backend Architecture

- **Framework**: Node.js with Express.js
- **API Design**: RESTful API with OpenAPI specification
- **Authentication**: JWT token validation (assuming auth is handled externally)
- **Database Access**: Sequelize ORM for RDS interaction
- **File Storage**: AWS SDK for S3 integration
- **AI Integration**: Claude API client for LLM operations
- **Validation**: Joi for request validation
- **Logging**: Winston for structured logging
- **Testing**: Jest with Supertest

### Database Schema

**RDS (PostgreSQL)**:

- **Users**: id, email, name, created_at, updated_at
- **Folders**: id, name, parent_id, owner_id, created_at, updated_at
- **Documents**: id, name, type, size, url, folder_id, owner_id, created_at, updated_at
- **Labels**: id, name, color, owner_id, created_at, updated_at
- **DocumentLabels**: document_id, label_id
- **Workflows**: id, name, description, canvas_state, owner_id, created_at, updated_at
- **Nodes**: id, workflow_id, type, name, position_x, position_y, config, created_at, updated_at
- **Connections**: id, workflow_id, source_node_id, target_node_id, source_handle, target_handle, created_at, updated_at

### File Storage (AWS S3)

- **Bucket Structure**:
  - `/documents/`: Original uploaded documents
  - `/transformations/`: Output from Transformation nodes
  - `/comparisons/`: Output from Comparison nodes
  - `/integrations/`: Output from Simetrik_integration nodes
  - `/communications/`: Output from Communication nodes

### API Endpoints

#### Documents API

- `GET /api/folders`: List all folders
- `GET /api/folders/:id`: Get folder details
- `POST /api/folders`: Create new folder
- `PUT /api/folders/:id`: Update folder
- `DELETE /api/folders/:id`: Delete folder

- `GET /api/documents`: List all documents
- `GET /api/documents/:id`: Get document details
- `POST /api/documents`: Upload new document
- `PUT /api/documents/:id`: Update document metadata
- `DELETE /api/documents/:id`: Delete document
- `GET /api/documents/:id/content`: View document content
- `POST /api/documents/:id/move`: Move document to different folder
- `POST /api/documents/:id/label`: Add label to document
- `DELETE /api/documents/:id/label/:labelId`: Remove label from document

- `GET /api/labels`: List all labels
- `POST /api/labels`: Create new label
- `PUT /api/labels/:id`: Update label
- `DELETE /api/labels/:id`: Delete label

#### Workflows API

- `GET /api/workflows`: List all workflows
- `GET /api/workflows/:id`: Get workflow details
- `POST /api/workflows`: Create new workflow
- `PUT /api/workflows/:id`: Update workflow
- `DELETE /api/workflows/:id`: Delete workflow
- `GET /api/workflows/:id/nodes`: Get all nodes in workflow
- `POST /api/workflows/:id/nodes`: Add node to workflow
- `PUT /api/workflows/:id/nodes/:nodeId`: Update node
- `DELETE /api/workflows/:id/nodes/:nodeId`: Delete node
- `POST /api/workflows/:id/connections`: Create connection between nodes
- `DELETE /api/workflows/:id/connections/:connectionId`: Delete connection

#### Node Operations API

- `POST /api/nodes/:id/trigger`: Manually trigger a node
- `GET /api/nodes/:id/status`: Get node execution status
- `GET /api/nodes/:id/results`: Get node execution results

### Claude AI Integration

- **Transformation Node**: Uses Claude to transform documents based on instructions
- **Comparison Node**: Uses Claude to compare documents and generate flags report
- **Integration with AWS S3**: All Claude outputs are stored in S3 and referenced in the database

### Security Considerations

- **Data Encryption**: All data in transit and at rest is encrypted
- **Input Validation**: All user inputs are validated before processing
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Logging**: Structured logging for audit and debugging purposes

## Deployment Architecture

- **Frontend**: Static assets served from CDN
- **Backend**: Node.js application deployed in containerized environment
- **Database**: AWS RDS PostgreSQL instance
- **File Storage**: AWS S3 buckets
- **Monitoring**: Application performance monitoring and error tracking

This architecture provides a scalable, maintainable, and secure foundation for the Simetrik AI Documents platform, following modern best practices for enterprise-grade applications.
