const request = require('supertest');
const app = require('../index');
const comparisonNodeService = require('../utils/comparisonNodeService');
const { Node, Document } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  Node: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Document: {
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

// Mock comparison node service
jest.mock('../utils/comparisonNodeService', () => ({
  executeComparison: jest.fn(),
  validateComparisonConfig: jest.fn()
}));

// Mock Claude service
jest.mock('../utils/claudeService', () => ({
  compareDocuments: jest.fn()
}));

describe('Comparison Node API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/nodes/comparison', () => {
    it('should create a new comparison node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Comparison', 
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' }
      };
      
      comparisonNodeService.validateComparisonConfig.mockReturnValue({ valid: true });
      Node.create.mockResolvedValue(mockNode);
      
      const response = await request(app)
        .post('/api/nodes/comparison')
        .send({
          name: 'Test Comparison',
          workflowId: '1',
          config: { instruction: 'Compare these documents' }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.node).toEqual(mockNode);
      expect(Node.create).toHaveBeenCalledWith({
        name: 'Test Comparison',
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' }
      });
    });
    
    it('should validate node configuration', async () => {
      comparisonNodeService.validateComparisonConfig.mockReturnValue({ 
        valid: false, 
        errors: ['Instruction is required'] 
      });
      
      const response = await request(app)
        .post('/api/nodes/comparison')
        .send({
          name: 'Test Comparison',
          workflowId: '1',
          config: {}
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
      expect(response.body.errors).toContain('Instruction is required');
    });
  });
  
  describe('PUT /api/nodes/comparison/:id', () => {
    it('should update a comparison node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Comparison', 
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' },
        update: jest.fn().mockResolvedValue(true)
      };
      
      comparisonNodeService.validateComparisonConfig.mockReturnValue({ valid: true });
      Node.findByPk.mockResolvedValue(mockNode);
      
      const response = await request(app)
        .put('/api/nodes/comparison/1')
        .send({
          name: 'Updated Comparison',
          config: { instruction: 'Updated instruction' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockNode.update).toHaveBeenCalledWith({
        name: 'Updated Comparison',
        config: { instruction: 'Updated instruction' }
      });
    });
    
    it('should return 404 if node not found', async () => {
      Node.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/nodes/comparison/999')
        .send({
          name: 'Updated Comparison',
          config: { instruction: 'Updated instruction' }
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('POST /api/nodes/comparison/:id/execute', () => {
    it('should execute a comparison node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Comparison', 
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' }
      };
      
      const mockResult = {
        success: true,
        outputDocuments: ['/path/to/comparison_result'],
        comparisonDetails: {
          document1: 'Document 1',
          document2: 'Document 2',
          instruction: 'Compare these documents'
        }
      };
      
      Node.findByPk.mockResolvedValue(mockNode);
      comparisonNodeService.executeComparison.mockResolvedValue(mockResult);
      
      const response = await request(app)
        .post('/api/nodes/comparison/1/execute')
        .send({
          inputDocuments: ['/path/to/doc1', '/path/to/doc2']
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toEqual(mockResult);
      expect(comparisonNodeService.executeComparison).toHaveBeenCalledWith(
        '1',
        'Test Comparison',
        ['/path/to/doc1', '/path/to/doc2'],
        'Compare these documents'
      );
    });
    
    it('should return 404 if node not found', async () => {
      Node.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/nodes/comparison/999/execute')
        .send({
          inputDocuments: ['/path/to/doc1', '/path/to/doc2']
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
    
    it('should handle execution errors', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Comparison', 
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' }
      };
      
      Node.findByPk.mockResolvedValue(mockNode);
      comparisonNodeService.executeComparison.mockResolvedValue({
        success: false,
        error: 'Execution failed'
      });
      
      const response = await request(app)
        .post('/api/nodes/comparison/1/execute')
        .send({
          inputDocuments: ['/path/to/doc1', '/path/to/doc2']
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Execution failed');
    });
    
    it('should validate input documents count', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Comparison', 
        type: 'comparison',
        workflowId: '1',
        config: { instruction: 'Compare these documents' }
      };
      
      Node.findByPk.mockResolvedValue(mockNode);
      
      const response = await request(app)
        .post('/api/nodes/comparison/1/execute')
        .send({
          inputDocuments: ['/path/to/doc1'] // Only one document, should be two
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });
});
