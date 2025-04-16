# Simetrik AI Documents - User Guide

## Introduction

Welcome to Simetrik AI Documents, an enterprise-grade document management system with AI capabilities designed specifically for financial institutions. This application allows you to store, organize, process, and analyze documents using advanced AI features powered by Claude.

This user guide will walk you through the main features and functionality of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Document Management](#document-management)
3. [Workflow System](#workflow-system)
4. [Node Types](#node-types)
5. [AI Integration](#ai-integration)
6. [Best Practices](#best-practices)

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- User account with appropriate permissions

### Logging In

1. Navigate to the Simetrik AI Documents application URL
2. Enter your username and password
3. Click "Sign In"

### Dashboard Overview

The dashboard provides an overview of your document management system:

- Recent documents
- Active workflows
- System statistics
- Quick access to common actions

## Document Management

### Viewing Documents

The Documents page displays all your documents and folders. You can:

- Toggle between list and grid views using the view toggle button
- Search for documents using the search bar
- Filter documents by various criteria
- Navigate through folders by clicking on them

### Uploading Documents

To upload a new document:

1. Click the "Upload" button in the Documents page
2. Select a file from your computer
3. The document will be uploaded and processed automatically

### Creating Folders

To create a new folder:

1. Click the "New Folder" button in the Documents page
2. Enter a name for the folder
3. Click "Create"

### Document Operations

For each document, you can:

- View: Click on the document to open it in the document viewer
- Rename: Use the context menu (three dots) and select "Rename"
- Copy: Use the context menu and select "Copy"
- Move: Drag and drop documents between folders
- Delete: Use the context menu and select "Delete"
- Share: Use the context menu and select "Share"
- Add Labels: Use the context menu and select "Add Label"

### Document Viewer

The document viewer allows you to:

- View document content
- Process documents with Claude AI
- View document metadata
- Add and view comments
- Download the document

## Workflow System

### Workflow List

The Workflows page displays all your workflows. You can:

- Filter workflows by status (All, Active, Draft, Inactive)
- Create new workflows
- Edit existing workflows
- Execute workflows
- Duplicate workflows
- Delete workflows

### Creating a Workflow

To create a new workflow:

1. Click the "New Workflow" button in the Workflows page
2. Enter a name and description for the workflow
3. Click "Create"
4. You will be redirected to the Workflow Editor

### Workflow Editor

The Workflow Editor allows you to:

- Add nodes by clicking the "Add Node" button
- Connect nodes by dragging from one node's output to another node's input
- Configure nodes by clicking on them
- Save the workflow using the "Save" button
- Execute the workflow using the "Run" button
- Configure workflow settings using the settings button

### Executing a Workflow

To execute a workflow:

1. Open the workflow in the Workflow Editor
2. Click the "Run" button
3. Select input documents when prompted
4. The workflow will execute and produce output documents

## Node Types

Simetrik AI Documents supports four types of nodes:

### Transformation Node

The Transformation Node processes documents using Claude AI to transform their content based on a template.

Configuration options:
- Node Name: Name of the node
- Template: Instructions for Claude on how to transform the document

### Comparison Node

The Comparison Node compares two or more documents using Claude AI and produces a comparison report.

Configuration options:
- Node Name: Name of the node
- Instructions: Instructions for Claude on how to compare the documents

### Simetrik Integration Node

The Simetrik Integration Node allows integration with other Simetrik systems.

Configuration options:
- Node Name: Name of the node
- Integration Type: Type of integration (Data Export, Data Import, API Call)
- Endpoint: API endpoint for the integration

### Communication Node

The Communication Node sends information to external systems or users.

Configuration options:
- Node Name: Name of the node
- Method: Communication method (Email, Webhook, API)
- Method-specific settings (recipients, subject, webhook URL, etc.)

## AI Integration

### Processing Documents with Claude

To process a document with Claude:

1. Open the document in the Document Viewer
2. Click the "Process with Claude" tab
3. Enter instructions for Claude
4. Click "Process Document"
5. View the results in the document viewer

### AI-Powered Transformations

The Transformation Node uses Claude to:

- Extract structured data from documents
- Reformat document content
- Summarize documents
- Translate documents
- Analyze financial data

### AI-Powered Comparisons

The Comparison Node uses Claude to:

- Identify differences between documents
- Highlight discrepancies in financial data
- Generate comparison reports
- Validate document consistency

## Best Practices

### Document Organization

- Use folders to organize documents by category, project, or department
- Use labels to tag documents for easier searching
- Keep filenames descriptive and consistent
- Archive old documents rather than deleting them

### Workflow Design

- Start with simple workflows and build complexity gradually
- Test workflows with sample documents before using in production
- Use descriptive names for nodes and workflows
- Document the purpose and expected inputs/outputs of each workflow

### AI Processing

- Provide clear, specific instructions to Claude
- For complex transformations, provide examples of desired output
- Review AI-generated content before using in critical processes
- Use the comparison node to validate AI transformations

## Support

For additional support, please contact your system administrator or the Simetrik support team.

---

© 2025 Simetrik. All rights reserved.
