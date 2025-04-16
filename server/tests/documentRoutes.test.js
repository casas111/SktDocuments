const request = require('supertest');
const app = require('../index');
const { Document, Folder } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  Document: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Folder: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock file storage service
jest.mock('../utils/fileStorageService', () => ({
  saveFile: jest.fn().mockResolvedValue({ success: true, path: '/path/to/file' }),
  readFile: jest.fn().mockResolvedValue({ success: true, content: 'file content' }),
  deleteFile: jest.fn().mockResolvedValue({ success: true })
}));

describe('Document API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/documents', () => {
    it('should return all documents', async () => {
      const mockDocuments = [
        { id: '1', name: 'Document 1', type: 'pdf', size: 1024, path: '/path/to/doc1' },
        { id: '2', name: 'Document 2', type: 'docx', size: 2048, path: '/path/to/doc2' }
      ];
      
      Document.findAll.mockResolvedValue(mockDocuments);
      
      const response = await request(app).get('/api/documents');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents).toHaveLength(2);
      expect(Document.findAll).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      Document.findAll.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/api/documents');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('GET /api/documents/:id', () => {
    it('should return a document by ID', async () => {
      const mockDocument = { id: '1', name: 'Document 1', type: 'pdf', size: 1024, path: '/path/to/doc1' };
      
      Document.findByPk.mockResolvedValue(mockDocument);
      
      const response = await request(app).get('/api/documents/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.document).toEqual(mockDocument);
      expect(Document.findByPk).toHaveBeenCalledWith('1');
    });
    
    it('should return 404 if document not found', async () => {
      Document.findByPk.mockResolvedValue(null);
      
      const response = await request(app).get('/api/documents/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('POST /api/documents', () => {
    it('should create a new document', async () => {
      const mockDocument = { 
        id: '1', 
        name: 'Document 1', 
        type: 'pdf', 
        size: 1024, 
        path: '/path/to/doc1',
        folderId: '1'
      };
      
      Document.create.mockResolvedValue(mockDocument);
      
      const response = await request(app)
        .post('/api/documents')
        .attach('file', Buffer.from('file content'), 'document.pdf')
        .field('folderId', '1');
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document).toEqual(mockDocument);
      expect(Document.create).toHaveBeenCalled();
    });
    
    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/api/documents')
        .field('folderId', '1');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('PUT /api/documents/:id', () => {
    it('should update a document', async () => {
      const mockDocument = { 
        id: '1', 
        name: 'Updated Document', 
        type: 'pdf', 
        size: 1024, 
        path: '/path/to/doc1',
        folderId: '2'
      };
      
      Document.findByPk.mockResolvedValue({ update: jest.fn().mockResolvedValue(mockDocument) });
      
      const response = await request(app)
        .put('/api/documents/1')
        .send({ name: 'Updated Document', folderId: '2' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    it('should return 404 if document not found', async () => {
      Document.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/api/documents/999')
        .send({ name: 'Updated Document' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('DELETE /api/documents/:id', () => {
    it('should delete a document', async () => {
      const mockDocument = { 
        id: '1', 
        name: 'Document 1', 
        type: 'pdf', 
        size: 1024, 
        path: '/path/to/doc1',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Document.findByPk.mockResolvedValue(mockDocument);
      
      const response = await request(app).delete('/api/documents/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockDocument.destroy).toHaveBeenCalled();
    });
    
    it('should return 404 if document not found', async () => {
      Document.findByPk.mockResolvedValue(null);
      
      const response = await request(app).delete('/api/documents/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });
  
  describe('GET /api/documents/folder/:folderId', () => {
    it('should return documents in a folder', async () => {
      const mockDocuments = [
        { id: '1', name: 'Document 1', type: 'pdf', size: 1024, path: '/path/to/doc1', folderId: '1' },
        { id: '2', name: 'Document 2', type: 'docx', size: 2048, path: '/path/to/doc2', folderId: '1' }
      ];
      
      Document.findAll.mockResolvedValue(mockDocuments);
      
      const response = await request(app).get('/api/documents/folder/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents).toHaveLength(2);
      expect(Document.findAll).toHaveBeenCalledWith({ where: { folderId: '1' } });
    });
  });
  
  describe('GET /api/documents/search/:query', () => {
    it('should search documents by query', async () => {
      const mockDocuments = [
        { id: '1', name: 'Financial Report', type: 'pdf', size: 1024, path: '/path/to/doc1' }
      ];
      
      Document.findAll.mockResolvedValue(mockDocuments);
      
      const response = await request(app).get('/api/documents/search/financial');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents).toHaveLength(1);
      expect(Document.findAll).toHaveBeenCalled();
    });
  });
});
