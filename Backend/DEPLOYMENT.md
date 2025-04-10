# Workflow Backend Deployment Guide

This guide provides instructions for deploying the Node.js backend for the Workflow UI application.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional)

## Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   # or extract the provided zip file
   ```

2. Navigate to the project directory:
   ```bash
   cd workflow-backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file (or use the provided one):
   ```bash
   PORT=3001
   NODE_ENV=development
   # Add your OpenAI API key for production use
   # OPENAI_API_KEY=your-api-key-here
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when changes are detected.

### Production Mode

```bash
npm start
```

This will start the server in production mode.

## Testing

To run the automated tests:

```bash
npm test
```

This will execute the test script that validates the core functionality of the backend.

## Directory Structure

```
workflow-backend/
├── config/                 - Configuration files
├── controllers/            - Request handlers
├── middleware/             - Express middleware
├── models/                 - Data models
├── routes/                 - API routes
├── services/               - Business logic
├── storage/                - Document storage directory
│   ├── uploads/            - Uploaded documents
│   └── processed/          - Processed documents
├── utils/                  - Utility functions
├── .env                    - Environment variables
├── app.js                  - Express application setup
├── server.js               - Server entry point
└── test.js                 - Automated tests
```

## API Documentation

See the `FRONTEND_INTEGRATION.md` file for detailed API documentation.

## Configuration

The application can be configured through the `.env` file and the `config/default.js` file.

### Environment Variables

- `PORT`: The port on which the server will listen (default: 3001)
- `NODE_ENV`: The environment mode (development, production)
- `OPENAI_API_KEY`: API key for OpenAI (required for production use of translation node)

### Configuration File

The `config/default.js` file contains additional configuration options:

- Server configuration
- Storage configuration
- API configuration
- AI service configuration

## Production Deployment Considerations

For production deployment, consider the following:

1. Set `NODE_ENV=production` in the `.env` file
2. Provide a valid OpenAI API key in the `.env` file
3. Consider using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name workflow-backend
   ```
4. Set up proper error logging and monitoring
5. Configure a reverse proxy (like Nginx) for SSL termination and load balancing
6. Implement proper backup strategies for the document storage

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in the `.env` file
   - Check if another process is using the port: `lsof -i :3001`

2. **File upload issues**
   - Check if the storage directories exist and have proper permissions
   - Verify that the file size is within the limits (default: 50MB)

3. **Translation node not working**
   - Ensure you have provided a valid OpenAI API key
   - Check the logs for specific error messages

### Logs

Logs are stored in the `logs` directory:
- `combined.log`: All logs
- `error.log`: Error logs only

## Support

For support, please contact the development team or open an issue in the repository.
