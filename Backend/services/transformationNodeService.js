/**
 * Service for handling transformation node operations
 */
const TransformationNode = require('../models/TransformationNode');
const fileService = require('./fileService');
const claudeService = require('./claudeService');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Transformation service for document transformation
 */
class TransformationNodeService {
  /**
   * Create a new transformation node
   * 
   * @param {Object} options - Node configuration options
   * @param {string} options.name - Name of the node
   * @param {string} options.instruction - Instructions for Claude AI
   * @param {string} options.templateId - ID of the template document
   * @param {string} options.model - Claude model to use
   * @param {number} options.maxTokens - Maximum tokens for Claude response
   * @returns {Promise<Object>} - Created transformation node
   */
  async createNode(options) {
    try {
      // Create new transformation node
      const node = new TransformationNode(options);
      
      // Validate node configuration
      const validation = node.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid node configuration: ${validation.errors.join(', ')}`
        };
      }
      
      // Verify template document exists
      try {
        const templateDoc = await fileService.getFile(node.templateId);
        if (!templateDoc) {
          return {
            success: false,
            error: `Template document with ID ${node.templateId} not found`
          };
        }
        
        // Validate template is PDF
        if (templateDoc.metadata.mimeType !== 'application/pdf') {
          return {
            success: false,
            error: 'Template document must be a PDF file'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `Error verifying template document: ${error.message}`
        };
      }
      
      return {
        success: true,
        node: node.toJSON()
      };
    } catch (error) {
      logger.error('Error creating transformation node:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while creating the transformation node'
      };
    }
  }
  
  /**
   * Trigger transformation node with input documents
   * 
   * @param {Object} node - Transformation node
   * @param {Array<string>} sourceDocIds - Array of source document IDs
   * @returns {Promise<Object>} - Result of the transformation process
   */
  async triggerNode(node, sourceDocIds) {
    try {
      // Create TransformationNode instance if plain object is provided
      const transformationNode = node instanceof TransformationNode 
        ? node 
        : TransformationNode.fromJSON(node);
      
      // Validate input documents
      if (!sourceDocIds || !Array.isArray(sourceDocIds) || sourceDocIds.length === 0) {
        return {
          success: false,
          error: 'At least one source document is required'
        };
      }
      
      // Set node to processing state
      transformationNode.setProcessing();
      transformationNode.setInputDocuments(sourceDocIds);
      
      // Get source documents content
      const sourceDocs = await Promise.all(
        sourceDocIds.map(async (docId) => {
          try {
            return await fileService.getFile(docId);
          } catch (error) {
            logger.error(`Error fetching document ${docId}:`, error);
            return null;
          }
        })
      );
      
      // Check if any required documents are missing
      const missingDocs = sourceDocs
        .map((doc, index) => doc ? null : `sourceDoc${index + 1}`)
        .filter(Boolean);
      
      if (missingDocs.length > 0) {
        transformationNode.setError(`Required documents not found: ${missingDocs.join(', ')}`);
        return {
          success: false,
          error: `Required documents not found: ${missingDocs.join(', ')}`,
          node: transformationNode.toJSON()
        };
      }
      
      // Get template document
      const templateDoc = await fileService.getFile(transformationNode.templateId);
      if (!templateDoc) {
        transformationNode.setError(`Template document with ID ${transformationNode.templateId} not found`);
        return {
          success: false,
          error: `Template document with ID ${transformationNode.templateId} not found`,
          node: transformationNode.toJSON()
        };
      }
      
      // Create transformations folder if it doesn't exist
      await this.createTransformationsFolder();
      
      // Prepare prompt for Claude
      const sourceDocsContent = sourceDocs.map((doc, index) => `
DOCUMENT ${index + 1}:
${doc.content}
`).join('\n');

      const prompt = `
I need you to transform ${sourceDocs.length} document${sourceDocs.length > 1 ? 's' : ''} into a new document that follows the format of a template.

${sourceDocsContent}

TEMPLATE STRUCTURE (PDF):
The template is a PDF document with the following structure and sections:
${templateDoc.metadata ? templateDoc.metadata.description || 'PDF Template' : 'PDF Template'}

INSTRUCTION:
${transformationNode.instruction}

Please provide the transformed content that follows the template format while incorporating relevant information from the source document${sourceDocs.length > 1 ? 's' : ''}.
`;
      
      // Call Claude API
      const claudeResponse = await claudeService.sendMessage(
        prompt,
        transformationNode.model,
        transformationNode.maxTokens
      );
      
      if (!claudeResponse.success) {
        const errorMessage = claudeResponse.error || 'Failed to process transformation with Claude AI';
        transformationNode.setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          node: transformationNode.toJSON()
        };
      }
      
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `transformed_document_${timestamp}.txt`;
      const outputPath = path.join('documents', 'transformations', outputFilename);
      
      // Save the transformed content
      try {
        const savedFile = await fileService.saveFile(
          outputPath,
          claudeResponse.message,
          'text/plain',
          'system'
        );
        
        // Update node with output document
        transformationNode.setOutputDocument(savedFile.id);
        
        return {
          success: true,
          message: 'Transformation completed successfully',
          data: {
            transformedDocument: savedFile.metadata,
            model: transformationNode.model
          },
          node: transformationNode.toJSON()
        };
      } catch (saveError) {
        const errorMessage = `Failed to save transformed document: ${saveError.message}`;
        transformationNode.setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          node: transformationNode.toJSON()
        };
      }
    } catch (error) {
      logger.error('Error in transformation service:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while processing your transformation request'
      };
    }
  }
  
  /**
   * Create transformations folder if it doesn't exist
   * 
   * @returns {Promise<void>}
   */
  async createTransformationsFolder() {
    try {
      const transformationsFolder = '/transformations';
      await fileService.createFolderIfNotExists(transformationsFolder);
      logger.info('Transformations folder created or already exists');
    } catch (error) {
      logger.error('Error creating transformations folder:', error);
      throw new Error('Failed to create transformations folder');
    }
  }
  
  /**
   * Get available Claude models for transformation
   * 
   * @returns {Array} - List of available Claude models
   */
  getTransformationModels() {
    return claudeService.getAvailableModels();
  }
}

module.exports = new TransformationNodeService();
