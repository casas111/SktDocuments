# Simetrik AI Documents - README

![Simetrik AI Documents Logo](docs/images/logo.png)

## Overview

Simetrik AI Documents is an enterprise-grade document management system with AI capabilities designed specifically for financial institutions. This application allows users to store, organize, process, and analyze documents using advanced AI features powered by Claude.

## Key Features

- **Document Management**: Upload, organize, and search documents with folders and labels
- **AI-Powered Processing**: Process documents with Claude AI for data extraction and analysis
- **Workflow Canvas**: Create and execute document workflows with a visual editor
- **Multiple Node Types**:
  - Transformation Nodes: Transform document content using AI
  - Comparison Nodes: Compare documents and identify differences
  - Simetrik Integration Nodes: Connect with other Simetrik systems
  - Communication Nodes: Send information via email, webhooks, or APIs
- **Responsive Design**: Works on desktop and mobile devices
- **Enterprise-Grade Security**: Authentication, authorization, and data protection

## Technology Stack

- **Frontend**: React, Material-UI, React Flow
- **Backend**: Node.js, Express, Sequelize
- **Database**: PostgreSQL
- **AI**: Claude API integration
- **Deployment**: Docker support, AWS deployment options

## Documentation

- [User Guide](docs/user_guide.md): Guide for end users
- [Technical Documentation](docs/technical_documentation.md): System architecture and implementation details
- [API Documentation](docs/api_documentation.md): API reference
- [Deployment Guide](docs/deployment_guide.md): Instructions for deployment

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- Claude API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/simetrik/SktDocuments.git
cd SktDocuments
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Create a `.env` file with your configuration (see `.env.example`).

4. Start the development server:
```bash
npm run dev
```

5. In a separate terminal, start the client:
```bash
npm run client
```

6. Open your browser and navigate to http://localhost:3000

## Deployment

See the [Deployment Guide](docs/deployment_guide.md) for detailed instructions on deploying the application to production.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For support or inquiries, please contact support@simetrik.com.

---

© 2025 Simetrik. All rights reserved.
