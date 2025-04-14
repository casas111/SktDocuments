import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { executeWorkflow } from '../src/controllers/workflowExecutionController';
import Node from '../src/models/Node';
import Workflow from '../src/models/Workflow';
import Connection from '../src/models/Connection';
import Document from '../src/models/Document';
import { claudeApiClient } from '../src/services/claudeApiService';
import { uploadToS3, getFromS3 } from '../src/config/s3';

// Mock dependencies
jest.mock('../src/models/Node');
jest.mock('../src/models/Workflow');
jest.mock('../src/models/Connection');
jest.mock('../src/models/Document');
jest.mock('../src/services/claudeApiService');
jest.mock('../src/config/s3');

describe('WorkflowExecutionController', () => {
  let req: any;
  let res: any;
  let next: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request, response, and next function
    req = {
      body: {
        workflowId: 'test-workflow-id',
        documentIds: ['doc-1', 'doc-2'],
        userId: 'test-user-id'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Setup mock workflow
    const mockWorkflow = {
      id: 'test-workflow-id',
      name: 'Test Workflow',
      ownerId: 'test-user-id',
      nodes: [
        {
          id: 'node-1',
          type: 'transformation',
          name: 'Transform Node',
          config: JSON.stringify({
            instruction: 'Transform this document'
          }),
          workflow: { ownerId: 'test-user-id' }
        },
        {
          id: 'node-2',
          type: 'comparison',
          name: 'Compare Node',
          config: JSON.stringify({
            instruction: 'Compare these documents'
          }),
          workflow: { ownerId: 'test-user-id' }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'node-1',
          targetNodeId: 'node-2',
          sourceHandle: 'output',
          targetHandle: 'input'
        }
      ]
    };
    
    // Setup mock documents
    const mockDocuments = [
      {
        id: 'doc-1',
        name: 'Document 1',
        url: 'https://example.com/doc1.txt',
        ownerId: 'test-user-id'
      },
      {
        id: 'doc-2',
        name: 'Document 2',
        url: 'https://example.com/doc2.txt',
        ownerId: 'test-user-id'
      }
    ];
    
    // Mock Workflow.findOne
    (Workflow.findOne as jest.Mock).mockResolvedValue(mockWorkflow);
    
    // Mock Document.findOne
    (Document.findOne as jest.Mock).mockImplementation((options) => {
      const docId = options.where.id;
      return Promise.resolve(mockDocuments.find(doc => doc.id === docId));
    });
    
    // Mock Document.create
    (Document.create as jest.Mock).mockImplementation((data) => {
      return Promise.resolve({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    // Mock getFromS3
    (getFromS3 as jest.Mock).mockResolvedValue({
      Body: Buffer.from('Test document content')
    });
    
    // Mock uploadToS3
    (uploadToS3 as jest.Mock).mockResolvedValue('https://example.com/output.txt');
    
    // Mock claudeApiClient
    (claudeApiClient.transformDocuments as jest.Mock).mockResolvedValue('Transformed content');
    (claudeApiClient.compareDocuments as jest.Mock).mockResolvedValue('Comparison results');
  });
  
  describe('executeWorkflow', () => {
    it('should return 400 if workflowId is missing', async () => {
      // Arrange
      req.body.workflowId = undefined;
      
      // Act
      await executeWorkflow(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Workflow ID is required',
        status: 400
      }));
    });
    
    it('should return 400 if documentIds is missing or empty', async () => {
      // Arrange
      req.body.documentIds = [];
      
      // Act
      await executeWorkflow(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'At least one document ID is required',
        status: 400
      }));
    });
    
    it('should return 404 if workflow is not found', async () => {
      // Arrange
      (Workflow.findOne as jest.Mock).mockResolvedValue(null);
      
      // Act
      await executeWorkflow(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Workflow not found',
        status: 404
      }));
    });
    
    it('should execute workflow and return results', async () => {
      // Act
      await executeWorkflow(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Object)
      }));
      
      // Verify Claude API was called
      expect(claudeApiClient.transformDocuments).toHaveBeenCalled();
      
      // Verify document was created
      expect(Document.create).toHaveBeenCalled();
    });
    
    it('should handle errors during execution', async () => {
      // Arrange
      (claudeApiClient.transformDocuments as jest.Mock).mockRejectedValue(new Error('API error'));
      
      // Act
      await executeWorkflow(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
