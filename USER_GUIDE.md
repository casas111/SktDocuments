# Simetrik Documents - User Guide

## Introduction

Welcome to Simetrik Documents! This application allows you to create powerful document transformation workflows using Claude AI. This user guide will help you understand how to use the application effectively.

## Getting Started

### Accessing the Application

To access Simetrik Documents, open your web browser and navigate to the application URL provided by your administrator.

### Main Interface

The main interface consists of several key areas:

1. **Document Drive**: Where you can view, upload, and manage your documents
2. **Workflow Editor**: Where you can create and edit document transformation workflows
3. **Navigation Menu**: For switching between different sections of the application

## Document Management

### Viewing Documents

1. Navigate to the Document Drive section
2. Browse through folders by clicking on them
3. Click on a document to view its details or preview its content

### Uploading Documents

1. In the Document Drive, click the "Upload" button
2. Select the file you want to upload from your computer
3. The document will be uploaded and appear in the current folder

### Organizing Documents

1. Create folders to organize your documents by clicking "New Folder"
2. Move documents between folders by dragging and dropping them
3. Rename documents or folders by selecting them and clicking "Rename"

## Creating Transformation Workflows

### Creating a New Workflow

1. Navigate to the Workflow Editor section
2. Click "New Workflow"
3. Enter a name and description for your workflow
4. Click "Create" to open the workflow canvas

### Adding Transformation Nodes

1. In the workflow canvas, click the "Add Node" button in the toolbar
2. Select "Transformation Node" from the options
3. Fill in the node configuration form:
   - **Name**: A descriptive name for the node
   - **Description**: Optional details about the node's purpose
   - **Instruction**: The instruction for Claude AI to follow
   - **Output Template**: Optional template for structuring the output
   - **Model**: Select the Claude model to use
   - **Template Document**: Optional document to use as a template

4. Click "Create Node" to add it to the canvas

### Connecting Nodes

1. Hover over a node to see its connection handles
2. Click and drag from the output handle of one node to the input handle of another
3. A connection will be created, allowing data to flow between nodes

### Saving Workflows

1. Click the "Save" button in the toolbar to save your workflow
2. Your workflow will be saved with all nodes and connections intact

## Running Transformations

### Manual Triggering

1. In the workflow canvas, select a transformation node
2. Click the "Trigger Manually" button on the node
3. Select the input documents you want to transform
4. Click "Trigger Transformation" to start the process
5. The transformation result will be saved as a new document

### Automatic Triggering

1. Connect nodes together as described in "Connecting Nodes"
2. When an upstream node completes its transformation, it will automatically trigger connected downstream nodes
3. The output document from the upstream node will be used as input for the downstream node

### Viewing Results

1. After a transformation completes, you can view the result in the Document Drive
2. Transformed documents are saved in the "documents/transformations" folder
3. Click on a transformed document to view its content

## Advanced Features

### Customizing Node Appearance

1. Select a node in the workflow canvas
2. Use the formatting options in the toolbar to change its appearance
3. You can change colors, add icons, or adjust the size of nodes

### Using Different Claude Models

1. When creating or editing a transformation node, select the desired model from the dropdown
2. Different models offer various capabilities and performance characteristics:
   - **Claude 3 Haiku**: Fastest, suitable for simple transformations
   - **Claude 3 Sonnet**: Balanced performance and capability
   - **Claude 3 Opus**: Most powerful, best for complex transformations

### Working with Templates

1. Create a template document with the structure you want for your outputs
2. When configuring a transformation node, select this document as the template
3. The transformation will use the template to structure its output

## Troubleshooting

### Transformation Errors

If a transformation fails:
1. Check the error message displayed on the node
2. Verify that your instruction is clear and appropriate
3. Ensure the input documents are in a format Claude can process
4. Try using a more powerful Claude model for complex transformations

### Connection Issues

If nodes aren't connecting properly:
1. Ensure you're dragging from an output handle to an input handle
2. Check that the nodes aren't already connected
3. Try repositioning the nodes for better visibility

### Performance Optimization

For better performance:
1. Use the appropriate Claude model for your needs
2. Keep instructions clear and concise
3. Split complex workflows into multiple smaller nodes
4. Process large documents in smaller chunks when possible

## Conclusion

Simetrik Documents provides a powerful way to transform your documents using AI. By following this guide, you'll be able to create effective workflows that automate your document processing tasks.

For technical support or additional questions, please contact your system administrator.
