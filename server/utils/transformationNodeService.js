const claudeService = require('../utils/claudeService');
const { Document } = require('../models');
const fileStorageService = require('./fileStorageService');

class TransformationNodeService {
  constructor() {
    // Initialize any required resources
  }
  
  /**
   * Execute a transformation node using Claude API
   * @param {string} nodeId - The ID of the node
   * @param {string} nodeName - The name of the node
   * @param {Array<string>} inputDocuments - Array of document URLs
   * @param {Object} transformationConfig - Configuration for the transformation
   * @returns {Promise<Object>} The result of the transformation
   */
  async executeTransformation(nodeId, nodeName, inputDocuments, transformationConfig) {
    try {
      // Validate input
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
        return {
          success: false,
          error: 'Input documents must be a non-empty array of document URLs'
        };
      }
      
      if (!transformationConfig || !transformationConfig.template) {
        return {
          success: false,
          error: 'Transformation template is required'
        };
      }
      
      // Get document contents
      const documentContents = [];
      for (const documentUrl of inputDocuments) {
        const documentId = documentUrl.split('/').pop();
        const document = await Document.findByPk(documentId);
        
        if (!document) {
          return {
            success: false,
            error: `Document not found: ${documentUrl}`
          };
        }
        
        // Read document content
        const readResult = await fileStorageService.readFile(document.path);
        
        if (!readResult.success) {
          return {
            success: false,
            error: `Error reading document: ${readResult.error}`
          };
        }
        
        documentContents.push({
          id: document.id,
          name: document.name,
          content: readResult.content,
          type: document.type
        });
      }
      
      // Process each document with Claude API
      const transformedDocuments = [];
      for (const document of documentContents) {
        // Prepare instruction with template
        const instruction = `Transform the following document according to these instructions:\n\n${transformationConfig.template}`;
        
        // Call Claude API
        const result = await claudeService.processDocument(document.content, instruction);
        
        if (!result.success) {
          return {
            success: false,
            error: `Error transforming document ${document.name}: ${result.error}`
          };
        }
        
        // Create a new document with the transformed content
        const transformedDocument = await Document.create({
          name: `Transformed_${document.name}`,
          type: document.type,
          content: result.result,
          size: Buffer.byteLength(result.result),
          url: `/api/documents/${document.id}_transformed`
        });
        
        transformedDocuments.push(transformedDocument.url);
      }
      
      return {
        success: true,
        outputDocuments: transformedDocuments,
        transformationDetails: {
          inputCount: documentContents.length,
          outputCount: transformedDocuments.length,
          template: transformationConfig.template
        }
      };
    } catch (error) {
      console.error('Error executing transformation node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Validate transformation node configuration
   * @param {Object} config - The configuration to validate
   * @returns {Object} Validation result
   */
  validateTransformationConfig(config) {
    const errors = [];
    
    if (!config.name || config.name.trim() === '') {
      errors.push('Node name is required');
    }
    
    if (!config.template || config.template.trim() === '') {
      errors.push('Transformation template is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Generate a transformation template based on example documents
   * @param {string} exampleInput - Example input document
   * @param {string} exampleOutput - Example output document
   * @returns {Promise<Object>} Generated template
   */
  async generateTemplate(exampleInput, exampleOutput) {
    try {
      const result = await claudeService.generateTransformationTemplate(exampleInput, exampleOutput);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return {
        success: true,
        template: result.template
      };
    } catch (error) {
      console.error('Error generating transformation template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TransformationNodeService();
