import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ClaudeApiClient } from '../src/services/claudeApiService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClaudeApiClient', () => {
  let claudeApiClient: ClaudeApiClient;
  
  beforeEach(() => {
    // Create a new instance for each test
    claudeApiClient = new ClaudeApiClient('test-api-key', 'test-model');
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock response
    mockedAxios.post.mockResolvedValue({
      data: {
        content: [
          {
            text: 'Test response from Claude API'
          }
        ]
      }
    });
  });
  
  describe('transformDocuments', () => {
    it('should call Claude API with correct parameters', async () => {
      // Arrange
      const documents = ['Document 1 content', 'Document 2 content'];
      const instruction = 'Transform these documents';
      const outputTemplate = 'Template for output';
      
      // Act
      await claudeApiClient.transformDocuments(documents, instruction, outputTemplate);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          model: 'test-model',
          max_tokens: 4000,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(instruction)
            })
          ])
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key'
          })
        })
      );
      
      // Verify the prompt contains documents and template
      const callArgs = mockedAxios.post.mock.calls[0];
      const prompt = callArgs[1].messages[0].content;
      expect(prompt).toContain('Document 1 content');
      expect(prompt).toContain('Document 2 content');
      expect(prompt).toContain('Transform these documents');
      expect(prompt).toContain('Template for output');
    });
    
    it('should return the response from Claude API', async () => {
      // Arrange
      const documents = ['Document content'];
      const instruction = 'Transform this document';
      
      // Act
      const result = await claudeApiClient.transformDocuments(documents, instruction);
      
      // Assert
      expect(result).toBe('Test response from Claude API');
    });
    
    it('should handle errors properly', async () => {
      // Arrange
      const documents = ['Document content'];
      const instruction = 'Transform this document';
      
      // Setup mock to throw error
      mockedAxios.post.mockRejectedValue(new Error('API error'));
      
      // Act & Assert
      await expect(claudeApiClient.transformDocuments(documents, instruction))
        .rejects.toThrow('API error');
    });
  });
  
  describe('compareDocuments', () => {
    it('should call Claude API with correct parameters', async () => {
      // Arrange
      const document1 = 'Document 1 content';
      const document2 = 'Document 2 content';
      const instruction = 'Compare these documents';
      
      // Act
      await claudeApiClient.compareDocuments(document1, document2, instruction);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Verify the prompt contains both documents
      const callArgs = mockedAxios.post.mock.calls[0];
      const prompt = callArgs[1].messages[0].content;
      expect(prompt).toContain('Document 1 content');
      expect(prompt).toContain('Document 2 content');
      expect(prompt).toContain('Compare these documents');
    });
  });
  
  describe('extractStructuredData', () => {
    it('should call Claude API with correct parameters', async () => {
      // Arrange
      const document = 'Document with structured data';
      const schema = { type: 'object', properties: { name: { type: 'string' } } };
      
      // Act
      await claudeApiClient.extractStructuredData(document, schema);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Verify the prompt contains document and schema
      const callArgs = mockedAxios.post.mock.calls[0];
      const prompt = callArgs[1].messages[0].content;
      expect(prompt).toContain('Document with structured data');
      expect(prompt).toContain(JSON.stringify(schema, null, 2));
    });
  });
  
  describe('analyzeDocument', () => {
    it('should call Claude API with correct parameters for summary analysis', async () => {
      // Arrange
      const document = 'Document to analyze';
      
      // Act
      await claudeApiClient.analyzeDocument(document, 'summary');
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Verify the prompt contains document and analysis type
      const callArgs = mockedAxios.post.mock.calls[0];
      const prompt = callArgs[1].messages[0].content;
      expect(prompt).toContain('Document to analyze');
      expect(prompt).toContain('a concise summary');
    });
    
    it('should include custom instructions for custom analysis', async () => {
      // Arrange
      const document = 'Document to analyze';
      const customInstructions = 'Find all financial figures';
      
      // Act
      await claudeApiClient.analyzeDocument(document, 'custom', customInstructions);
      
      // Assert
      // Verify the prompt contains custom instructions
      const callArgs = mockedAxios.post.mock.calls[0];
      const prompt = callArgs[1].messages[0].content;
      expect(prompt).toContain('Find all financial figures');
    });
  });
});
