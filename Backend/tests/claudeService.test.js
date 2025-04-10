const claudeService = require('../services/claudeService');

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-api-key';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => {
      return {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ text: 'This is a test response from Claude' }]
          })
        }
      };
    })
  };
});

describe('Claude Service', () => {
  test('sendMessage should return a successful response', async () => {
    const result = await claudeService.sendMessage('Test prompt');
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('message', 'This is a test response from Claude');
  });
  
  test('getAvailableModels should return a list of models', () => {
    const models = claudeService.getAvailableModels();
    
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty('id');
    expect(models[0]).toHaveProperty('name');
  });
});
