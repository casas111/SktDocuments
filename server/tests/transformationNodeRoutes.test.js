const request = require('supertest');
const app = require('../index');
const transformationNodeService = require('../utils/transformationNodeService');
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

// Mock transformation node service
jest.mock('../utils/transformationNodeService', () => ({
  executeTransformation: jest.fn(),
  validateTransformationConfig: jest.fn(),
  generateTemplate: jest.fn()
}));

// Mock Claude service
jest.mock('../utils/claudeService', () => ({
  processDocument: jest.fn(),
  generateTransformationTemplate: jest.fn()
}));

describe('Transformation Node API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/nodes/transformation', () => {
    it('should create a new transformation node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Transformation', 
        type: 'transformation',
        workflowId: '1',
        config: { template: 'Test template' }
      };
      
      transformationNodeService.validateTransformationConfig.mockReturnValue({ valid: true });
      Node.create.mockResolvedValue(mockNode);
      
      const response = await request(app)
        .post('/api/nodes/transformation')
        .send({
          name: 'Test Transformation',
          workflowId: '1',
          config: { template: 'Test template' }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.node).toEqual(mockNode);
      expect(Node.create).toHaveBeenCalledWith({
        name: 'Test Transformation',
        type: 'transformation',
        workflowId: '1',
        config: { template: 'Test template' }
      });
    });
    
    it('should validate node configuration', async () => {
      transformationNodeService.validateTransformationConfig.mockReturnValue({ 
        valid: false, 
        errors: ['Template is required'] 
      });
      
      const response = await request(app)
        .post('/api/nodes/transformation')
        .send({
          name: 'Test Transformation',
          workflowId: '1',
          config: {}
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
      expect(response.body.errors).toContain('Template is required');
    });
  });
  
  describe('PUT /api/nodes/transformation/:id', () => {
    it('should update a transformation node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Transformation', 
        type: 'transformation',
        workflowId: '1',
        config: { template: 'Test template' },
        update: jest.fn().mockResolvedValue(true)
      };
      
      transformationNodeService.validateTransformationConfig.mockReturnValue({ valid: true });
      Node.findByPk.mockResolvedValue(mockNode);
      
      const response = await request(app)
        .put('/api/nodes/transformation/1')
        .send({
          name: 'Updated Transformation',
          config: { template: 'Updated template' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockNode.update).toHaveBeenCalledWith({
        name: 'Updated Transformation',
        config: { template: 'Updated template' }
      });
    });
    
    it('should return 404 if node not found', async () => {
      Node.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/nodes/transformation/999')
        .send({
          name: 'Updated Transformation',
          config: { template: 'Updated template' }
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('POST /api/nodes/transformation/:id/execute', () => {
    it('should execute a transformation node', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Transformation', 
        type: 'transformation',
        workflowId: '1',
        config: { template: 'Test template' }
      };
      
      const mockResult = {
        success: true,
        outputDocuments: ['/path/to/output1', '/path/to/output2'],
        transformationDetails: {
          inputCount: 1,
          outputCount: 2,
          template: 'Test template'
        }
      };
      
      Node.findByPk.mockResolvedValue(mockNode);
      transformationNodeService.executeTransformation.mockResolvedValue(mockResult);
      
      const response = await request(app)
        .post('/api/nodes/transformation/1/execute')
        .send({
          inputDocuments: ['/path/to/input']
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toEqual(mockResult);
      expect(transformationNodeService.executeTransformation).toHaveBeenCalledWith(
        '1',
        'Test Transformation',
        ['/path/to/input'],
        { template: 'Test template' }
      );
    });
    
    it('should return 404 if node not found', async () => {
      Node.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/nodes/transformation/999/execute')
        .send({
          inputDocuments: ['/path/to/input']
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
    
    it('should handle execution errors', async () => {
      const mockNode = { 
        id: '1', 
        name: 'Test Transformation', 
        type: 'transformation',
        workflowId: '1',
        config: { template: 'Test template' }
      };
      
      Node.findByPk.mockResolvedValue(mockNode);
      transformationNodeService.executeTransformation.mockResolvedValue({
        success: false,
        error: 'Execution failed'
      });
      
      const response = await request(app)
        .post('/api/nodes/transformation/1/execute')
        .send({
          inputDocuments: ['/path/to/input']
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Execution failed');
    });
  });
  
  describe('POST /api/nodes/transformation/generate-template', () => {
    it('should generate a transformation template', async () => {
      transformationNodeService.generateTemplate.mockResolvedValue({
        success: true,
        template: 'Generated template'
      });
      
      const response = await request(app)
        .post('/api/nodes/transformation/generate-template')
        .send({
          exampleInput: 'Example input',
          exampleOutput: 'Example output'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.template).toBe('Generated template');
      expect(transformationNodeService.generateTemplate).toHaveBeenCalledWith(
        'Example input',
        'Example output'
      );
    });
    
    it('should handle generation errors', async () => {
      transformationNodeService.generateTemplate.mockResolvedValue({
        success: false,
        error: 'Generation failed'
      });
      
      const response = await request(app)
        .post('/api/nodes/transformation/generate-template')
        .send({
          exampleInput: 'Example input',
          exampleOutput: 'Example output'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Generation failed');
    });
  });
});
