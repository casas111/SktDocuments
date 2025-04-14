# Simetrik AI Documents

An enterprise-grade document management and workflow automation platform that leverages AI for document processing.

## Overview

Simetrik AI Documents is a comprehensive platform that enables users to:

1. Manage documents with an intuitive folder structure
2. Apply labels to documents for easy categorization
3. Create and execute document processing workflows
4. Transform documents using AI-powered nodes
5. Compare documents and generate reports
6. Integrate with Simetrik services
7. Send notifications based on document processing results

## Architecture

The platform follows a modern microservices architecture:

- **Frontend**: React with TypeScript, Redux for state management, Material UI for components
- **Backend**: Node.js with Express, TypeScript, and Sequelize ORM
- **Database**: PostgreSQL for structured data storage
- **Storage**: AWS S3 for document storage
- **AI Integration**: Claude API for document processing

## Features

### Documents Section

- Hierarchical folder structure for document organization
- Document upload with drag-and-drop support
- Document labeling system with custom labels
- Document search and filtering
- Document preview for various file types
- Document sharing and permissions

### Workflows Section

- Visual workflow builder with drag-and-drop interface
- Four node types for document processing:
  - **Transformation Node**: Transform documents using AI
  - **Comparison Node**: Compare documents and generate reports
  - **Simetrik Integration Node**: Connect with Simetrik services
  - **Communication Node**: Send notifications and alerts
- Workflow execution with real-time status updates
- Workflow history and results tracking

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- AWS account with S3 bucket
- Claude API key

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Configure environment variables
4. Start the development servers

See the [Deployment Guide](./deployment.md) for production deployment instructions.

## Development

### Frontend

The frontend is built with React and TypeScript, using:

- Redux for state management
- Material UI for components
- React Router for navigation
- ReactFlow for the workflow canvas

To start the frontend development server:

```bash
cd frontend
npm install
npm start
```

### Backend

The backend is built with Node.js, Express, and TypeScript, using:

- Sequelize ORM for database access
- AWS SDK for S3 integration
- Claude API for AI document processing

To start the backend development server:

```bash
cd backend
npm install
npm run dev
```

## Testing

The project includes comprehensive test coverage:

- Unit tests for backend services
- Unit tests for workflow execution
- Integration tests for the Documents page
- Integration tests for the Workflows page

To run tests:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

See the [Deployment Guide](./deployment.md) for detailed deployment instructions, including:

- AWS Elastic Beanstalk deployment
- Docker containerization
- CI/CD pipeline configuration
- Database setup
- S3 bucket configuration

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact the Simetrik team.
