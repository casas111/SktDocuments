const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../app');
const fs = require('fs-extra');
const path = require('path');
const transformationService = require('../services/transformationService');
const workflowService = require('../services/workflowService');
const claudeService = require('../services/claudeService');

describe('Integration Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    // Create a sandbox for stubs
    sandbox = sinon.createSandbox();
    
    // Stub file operations to prevent actual file writing
    sandbox.stub(fs, 'writeFile').resolves();
    sandbox.stub(fs, 'ensureDir').resolves();
  });
  
  afterEach(() => {
    // Restore all stubs
    sandbox.restore();
  });
  
  describe('Transformation Node API', () => {
    it('should create a transformation node', async () => {
      // Mock node data
      const nodeData = {
        name: 'Test Transformation Node',
        instruction: 'Test instruction',
        outputTemplate: 'Test template',
        model: 'claude-3-haiku-20240307'
      };
      
      // Make API request
      const response = await request(app)
        .post('/api/transformation/node')
        .send(nodeData)
        .expect(201);
      
      // Assertions
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('object');
      expect(response.body.data.name).to.equal(nodeData.name);
      expect(response.body.data.instruction).to.equal(nodeData.instruction);
      expect(response.body.data.outputTemplate).to.equal(nodeData.outputTemplate);
      expect(response.body.data.model).to.equal(nodeData.model);
      expect(response.body.data.id).to.be.a('string');
    });
    
    it('should return error when creating node with missing name', async () => {
      // Mock invalid node data
      const nodeData = {
        instruction: 'Test instruction',
        outputTemplate: 'Test template'
      };
      
      // Make API request
      const response = await request(app)
        .post('/api/transformation/node')
        .send(nodeData)
        .expect(400);
      
      // Assertions
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('Name is required');
    });
  });
  
  describe('Transformation Trigger API', () => {
    it('should trigger a transformation', async () => {
      // Mock node data
      const nodeData = {
        name: 'Test Transformation',
        instruction: 'Test instruction',
        templateId: 'template-123',
        model: 'claude-3-haiku-20240307'
      };
      
      // Mock source document IDs
      const sourceDocIds = ['doc-1', 'doc-2'];
      
      // Mock transformed document
      const mockTransformedDoc = {
        id: 'transformed-doc-1',
        name: 'Transformed Document',
        content: 'Transformed content'
      };
      
      // Stub transformationService.processTransformation
      sandbox.stub(transformationService, 'processTransformation').resolves({
        success: true,
        data: {
          transformedDocument: mockTransformedDoc
        }
      });
      
      // Make API request
      const response = await request(app)
        .post('/api/transformation/trigger')
        .send({
          node: nodeData,
          sourceDocIds
        })
        .expect(200);
      
      // Assertions
      expect(response.body.success).to.be.true;
      expect(response.body.data.transformedDocument).to.deep.equal(mockTransformedDoc);
      expect(transformationService.processTransformation.calledOnce).to.be.true;
    });
    
    it('should return error when triggering with invalid data', async () => {
      // Mock invalid request data
      const requestData = {
        node: {
          name: 'Test Transformation'
        },
        sourceDocIds: []
      };
      
      // Make API request
      const response = await request(app)
        .post('/api/transformation/trigger')
        .send(requestData)
        .expect(400);
      
      // Assertions
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('Source documents are required');
    });
  });
  
  describe('Workflow Execution', () => {
    it('should execute a node in a workflow', async () => {
      // Mock workflow ID and node ID
      const workflowId = 'workflow-123';
      const nodeId = 'node-1';
      
      // Mock input document IDs
      const inputDocIds = ['doc-1', 'doc-2'];
      
      // Mock process result
      const mockProcess = {
        id: 'process-1',
        workflowId,
        nodeId,
        status: 'completed',
        outputDocId: 'transformed-doc-1'
      };
      
      // Stub workflowService.executeNode
      sandbox.stub(workflowService, 'executeNode').resolves({
        success: true,
        process: mockProcess
      });
      
      // Make API request
      const response = await request(app)
        .post('/api/workflow/execute')
        .send({
          workflowId,
          nodeId,
          inputDocIds
        })
        .expect(200);
      
      // Assertions
      expect(response.body.success).to.be.true;
      expect(response.body.process).to.deep.equal(mockProcess);
      expect(workflowService.executeNode.calledWith(workflowId, nodeId, inputDocIds)).to.be.true;
    });
    
    it('should return error when executing with invalid workflow ID', async () => {
      // Mock invalid request data
      const requestData = {
        workflowId: '',
        nodeId: 'node-1',
        inputDocIds: ['doc-1']
      };
      
      // Make API request
      const response = await request(app)
        .post('/api/workflow/execute')
        .send(requestData)
        .expect(400);
      
      // Assertions
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('Workflow ID is required');
    });
  });
  
  describe('End-to-End Workflow', () => {
    it('should create, execute, and trigger downstream nodes', async () => {
      // Mock workflow data
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow description',
        nodes: [
          {
            id: 'node-1',
            type: 'transformation',
            data: {
              label: 'Transform Node 1',
              instruction: 'Test instruction 1'
            }
          },
          {
            id: 'node-2',
            type: 'transformation',
            data: {
              label: 'Transform Node 2',
              instruction: 'Test instruction 2'
            }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          }
        ]
      };
      
      // Mock created workflow
      const mockWorkflow = {
        ...workflowData,
        id: 'workflow-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Mock process results
      const mockProcess1 = {
        id: 'process-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        status: 'completed',
        outputDocId: 'transformed-doc-1'
      };
      
      const mockProcess2 = {
        id: 'process-2',
        workflowId: 'workflow-123',
        nodeId: 'node-2',
        status: 'completed',
        outputDocId: 'transformed-doc-2'
      };
      
      // Stub workflowService methods
      sandbox.stub(workflowService, 'createWorkflow').resolves({
        success: true,
        data: mockWorkflow
      });
      
      const executeNodeStub = sandbox.stub(workflowService, 'executeNode');
      executeNodeStub.withArgs('workflow-123', 'node-1', ['doc-1']).resolves({
        success: true,
        process: mockProcess1
      });
      executeNodeStub.withArgs('workflow-123', 'node-2', ['transformed-doc-1']).resolves({
        success: true,
        process: mockProcess2
      });
      
      // 1. Create workflow
      const createResponse = await request(app)
        .post('/api/workflow')
        .send(workflowData)
        .expect(201);
      
      expect(createResponse.body.success).to.be.true;
      expect(createResponse.body.workflow).to.deep.equal(mockWorkflow);
      
      // 2. Execute first node
      const executeResponse = await request(app)
        .post('/api/workflow/execute')
        .send({
          workflowId: 'workflow-123',
          nodeId: 'node-1',
          inputDocIds: ['doc-1']
        })
        .expect(200);
      
      expect(executeResponse.body.success).to.be.true;
      expect(executeResponse.body.process).to.deep.equal(mockProcess1);
      
      // 3. Verify downstream node was triggered
      expect(executeNodeStub.calledWith('workflow-123', 'node-2', ['transformed-doc-1'])).to.be.true;
    });
  });
});
