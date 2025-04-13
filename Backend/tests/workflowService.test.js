const fs = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const workflowService = require('../services/workflowService');
const transformationService = require('../services/transformationService');

describe('Workflow Service Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    // Create a sandbox for stubs
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    // Restore all stubs
    sandbox.restore();
  });
  
  describe('executeNode', () => {
    it('should execute a transformation node and trigger downstream nodes', async () => {
      // Mock workflow data
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'transformation',
            data: {
              label: 'Transform Node 1',
              instruction: 'Test instruction',
              model: 'claude-3-haiku-20240307'
            }
          },
          {
            id: 'node-2',
            type: 'transformation',
            data: {
              label: 'Transform Node 2',
              instruction: 'Test instruction 2',
              model: 'claude-3-haiku-20240307'
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
      
      // Mock input documents
      const inputDocIds = ['doc-1', 'doc-2'];
      
      // Mock transformation result
      const mockTransformResult = {
        success: true,
        data: {
          transformedDocument: {
            id: 'transformed-doc-1',
            name: 'Transformed Document'
          }
        }
      };
      
      // Stub getWorkflowById to return mock workflow
      sandbox.stub(workflowService, 'getWorkflowById').resolves({
        success: true,
        data: mockWorkflow
      });
      
      // Stub transformationService.processTransformation
      sandbox.stub(transformationService, 'processTransformation').resolves(mockTransformResult);
      
      // Stub fs.writeFile to prevent actual file writing
      sandbox.stub(fs, 'writeFile').resolves();
      
      // Stub executeNode for the second call (downstream node)
      const executeNodeStub = sandbox.stub(workflowService, 'executeNode');
      executeNodeStub.callsFake(async (workflowId, nodeId, inputDocIds) => {
        if (nodeId === 'node-1') {
          // Call the original implementation for the first node
          return executeNodeStub.wrappedMethod(workflowId, nodeId, inputDocIds);
        } else {
          // Return a mock result for downstream nodes
          return {
            success: true,
            process: {
              id: 'process-2',
              nodeId: 'node-2',
              status: 'completed'
            }
          };
        }
      });
      
      // Execute the node
      const result = await workflowService.executeNode('workflow-123', 'node-1', inputDocIds);
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.process.nodeId).to.equal('node-1');
      expect(result.process.status).to.equal('completed');
      
      // Verify that executeNode was called for the downstream node
      expect(executeNodeStub.calledWith(
        'workflow-123',
        'node-2',
        ['transformed-doc-1']
      )).to.be.true;
    });
    
    it('should handle errors when executing a node', async () => {
      // Mock workflow data
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'transformation',
            data: {
              label: 'Transform Node 1',
              instruction: 'Test instruction',
              model: 'claude-3-haiku-20240307'
            }
          }
        ],
        edges: []
      };
      
      // Mock input documents
      const inputDocIds = ['doc-1', 'doc-2'];
      
      // Mock transformation error
      const mockTransformError = {
        success: false,
        error: 'Transformation failed'
      };
      
      // Stub getWorkflowById to return mock workflow
      sandbox.stub(workflowService, 'getWorkflowById').resolves({
        success: true,
        data: mockWorkflow
      });
      
      // Stub transformationService.processTransformation to return error
      sandbox.stub(transformationService, 'processTransformation').resolves(mockTransformError);
      
      // Stub fs.writeFile to prevent actual file writing
      sandbox.stub(fs, 'writeFile').resolves();
      
      // Execute the node
      const result = await workflowService.executeNode('workflow-123', 'node-1', inputDocIds);
      
      // Assertions
      expect(result.success).to.be.false;
      expect(result.process.status).to.equal('failed');
      expect(result.error).to.equal('Transformation failed');
    });
    
    it('should handle workflow not found error', async () => {
      // Stub getWorkflowById to return error
      sandbox.stub(workflowService, 'getWorkflowById').resolves({
        success: false,
        error: 'Workflow not found'
      });
      
      // Execute the node
      const result = await workflowService.executeNode('workflow-123', 'node-1', ['doc-1']);
      
      // Assertions
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Workflow not found');
    });
    
    it('should handle node not found error', async () => {
      // Mock workflow data without the requested node
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-2',
            type: 'transformation',
            data: {}
          }
        ],
        edges: []
      };
      
      // Stub getWorkflowById to return mock workflow
      sandbox.stub(workflowService, 'getWorkflowById').resolves({
        success: true,
        data: mockWorkflow
      });
      
      // Execute the node
      const result = await workflowService.executeNode('workflow-123', 'node-1', ['doc-1']);
      
      // Assertions
      expect(result.success).to.be.false;
      expect(result.error).to.include('not found in workflow');
    });
  });
  
  describe('triggerDownstreamNodes', () => {
    it('should trigger all downstream nodes', async () => {
      // Mock workflow with multiple downstream nodes
      const mockWorkflow = {
        id: 'workflow-123',
        nodes: [
          { id: 'node-1', type: 'transformation', data: {} },
          { id: 'node-2', type: 'transformation', data: {} },
          { id: 'node-3', type: 'transformation', data: {} }
        ],
        edges: [
          { source: 'node-1', target: 'node-2' },
          { source: 'node-1', target: 'node-3' }
        ]
      };
      
      // Mock output document IDs
      const outputDocIds = ['doc-result-1'];
      
      // Stub executeNode
      const executeNodeStub = sandbox.stub(workflowService, 'executeNode').resolves({
        success: true,
        process: { status: 'completed' }
      });
      
      // Call triggerDownstreamNodes
      await workflowService.triggerDownstreamNodes(mockWorkflow, 'node-1', outputDocIds);
      
      // Verify executeNode was called for both downstream nodes
      expect(executeNodeStub.calledWith('workflow-123', 'node-2', outputDocIds)).to.be.true;
      expect(executeNodeStub.calledWith('workflow-123', 'node-3', outputDocIds)).to.be.true;
      expect(executeNodeStub.callCount).to.equal(2);
    });
    
    it('should handle workflows with no edges', async () => {
      // Mock workflow with no edges
      const mockWorkflow = {
        id: 'workflow-123',
        nodes: [
          { id: 'node-1', type: 'transformation', data: {} }
        ],
        edges: []
      };
      
      // Stub executeNode
      const executeNodeStub = sandbox.stub(workflowService, 'executeNode');
      
      // Call triggerDownstreamNodes
      await workflowService.triggerDownstreamNodes(mockWorkflow, 'node-1', ['doc-1']);
      
      // Verify executeNode was not called
      expect(executeNodeStub.called).to.be.false;
    });
  });
});
