const claudeService = require('../utils/claudeService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Claude Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with provided config', () => {
      const config = {
        apiKey: 'test-api-key',
        model: 'test-model',
        baseUrl: 'https://test-url.com'
      };
      
      claudeService.initialize(config);
      
      expect(claudeService.apiKey).toBe('test-api-key');
      expect(claudeService.model).toBe('test-model');
      expect(claudeService.baseUrl).toBe('https://test-url.com');
    });
    
    it('should use default values when not provided', () => {
      const originalApiKey = claudeService.apiKey;
      const originalModel = claudeService.model;
      const originalBaseUrl = claudeService.baseUrl;
      
      claudeService.initialize({});
      
      expect(claudeService.apiKey).toBe(originalApiKey);
      expect(claudeService.model).toBe(originalModel);
      expect(claudeService.baseUrl).toBe(originalBaseUrl);
    });
  });

  describe('getHeaders', () => {
    it('should return correct headers', () => {
      claudeService.apiKey = 'test-api-key';
      
      const headers = claudeService.getHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'x-api-key': 'test-api-key',
        'anthropic-version': '2023-06-01'
      });
    });
  });

  describe('processDocument', () => {
    it('should process document successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Processed content' }],
          usage: { input_tokens: 100, output_tokens: 50 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.processDocument('Document content', 'Process this document');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('Processed content');
      expect(result.usage).toEqual({ input_tokens: 100, output_tokens: 50 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          messages: [expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Document content')
          })]
        }),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });
    
    it('should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      
      const result = await claudeService.processDocument('Document content', 'Process this document');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('compareDocuments', () => {
    it('should compare documents successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Comparison results' }],
          usage: { input_tokens: 200, output_tokens: 100 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.compareDocuments(
        'Document 1 content', 
        'Document 2 content', 
        'Compare these documents'
      );
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('Comparison results');
      expect(result.usage).toEqual({ input_tokens: 200, output_tokens: 100 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          messages: [expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Document 1')
          })]
        }),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });
    
    it('should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      
      const result = await claudeService.compareDocuments(
        'Document 1 content', 
        'Document 2 content', 
        'Compare these documents'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('generateTransformationTemplate', () => {
    it('should generate template successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Generated template' }],
          usage: { input_tokens: 150, output_tokens: 75 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.generateTransformationTemplate(
        'Example input', 
        'Example output'
      );
      
      expect(result.success).toBe(true);
      expect(result.template).toBe('Generated template');
      expect(result.usage).toEqual({ input_tokens: 150, output_tokens: 75 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          messages: [expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('transformation template')
          })]
        }),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });
    
    it('should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      
      const result = await claudeService.generateTransformationTemplate(
        'Example input', 
        'Example output'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('extractStructuredData', () => {
    it('should extract structured data successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: '```json\n{"key": "value"}\n```' }],
          usage: { input_tokens: 120, output_tokens: 60 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.extractStructuredData(
        'Document content', 
        '{"type": "object", "properties": {"key": {"type": "string"}}}'
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.usage).toEqual({ input_tokens: 120, output_tokens: 60 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          messages: [expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Extract structured data')
          })]
        }),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });
    
    it('should handle non-JSON responses', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Not a JSON response' }],
          usage: { input_tokens: 120, output_tokens: 60 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.extractStructuredData(
        'Document content', 
        '{"type": "object"}'
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ rawResponse: 'Not a JSON response' });
    });
    
    it('should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      
      const result = await claudeService.extractStructuredData(
        'Document content', 
        '{"type": "object"}'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Generated summary' }],
          usage: { input_tokens: 130, output_tokens: 65 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.generateSummary(
        'Document content', 
        { maxLength: 'short', focus: 'financial' }
      );
      
      expect(result.success).toBe(true);
      expect(result.summary).toBe('Generated summary');
      expect(result.usage).toEqual({ input_tokens: 130, output_tokens: 65 });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          messages: [expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Please provide a brief summary')
          })]
        }),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });
    
    it('should use default options when not provided', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Generated summary' }],
          usage: { input_tokens: 130, output_tokens: 65 }
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await claudeService.generateSummary('Document content');
      
      expect(result.success).toBe(true);
      expect(result.summary).toBe('Generated summary');
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [expect.objectContaining({
            content: expect.stringContaining('Please provide a concise summary')
          })]
        }),
        expect.any(Object)
      );
    });
    
    it('should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      
      const result = await claudeService.generateSummary('Document content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });
});
