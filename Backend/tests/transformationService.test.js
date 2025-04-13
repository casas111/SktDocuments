const { expect } = require('chai');
const sinon = require('sinon');
const transformationService = require('../services/transformationService');
const transformationNodeService = require('../services/transformationNodeService');
const claudeService = require('../services/claudeService');

describe('Transformation Service Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    // Create a sandbox for stubs
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    // Restore all stubs
    sandbox.restore();
  });
  
  describe('processTransformation', () => {
    it('should process a transformation successfully', async () => {
      // Mock node data
      const nodeData = {
        name: 'Test Transformation',
        instruction: 'Test instruction',
        templateId: 'template-123',
        model: 'claude-3-haiku-20240307'
      };
      
      // Mock source document IDs
      const sourceDocIds = ['doc-1', 'doc-2'];
      
      // Mock document service response
      const mockDocuments = [
        { id: 'doc-1', name: 'Document 1', content: 'Test content 1' },
        { id: 'doc-2', name: 'Document 2', content: 'Test content 2' },
        { id: 'template-123', name: 'Template', content: 'Template content' }
      ];
      
      // Mock Claude API response
      const mockClaudeResponse = {
        success: true,
        content: 'Transformed content'
      };
      
      // Mock transformed document
      const mockTransformedDoc = {
        id: 'transformed-doc-1',
        name: 'Transformed Document',
        content: 'Transformed content'
      };
      
      // Stub document service getDocumentById
      sandbox.stub(transformationNodeService, 'getDocumentById').callsFake((id) => {
        return mockDocuments.find(doc => doc.id === id);
      });
      
      // Stub Claude service callClaude
      sandbox.stub(claudeService, 'callClaude').resolves(mockClaudeResponse);
      
      // Stub saveTransformedDocument
      sandbox.stub(transformationNodeService, 'saveTransformedDocument').resolves(mockTransformedDoc);
      
      // Call processTransformation
      const result = await transformationService.processTransformation({
        node: nodeData,
        sourceDocIds
      });
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.data.transformedDocument).to.deep.equal(mockTransformedDoc);
      expect(claudeService.callClaude.calledOnce).to.be.true;
      expect(transformationNodeService.saveTransformedDocument.calledOnce).to.be.true;
    });
    
    it('should handle missing source documents', async () => {
      // Mock node data
      const nodeData = {
        name: 'Test Transformation',
        instruction: 'Test instruction',
        templateId: 'template-123',
        model: 'claude-3-haiku-20240307'
      };
      
      // Mock source document IDs
      const sourceDocIds = ['doc-1', 'doc-2'];
      
      // Stub document service getDocumentById to return null
      sandbox.stub(transformationNodeService, 'getDocumentById').returns(null);
      
      // Call processTransformation
      const result = await transformationService.processTransformation({
        node: nodeData,
        sourceDocIds
      });
      
      // Assertions
      expect(result.success).to.be.false;
      expect(result.error).to.include('Document not found');
    });
    
    it('should handle Claude API errors', async () => {
      // Mock node data
      const nodeData = {
        name: 'Test Transformation',
        instruction: 'Test instruction',
        templateId: 'template-123',
        model: 'claude-3-haiku-20240307'
      };
      
      // Mock source document IDs
      const sourceDocIds = ['doc-1', 'doc-2'];
      
      // Mock document service response
      const mockDocuments = [
        { id: 'doc-1', name: 'Document 1', content: 'Test content 1' },
        { id: 'doc-2', name: 'Document 2', content: 'Test content 2' },
        { id: 'template-123', name: 'Template', content: 'Template content' }
      ];
      
      // Mock Claude API error
      const mockClaudeError = {
        success: false,
        error: 'Claude API error'
      };
      
      // Stub document service getDocumentById
      sandbox.stub(transformationNodeService, 'getDocumentById').callsFake((id) => {
        return mockDocuments.find(doc => doc.id === id);
      });
      
      // Stub Claude service callClaude to return error
      sandbox.stub(claudeService, 'callClaude').resolves(mockClaudeError);
      
      // Call processTransformation
      const result = await transformationService.processTransformation({
        node: nodeData,
        sourceDocIds
      });
      
      // Assertions
      expect(result.success).to.be.false;
      expect(result.error).to.include('Claude API error');
    });
  });
});
