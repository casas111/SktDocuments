const request = require('supertest');
const app = require('../index');
const { Document, Folder, Workflow, Node, Edge } = require('../models');
const fileStorageService = require('../utils/fileStorageService');
const workflowService = require('../utils/workflowService');
const transformationNodeService = require('../utils/transformationNodeService');
const comparisonNodeService = require('../utils/comparisonNodeService');

// This is an integration test that tests the complete workflow execution process
describe('Workflow Execution Integration Tests', () => {
  beforeAll(async () => {
    // Set up test database or mock as needed
    // For a real integration test, you might use a test database
    // Here we'll use mocks for simplicity
    jest.mock('../models');
    jest.mock('../utils/fileStorageService');
    jest.mock('../utils/workflowService');
    jest.mock('../utils/transformationNodeService');
    jest.mock('../utils/comparisonNodeService');
  });

  afterAll(async () => {
    // Clean up test database or mocks
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Complete workflow execution with transformation and comparison nodes', async () => {
    // 1. Create test documents
    const testDocument1 = {
      id: 'doc1',
      name: 'Financial Report Q1.pdf',
      type: 'pdf',
      path: '/path/to/financial_report_q1.pdf',
      content: 'Q1 financial data with revenue of $1M and expenses of $750K'
    };

    const testDocument2 = {
      id: 'doc2',
      name: 'Financial Report Q2.pdf',
      type: 'pdf',
      path: '/path/to/financial_report_q2.pdf',
      content: 'Q2 financial data with revenue of $1.2M and expenses of $800K'
    };

    // Mock document retrieval
    Document.findByPk = jest.fn()
      .mockImplementation((id) => {
        if (id === 'doc1') return Promise.resolve(testDocument1);
        if (id === 'doc2') return Promise.resolve(testDocument2);
        return Promise.resolve(null);
      });

    // Mock file storage service
    fileStorageService.readFile = jest.fn()
      .mockImplementation((path) => {
        if (path === '/path/to/financial_report_q1.pdf') {
          return Promise.resolve({
            success: true,
            content: testDocument1.content
          });
        }
        if (path === '/path/to/financial_report_q2.pdf') {
          return Promise.resolve({
            success: true,
            content: testDocument2.content
          });
        }
        return Promise.resolve({
          success: false,
          error: 'File not found'
        });
      });

    // 2. Create test workflow
    const testWorkflow = {
      id: 'wf1',
      name: 'Financial Report Comparison',
      status: 'active'
    };

    // Mock workflow retrieval
    Workflow.findByPk = jest.fn().mockResolvedValue(testWorkflow);

    // 3. Create test nodes
    const transformationNode = {
      id: 'node1',
      name: 'Extract Financial Data',
      type: 'transformation',
      workflowId: 'wf1',
      config: {
        template: 'Extract revenue and expenses as JSON'
      }
    };

    const comparisonNode = {
      id: 'node2',
      name: 'Compare Financial Data',
      type: 'comparison',
      workflowId: 'wf1',
      config: {
        instruction: 'Compare revenue and expenses between quarters'
      }
    };

    // Mock node retrieval
    Node.findAll = jest.fn().mockResolvedValue([transformationNode, comparisonNode]);

    // 4. Create test edges
    const edge = {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      workflowId: 'wf1'
    };

    // Mock edge retrieval
    Edge.findAll = jest.fn().mockResolvedValue([edge]);

    // 5. Mock transformation node execution
    const transformedDoc1 = {
      id: 'transformed_doc1',
      name: 'Transformed_Financial_Report_Q1.json',
      type: 'json',
      content: '{"revenue": "$1M", "expenses": "$750K"}',
      url: '/api/documents/transformed_doc1'
    };

    const transformedDoc2 = {
      id: 'transformed_doc2',
      name: 'Transformed_Financial_Report_Q2.json',
      type: 'json',
      content: '{"revenue": "$1.2M", "expenses": "$800K"}',
      url: '/api/documents/transformed_doc2'
    };

    Document.create = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(transformedDoc1))
      .mockImplementationOnce(() => Promise.resolve(transformedDoc2))
      .mockImplementationOnce(() => Promise.resolve({
        id: 'comparison_result',
        name: 'Comparison_Result.txt',
        type: 'txt',
        content: 'Revenue increased by 20% and expenses increased by 6.7%',
        url: '/api/documents/comparison_result'
      }));

    transformationNodeService.executeTransformation = jest.fn()
      .mockResolvedValue({
        success: true,
        outputDocuments: ['/api/documents/transformed_doc1', '/api/documents/transformed_doc2'],
        transformationDetails: {
          inputCount: 2,
          outputCount: 2,
          template: 'Extract revenue and expenses as JSON'
        }
      });

    // 6. Mock comparison node execution
    comparisonNodeService.executeComparison = jest.fn()
      .mockResolvedValue({
        success: true,
        outputDocuments: ['/api/documents/comparison_result'],
        comparisonDetails: {
          document1: 'Transformed_Financial_Report_Q1.json',
          document2: 'Transformed_Financial_Report_Q2.json',
          instruction: 'Compare revenue and expenses between quarters'
        }
      });

    // 7. Mock workflow service
    workflowService.executeWorkflow = jest.fn()
      .mockImplementation(async (workflowId, inputDocuments) => {
        // This should simulate the actual workflow execution logic
        // First execute transformation node
        const transformationResult = await transformationNodeService.executeTransformation(
          'node1',
          'Extract Financial Data',
          inputDocuments,
          { template: 'Extract revenue and expenses as JSON' }
        );

        if (!transformationResult.success) {
          return { success: false, error: transformationResult.error };
        }

        // Then execute comparison node with transformation outputs
        const comparisonResult = await comparisonNodeService.executeComparison(
          'node2',
          'Compare Financial Data',
          transformationResult.outputDocuments,
          'Compare revenue and expenses between quarters'
        );

        if (!comparisonResult.success) {
          return { success: false, error: comparisonResult.error };
        }

        // Return final results
        return {
          success: true,
          results: {
            outputDocuments: comparisonResult.outputDocuments,
            executionPath: ['node1', 'node2'],
            nodeResults: {
              node1: transformationResult,
              node2: comparisonResult
            }
          }
        };
      });

    // 8. Execute the workflow
    const response = await request(app)
      .post('/api/workflows/wf1/execute')
      .send({
        inputDocuments: ['/api/documents/doc1', '/api/documents/doc2']
      });

    // 9. Verify the results
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.results.outputDocuments).toEqual(['/api/documents/comparison_result']);
    expect(response.body.results.executionPath).toEqual(['node1', 'node2']);
    
    // Verify that the workflow service was called correctly
    expect(workflowService.executeWorkflow).toHaveBeenCalledWith(
      'wf1',
      ['/api/documents/doc1', '/api/documents/doc2']
    );
    
    // Verify that the transformation node service was called correctly
    expect(transformationNodeService.executeTransformation).toHaveBeenCalledWith(
      'node1',
      'Extract Financial Data',
      ['/api/documents/doc1', '/api/documents/doc2'],
      { template: 'Extract revenue and expenses as JSON' }
    );
    
    // Verify that the comparison node service was called correctly
    expect(comparisonNodeService.executeComparison).toHaveBeenCalledWith(
      'node2',
      'Compare Financial Data',
      ['/api/documents/transformed_doc1', '/api/documents/transformed_doc2'],
      'Compare revenue and expenses between quarters'
    );
  });

  test('Workflow execution handles errors gracefully', async () => {
    // Mock workflow retrieval
    Workflow.findByPk = jest.fn().mockResolvedValue({
      id: 'wf2',
      name: 'Error Test Workflow',
      status: 'active'
    });

    // Mock workflow service with error
    workflowService.executeWorkflow = jest.fn()
      .mockResolvedValue({
        success: false,
        error: 'Node execution failed: Invalid document format'
      });

    // Execute the workflow
    const response = await request(app)
      .post('/api/workflows/wf2/execute')
      .send({
        inputDocuments: ['/api/documents/invalid_doc']
      });

    // Verify the error response
    expect(response.status).toBe(500);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe('Node execution failed: Invalid document format');
  });
});
