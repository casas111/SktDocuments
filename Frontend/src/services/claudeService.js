import axios from 'axios';

/**
 * Service for interacting with the Claude AI backend API
 */
class ClaudeService {
  /**
   * Base URL for API requests
   * @type {string}
   */
  baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      const response = await axios.post(`${this.baseUrl}/api/claude/message`, {
        prompt,
        model,
        maxTokens,
        messages
      });

      return response.data;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error(error.response?.data?.error || 'Error communicating with Claude AI');
    }
  }

  /**
   * Get available Claude models
   * 
   * @returns {Promise<Array>} - List of available Claude models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/claude/models`);
      return response.data.models;
    } catch (error) {
      console.error('Error getting Claude models:', error);
      throw new Error(error.response?.data?.error || 'Error retrieving Claude models');
    }
  }
}

export default new ClaudeService();
