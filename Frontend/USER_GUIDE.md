# Enterprise Workflow UI - User Guide

This guide provides detailed instructions on how to use the Enterprise Workflow UI application.

## Getting Started

After launching the application, you'll see the main interface with four primary tabs:
- **Workflow** - Design and manage your workflows
- **Analytics** - View statistics and insights about your workflows
- **Collaboration** - Share and collaborate on workflows with team members
- **Document Drive** - Manage documents used in your workflows

## Workflow Builder

### Creating a New Workflow

1. Navigate to the **Workflow** tab
2. The canvas will be displayed in the center of the screen
3. Use the toolbar on the left to add nodes to your workflow

### Adding Nodes

The application supports four types of nodes:

1. **Communication Nodes** (Blue)
   - **Send Mode**: 
     - Inputs: Document to be sent, Instructions, Channel
     - Outputs: Execution results
   - **Write Mode**: 
     - Inputs: Documents to be used, Instructions, Form
     - Outputs: Filled form

2. **Translation Nodes** (Green)
   - Inputs: List of documents
   - Outputs: List of translated documents

3. **Simetrik SaaS Connection Nodes** (Purple)
   - Inputs: Document, Source format
   - Outputs: Table in the source format

4. **Comparison Nodes** (Orange)
   - Inputs: List of documents A and List of documents B
   - Outputs: Flag analysis, Differences & inconsistencies

To add a node:
1. Click on the node type button in the toolbar
2. Enter a name for the node in the dialog that appears
3. Click "Add" to place the node on the canvas

### Moving Nodes

1. Click and hold on a node
2. Drag it to the desired position on the canvas
3. Release to place the node

### Connecting Nodes

1. Hover over an output handle (right side) of a source node
2. Click and hold the handle
3. Drag to an input handle (left side) of a target node
4. Release to create the connection

### Deleting Nodes

1. Select a node by clicking on it
2. Press the Delete key or click the trash icon in the node

### Working with Documents

Each node can process documents:

1. Click the arrow at the bottom of a node to expand its document section
2. Upload documents to the node's inputs:
   - Click "Upload" next to the input field
   - Select a file from your computer
   - The document will be attached to the node

3. Generate outputs:
   - Click "Generate" to simulate processing (in a real implementation, this would process the inputs)
   - Download output documents using the "Download" button

### Saving and Loading Workflows

1. To save a workflow:
   - Click the "Save" button in the toolbar
   - Enter a name for the workflow
   - Click "Save" to download the workflow as a JSON file

2. To load a workflow:
   - Click the "Load" button in the toolbar
   - Select a previously saved workflow JSON file
   - The workflow will be loaded onto the canvas

## Document Drive

### Navigating the Document Drive

The Document Drive has four main views:
- **All Documents** - View all documents in the system
- **Recent** - View recently added or modified documents
- **Starred** - View documents you've marked as favorites
- **Shared** - View documents shared with you

### Folder Navigation

1. Click on a folder to open it
2. Use the breadcrumb navigation at the top to go back to parent folders
3. Click "New Folder" to create a new folder

### Document Management

#### Uploading Documents

1. Click the "Upload" button in the top-right corner
2. Select files from your computer or drag and drop them into the upload area
3. Choose a folder, add tags, and set classification
4. Click "Upload" to complete the process

#### Viewing Documents

1. Click on a document to view its details
2. The document details dialog shows:
   - File information (size, type, creation date)
   - Classification
   - Tags
   - Access control settings
   - Version history
   - Audit log

#### Organizing Documents

1. **Starring Documents**:
   - Click the star icon on a document to mark it as a favorite
   - Starred documents appear in the "Starred" view

2. **Using Tags**:
   - Add tags to documents during upload or from the document details
   - Filter documents by tag using the filter menu

3. **Setting Classification**:
   - Set document classification (General, Confidential, Restricted, Legal, Financial)
   - Classification affects document visibility and access controls

#### Searching and Filtering

1. Use the search box to find documents by name
2. Click the filter icon to filter by:
   - Node type (Communication, Translation, Simetrik, Comparison)
   - Tags
   - Classification

3. Click the sort icon to sort documents by:
   - Name
   - Date
   - Size
   - Type

#### Downloading Documents

1. Click the download icon on a document to download it
2. For multiple documents, select them and use the "Download Selected" option

## Analytics

The Analytics tab provides insights into your workflows:

1. **Workflow Statistics**:
   - Number of nodes by type
   - Connection patterns
   - Workflow complexity metrics

2. **Document Usage**:
   - Most used document types
   - Document flow visualization
   - Processing time statistics

3. **Performance Metrics**:
   - Node execution times
   - Bottleneck identification
   - Optimization suggestions

## Collaboration

The Collaboration tab allows you to work with team members:

1. **Sharing Workflows**:
   - Share workflows with specific users or teams
   - Set permission levels (View, Edit, Admin)

2. **Comments and Feedback**:
   - Add comments to specific nodes or connections
   - Provide feedback on workflows

3. **Version History**:
   - View previous versions of workflows
   - Compare changes between versions
   - Restore previous versions

## Keyboard Shortcuts

For efficient workflow creation, use these keyboard shortcuts:

- **Ctrl+S**: Save workflow
- **Ctrl+O**: Open workflow
- **Delete**: Delete selected node
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+A**: Select all nodes
- **Ctrl+C/Ctrl+V**: Copy/Paste selected nodes
- **+/-**: Zoom in/out
- **Space+Drag**: Pan the canvas

## Best Practices

1. **Workflow Design**:
   - Keep workflows organized with clear input/output flows
   - Group related nodes together
   - Use descriptive node names

2. **Document Management**:
   - Use consistent naming conventions
   - Apply appropriate tags for easy filtering
   - Set proper classification levels for security

3. **Collaboration**:
   - Document your workflow with comments
   - Use version control for significant changes
   - Share workflows with relevant team members only

## Troubleshooting

### Common Issues

1. **Nodes won't connect**:
   - Ensure you're connecting from an output handle to an input handle
   - Check that the connection is valid between those node types

2. **Documents not appearing**:
   - Verify the document was successfully uploaded
   - Check your filter settings
   - Ensure you have permission to view the document

3. **Workflow not saving**:
   - Check your browser's storage permissions
   - Try exporting the workflow to a file instead

### Getting Help

For additional assistance:
- Check the documentation in the project repository
- Contact your system administrator
- Submit issues through your organization's support channels
