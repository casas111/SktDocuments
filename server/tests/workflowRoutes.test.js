const request = require('supertest');
const app = require('../index');
const { Workflow, Node, Edge } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  Workflow: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Node: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Edge: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock workflow service
jest.mock('../utils/workflowService', () => ({
  executeWorkflow: jest.fn().mockResolvedValue({ 
    success: true, 
    results: { outputDocuments: ['/path/to/output'] } 
  })
}));

describe('Workflow API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/workflows', () => {
    it('should return all workflows', async () => {
      const mockWorkflows = [
        { id: '1', name: 'Workflow 1', description: 'Description 1', status: 'active' },
        { id: '2', name: 'Workflow 2', description: 'Description 2', status: 'draft' }
      ];
      
      Workflow.findAll.mockResolvedValue(mockWorkflows);
      
      const response = await request(app).get('/api/workflows');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.workflows).toHaveLength(2);
      expect(Workflow.findAll).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      Workflow.findAll.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/api/workflows');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('GET /api/workflows/:id', () => {
    it('should return a workflow by ID', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'Workflow 1', 
        description: 'Description 1', 
        status: 'active' 
      };
      
      Workflow.findByPk.mockResolvedValue(mockWorkflow);
      
      const response = await request(app).get('/api/workflows/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.workflow).toEqual(mockWorkflow);
      expect(Workflow.findByPk).toHaveBeenCalledWith('1');
    });
    
    it('should return 404 if workflow not found', async () => {
      Workflow.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/workflows/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('POST /api/workflows', () => {
    it('should create a new workflow', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'New Workflow', 
        description: 'New Description', 
        status: 'draft' 
      };
      
      Workflow.create.mockResolvedValue(mockWorkflow);
      
      const response = await request(app)
        .post('/api/workflows')
        .send({ name: 'New Workflow', description: 'New Description' });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.workflow).toEqual(mockWorkflow);
      expect(Workflow.create).toHaveBeenCalledWith({
        name: 'New Workflow',
        description: 'New Description',
        status: 'draft'
      });
    });
    
    it('should handle missing name', async () => {
      const response = await request(app)
        .post('/api/workflows')
        .send({ description: 'New Description' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('PUT /api/workflows/:id', () => {
    it('should update a workflow', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'Updated Workflow', 
        description: 'Updated Description', 
        status: 'active',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Workflow.findByPk.mockResolvedValue(mockWorkflow);
      
      const response = await request(app)
        .put('/api/workflows/1')
        .send({ name: 'Updated Workflow', description: 'Updated Description', status: 'active' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockWorkflow.update).toHaveBeenCalled();
    });
    
    it('should return 404 if workflow not found', async () => {
      Workflow.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/workflows/999')
        .send({ name: 'Updated Workflow' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('DELETE /api/workflows/:id', () => {
    it('should delete a workflow', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'Workflow 1', 
        description: 'Description 1', 
        status: 'active',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Workflow.findByPk.mockResolvedValue(mockWorkflow);
      
      const response = await request(app).delete('/api/workflows/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockWorkflow.destroy).toHaveBeenCalled();
    });
    
    it('should return 404 if workflow not found', async () => {
      Workflow.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/workflows/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('POST /api/workflows/:id/execute', () => {
    it('should execute a workflow', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'Workflow 1', 
        description: 'Description 1', 
        status: 'active'
      };
      
      Workflow.findByPk.mockResolvedValue(mockWorkflow);
      
      const response = await request(app)
        .post('/api/workflows/1/execute')
        .send({ inputDocuments: ['/path/to/input1', '/path/to/input2'] });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toEqual({ outputDocuments: ['/path/to/output'] });
    });
    
    it('should return 404 if workflow not found', async () => {
      Workflow.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/workflows/999/execute')
        .send({ inputDocuments: ['/path/to/input'] });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
    
    it('should handle missing input documents', async () => {
      const mockWorkflow = { 
        id: '1', 
        name: 'Workflow 1', 
        description: 'Description 1', 
        status: 'active'
      };
      
      Workflow.findByPk.mockResolvedValue(mockWorkflow);
      
      const response = await request(app)
        .post('/api/workflows/1/execute')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });
});
