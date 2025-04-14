# Deployment Guide for Simetrik AI Documents

This document provides instructions for deploying the Simetrik AI Documents platform.

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- AWS account with S3 bucket configured
- Claude API key

## Environment Setup

1. Clone the repository
2. Create `.env` files for both frontend and backend based on the provided examples
3. Install dependencies for both frontend and backend

## Backend Deployment

### Option 1: Deploy to AWS Elastic Beanstalk

1. Install the EB CLI: `pip install awsebcli`
2. Initialize EB: `eb init`
3. Create an environment: `eb create`
4. Deploy: `eb deploy`

### Option 2: Deploy to a VPS

1. Set up a VPS with Ubuntu 20.04+
2. Install Node.js, npm, and PM2
3. Clone the repository
4. Install dependencies: `cd backend && npm install --production`
5. Start the server: `pm2 start npm --name "simetrik-api" -- start`

## Frontend Deployment

### Option 1: Deploy to AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Output directory: `frontend/build`
3. Configure environment variables

### Option 2: Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `cd frontend && vercel`

## Database Setup

1. Create a PostgreSQL database
2. Run the migration scripts: `cd backend && npm run migrate`
3. Seed the database (optional): `cd backend && npm run seed`

## S3 Bucket Configuration

1. Create an S3 bucket for document storage
2. Configure CORS to allow access from your frontend domain
3. Set up IAM user with appropriate permissions
4. Update the backend `.env` file with S3 credentials

## Claude API Configuration

1. Obtain a Claude API key
2. Add the API key to the backend `.env` file

## Monitoring and Maintenance

1. Set up CloudWatch for AWS deployments
2. Configure logging with Winston
3. Set up regular database backups
4. Implement a CI/CD pipeline for automated deployments

## Security Considerations

1. Ensure all API endpoints are properly secured
2. Implement rate limiting
3. Use HTTPS for all communications
4. Regularly update dependencies
5. Perform security audits
