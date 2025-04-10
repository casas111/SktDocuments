/**
 * Claude AI Service
 * Handles interactions with the Anthropic Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Service for interacting with Claude AI
 */
class ClaudeService {
  /**
   * Send a message to Claude and get a response
   * 
   * @param {string} prompt - The user's message/prompt
   * @param {string} model - The Claude model to use (defaults to claude-3-haiku-20240307)
   * @param {number} maxTokens - Maximum tokens in the response (defaults to 1000)
   * @param {Array} messages - Optional previous messages for context
   * @returns {Promise<Object>} - Claude's response
   */
  async sendMessage(prompt, model = 'claude-3-haiku-20240307', maxTokens = 1000, messages = []) {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not found in environment variables');
      }

      // Prepare messages array for the API call
      const messageHistory = messages.length > 0 ? messages : [];
      
      // Add the current user message
      messageHistory.push({ role: 'user', content: prompt });

      // Call the Claude API
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        messages: messageHistory,
      });

      return {
        success: true,
        message: response.content[0].text,
        response: response
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return {
        success: false,
        error: error.message || 'Error communicating with Claude AI'
      };
    }
  }

  /**
   * Get available Claude models
   * 
   * @returns {Array} - List of available Claude models
   */
  getAvailableModels() {
    return [
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fastest and most compact model, ideal for quick responses and high-volume use cases',
        contextWindow: '200,000 tokens',
        costPer1MTokens: { input: '$0.25', output: '$1.25' }
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Balanced model with strong performance across tasks, ideal for most use cases',
        contextWindow: '200,000 tokens',
        costPer1MTokens: { input: '$3.00', output: '$15.00' }
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most powerful model with exceptional performance on complex tasks',
        contextWindow: '200,000 tokens',
        costPer1MTokens: { input: '$15.00', output: '$75.00' }
      }
    ];
  }
}

module.exports = new ClaudeService();
