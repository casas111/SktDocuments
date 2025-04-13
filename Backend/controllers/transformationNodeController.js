/**
 * Backend controller for handling transformation node functionality
 */
const transformationNodeService = require('../services/transformationNodeService');
const logger = require('../utils/logger');

/**
 * Controller for transformation node endpoints
 */
class TransformationController {
  /**
   * Create a new transformation node
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createNode(req, res) {
    try {
      const { 
        name, 
        instruction, 
        templateId,
        model = 'claude-3-haiku-20240307',
        maxTokens = 4000
      } = req.body;
      
      logger.info('Creating transformation node with:', {
        name,
        instruction: instruction ? 'present' : 'missing',
        templateId,
        model
      });
      
      // Validate required parameters
      if (!name || !instruction || !templateId) {
        const missingParams = [];
        if (!name) missingParams.push('name');
        if (!instruction) missingParams.push('instruction');
        if (!templateId) missingParams.push('templateId');
        
        logger.warn('Missing required parameters:', missingParams);
        return res.status(400).json({
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')} are required`
        });
      }
      
      // Create transformation node
      const result = await transformationNodeService.createNode({
        name,
        instruction,
        templateId,
        model,
        maxTokens
      });
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Transformation node created successfully',
        node: result.node
      });
    } catch (error) {
      logger.error('Error creating transformation node:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while creating the transformation node'
      });
    }
  }
  
  /**
   * Trigger a transformation node with input documents
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async triggerNode(req, res) {
    try {
      const { 
        node,
        sourceDocIds
      } = req.body;
      
      logger.info('Triggering transformation node:', {
        nodeId: node?.id,
        sourceDocIds: sourceDocIds ? `${sourceDocIds.length} documents` : 'missing'
      });
      
      // Validate required parameters
      if (!node || !sourceDocIds || !Array.isArray(sourceDocIds) || sourceDocIds.length === 0) {
        const missingParams = [];
        if (!node) missingParams.push('node');
        if (!sourceDocIds || !Array.isArray(sourceDocIds) || sourceDocIds.length === 0) missingParams.push('sourceDocIds');
        
        logger.warn('Missing required parameters:', missingParams);
        return res.status(400).json({
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')} are required`
        });
      }
      
      // Trigger transformation node
      const result = await transformationNodeService.triggerNode(node, sourceDocIds);
      
      if (!result.success) {
        return res.status(result.node ? 400 : 500).json({
          success: false,
          error: result.error,
          node: result.node
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Transformation completed successfully',
        data: result.data,
        node: result.node
      });
    } catch (error) {
      logger.error('Error triggering transformation node:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while triggering the transformation node'
      });
    }
  }
  
  /**
   * Get available Claude models for transformation
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransformationModels(req, res) {
    try {
      const models = transformationNodeService.getTransformationModels();
      
      return res.status(200).json({
        success: true,
        models: models
      });
    } catch (error) {
      logger.error('Error getting transformation models:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while retrieving models'
      });
    }
  }
}

module.exports = new TransformationController();
