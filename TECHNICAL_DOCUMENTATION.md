# Simetrik Documents - Technical Documentation

## Overview

Simetrik Documents is an application for managing document workflows with AI-powered transformations. This documentation provides a comprehensive guide to the codebase, architecture, and features of the application.

## Architecture

The application follows a client-server architecture:

- **Frontend**: React-based UI with Material-UI components
- **Backend**: Node.js server with Express
- **Storage**: File-based storage for documents and workflows

### Directory Structure

```
SktDocuments/
├── Backend/
│   ├── controllers/       # Request handlers
│   ├── models/            # Data models
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── storage/           # Document and workflow storage
│   ├── tests/             # Unit and integration tests
│   └── app.js             # Main application entry point
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── documents/     # Document management components
│   │   │   ├── transformation/ # Transformation components
│   │   │   └── workflow/       # Workflow editor components
│   │   ├── config/        # Application configuration
│   │   └── App.jsx        # Main React component
```

## Core Features

### 1. Document Management

The application provides a document management system that allows users to:
- Upload documents
- Organize documents in folders
- View document content
- Download documents

### 2. Transformation Nodes

Transformation nodes are the core feature of the application, allowing users to:
- Create transformation nodes with specific instructions
- Configure output templates
- Select Claude AI models for processing
- Trigger transformations manually with document inputs
- View transformation results

### 3. Workflow Editor

The workflow editor enables users to:
- Create visual workflows with nodes and connections
- Connect transformation nodes to create processing pipelines
- Trigger workflows manually or automatically
- Monitor workflow execution status

## Backend Components

### Models

#### TransformationNode

The `TransformationNode` model represents a node that can transform documents using Claude AI.

```javascript
// models/TransformationNode.js
class TransformationNode {
  constructor({
    name,
    instruction = '',
    outputTemplate = '',
    model = 'claude-3-haiku-20240307'
  }) {
    this.id = uuid.v4();
    this.name = name;
    this.instruction = instruction;
    this.outputTemplate = outputTemplate;
    this.model = model;
    this.createdAt = new Date().toISOString();
  }
  
  // Methods for validation, serialization, etc.
}
```

### Services

#### TransformationService

The `transformationService` handles the business logic for transformations:

```javascript
// services/transformationService.js
const transformationService = {
  // Create a new transformation node
  createNode: async (nodeData) => { ... },
  
  // Process a transformation with input documents
  processTransformation: async (node, sourceDocIds) => { ... },
  
  // Get available Claude models
  getAvailableModels: async () => { ... }
};
```

#### WorkflowService

The `workflowService` manages workflows and node execution:

```javascript
// services/workflowService.js
const workflowService = {
  // Create a new workflow
  createWorkflow: async (workflowData) => { ... },
  
  // Get a workflow by ID
  getWorkflow: async (workflowId) => { ... },
  
  // Execute a node in a workflow
  executeNode: async (workflowId, nodeId, inputDocIds) => { ... },
  
  // Trigger downstream nodes automatically
  triggerDownstreamNodes: async (workflowId, nodeId, outputDocId) => { ... }
};
```

### Controllers

#### TransformationController

The `transformationController` handles API requests for transformations:

```javascript
// controllers/transformationController.js
const transformationController = {
  // Create a new transformation node
  createNode: async (req, res) => { ... },
  
  // Trigger a transformation with input documents
  triggerTransformation: async (req, res) => { ... },
  
  // Get available Claude models
  getAvailableModels: async (req, res) => { ... }
};
```

#### WorkflowController

The `workflowController` handles API requests for workflows:

```javascript
// controllers/workflowController.js
const workflowController = {
  // Create a new workflow
  createWorkflow: async (req, res) => { ... },
  
  // Get a workflow by ID
  getWorkflow: async (req, res) => { ... },
  
  // Execute a node in a workflow
  executeNode: async (req, res) => { ... }
};
```

### Routes

The application defines the following API routes:

```javascript
// routes/transformationRoutes.js
router.post('/node', transformationController.createNode);
router.post('/trigger', transformationController.triggerTransformation);
router.get('/models', transformationController.getAvailableModels);

// routes/workflowRoutes.js
router.post('/', workflowController.createWorkflow);
router.get('/:id', workflowController.getWorkflow);
router.post('/execute', workflowController.executeNode);
```

## Frontend Components

### Transformation Components

#### EnhancedTransformationNode

The `EnhancedTransformationNode` component renders a transformation node in the workflow editor:

```jsx
// components/transformation/EnhancedTransformationNode.tsx
const EnhancedTransformationNode: React.FC<EnhancedTransformationNodeProps> = ({
  id,
  data,
  selected,
  dragging,
  targetPosition = Position.Left,
  sourcePosition = Position.Right,
  isPreview = false
}) => {
  // Component state and handlers
  
  return (
    <NodeContainer elevation={selected ? 4 : 1}>
      {/* Connection handles */}
      {/* Node content */}
      {/* Trigger dialog */}
    </NodeContainer>
  );
};
```

#### TransformationNodeForm

The `TransformationNodeForm` component provides a form for creating and editing transformation nodes:

```jsx
// components/transformation/TransformationNodeForm.tsx
const TransformationNodeForm: React.FC<TransformationNodeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Component state and handlers
  
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Form tabs */}
      {/* Configuration form */}
      {/* Node preview */}
      {/* Action buttons */}
    </Dialog>
  );
};
```

### Workflow Components

#### WorkflowCanvas

The `WorkflowCanvas` component renders the workflow editor canvas:

```jsx
// components/workflow/WorkflowCanvas.tsx
const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect
}) => {
  // Component state and handlers
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      {/* Flow controls */}
      {/* Background */}
    </ReactFlow>
  );
};
```

## API Integration

The frontend communicates with the backend through API calls:

```jsx
// Example API call to create a transformation node
const response = await axios.post(`${API_BASE_URL}/transformation/node`, nodeData);

// Example API call to trigger a transformation
const response = await axios.post(`${API_BASE_URL}/transformation/trigger`, {
  node: nodeData,
  sourceDocIds
});
```

## Testing

The application includes comprehensive tests:

### Unit Tests

Unit tests verify the functionality of individual components:

```javascript
// tests/transformationNode.test.js
describe('TransformationNode Model Tests', () => {
  describe('constructor', () => {
    it('should create a TransformationNode with valid parameters', () => {
      // Test implementation
    });
    
    // More tests...
  });
});
```

### Integration Tests

Integration tests verify the interaction between components:

```javascript
// tests/integration.test.js
describe('Integration Tests', () => {
  describe('Transformation Node API', () => {
    it('should create a transformation node', async () => {
      // Test implementation
    });
    
    // More tests...
  });
});
```

## Workflow Execution

### Manual Triggering

Users can manually trigger transformation nodes by:
1. Selecting a node in the workflow editor
2. Clicking the "Trigger Manually" button
3. Selecting input documents
4. Confirming the transformation

### Automatic Triggering

Nodes can be automatically triggered when:
1. An upstream node completes processing
2. The output document from the upstream node is passed as input
3. The downstream node is connected to the upstream node

## Error Handling

The application implements comprehensive error handling:

- Backend services return structured error responses
- Frontend components display appropriate error messages
- Failed transformations are properly logged and reported

## UI/UX Design

The application follows modern UI/UX principles:

- Clean, minimalist design with subtle gradients
- Clear visual hierarchy and consistent styling
- Responsive layout for different screen sizes
- Intuitive workflow creation and management
- Comprehensive feedback during operations

## Future Enhancements

Potential future enhancements include:

1. User authentication and authorization
2. Real-time collaboration on workflows
3. Advanced document processing capabilities
4. Integration with external document sources
5. Enhanced workflow monitoring and analytics

## Conclusion

Simetrik Documents provides a powerful platform for document transformation using AI. The application's modular architecture, comprehensive testing, and intuitive UI make it a robust solution for document workflow management.
