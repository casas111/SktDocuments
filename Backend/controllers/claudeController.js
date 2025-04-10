/**
 * Claude AI Controller
 * Handles HTTP requests related to Claude AI functionality
 */

const claudeService = require('../services/claudeService');

/**
 * Controller for Claude AI endpoints
 */
class ClaudeController {
  /**
   * Send a message to Claude and get a response
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendMessage(req, res) {
    try {
      const { prompt, model, maxTokens, messages } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      const response = await claudeService.sendMessage(
        prompt,
        model || 'claude-3-haiku-20240307',
        maxTokens || 1000,
        messages || []
      );

      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: response.error
        });
      }

      return res.status(200).json({
        success: true,
        message: response.message,
        model: model || 'claude-3-haiku-20240307'
      });
    } catch (error) {
      console.error('Error in Claude controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while processing your request'
      });
    }
  }

  /**
   * Get available Claude models
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getModels(req, res) {
    try {
      const models = claudeService.getAvailableModels();
      
      return res.status(200).json({
        success: true,
        models: models
      });
    } catch (error) {
      console.error('Error getting Claude models:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while retrieving models'
      });
    }
  }
}

module.exports = new ClaudeController();
