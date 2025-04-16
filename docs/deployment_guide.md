# Simetrik AI Documents - Deployment Guide

This guide provides instructions for deploying the Simetrik AI Documents application in a production environment.

## Prerequisites

Before deploying the application, ensure you have the following:

- Node.js 16+ installed
- PostgreSQL 13+ installed and running
- A Claude API key
- Sufficient disk space (minimum 10GB recommended)
- Domain name (optional, for production deployment)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/simetrik/SktDocuments.git
cd SktDocuments
```

2. Create a `.env` file in the root directory with the following variables:
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

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

3. Create the necessary directories for file storage:
```bash
mkdir -p storage/documents
mkdir -p storage/transformations
mkdir -p storage/comparisons
```

## Database Setup

1. Create the PostgreSQL database:
```bash
sudo -u postgres psql -c "CREATE DATABASE simetrik_documents;"
```

2. The application will automatically create the tables on first run.

## Application Deployment

### Option 1: Local Deployment

1. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

2. Build the frontend:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

The application will be available at http://localhost:3000

### Option 2: Docker Deployment

1. Build the Docker image:
```bash
docker build -t simetrik-ai-documents .
```

2. Run the container:
```bash
docker run -d -p 3000:3000 --name simetrik-ai-documents \
  --env-file .env \
  -v /path/to/storage:/app/storage \
  simetrik-ai-documents
```

The application will be available at http://localhost:3000

### Option 3: Cloud Deployment (AWS)

#### Prerequisites
- AWS account
- AWS CLI configured
- Elastic Beanstalk CLI installed

#### Steps

1. Initialize Elastic Beanstalk application:
```bash
eb init simetrik-ai-documents --platform node.js --region us-east-1
```

2. Create the environment:
```bash
eb create production
```

3. Configure environment variables:
```bash
eb setenv PORT=8080 NODE_ENV=production DB_HOST=your-rds-endpoint DB_PORT=5432 DB_NAME=simetrik_documents DB_USER=postgres DB_PASSWORD=your_password CLAUDE_API_KEY=your_api_key CLAUDE_MODEL=claude-3-opus-20240229 JWT_SECRET=your_jwt_secret JWT_EXPIRES_IN=24h
```

4. Deploy the application:
```bash
eb deploy
```

The application will be available at the Elastic Beanstalk URL provided in the output.

## Post-Deployment Steps

1. Create an admin user:
```bash
curl -X POST http://localhost:3000/api/users/admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_secure_password","email":"admin@example.com"}'
```

2. Verify the application is running correctly:
```bash
curl http://localhost:3000/api/health
```

3. Set up regular backups for the database and file storage.

## Monitoring and Maintenance

1. Set up monitoring using your preferred tool (e.g., PM2, New Relic, AWS CloudWatch).

2. Configure log rotation to prevent disk space issues.

3. Set up regular database maintenance tasks (vacuum, analyze).

4. Implement a backup strategy for both the database and file storage.

## Scaling Considerations

For high-traffic deployments, consider:

1. Using a load balancer to distribute traffic across multiple application instances.

2. Implementing a CDN for static assets.

3. Moving file storage to a dedicated service like AWS S3.

4. Setting up database replication for read scaling.

5. Implementing caching using Redis or Memcached.

## Troubleshooting

If you encounter issues during deployment:

1. Check the application logs:
```bash
tail -f logs/app.log
```

2. Verify database connectivity:
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

3. Ensure the Claude API key is valid:
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-opus-20240229","max_tokens":10,"messages":[{"role":"user","content":"Hello"}]}'
```

4. Check disk space:
```bash
df -h
```

5. Verify file permissions:
```bash
ls -la storage/
```

For additional support, please contact support@simetrik.com.

---

© 2025 Simetrik. All rights reserved.
