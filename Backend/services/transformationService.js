/**
 * Service for handling file operations related to transformations
 */
const fileService = require('./fileService');
const claudeService = require('./claudeService');
const path = require('path');
const fs = require('fs').promises;

/**
 * Transformation service for document transformation
 */
class TransformationService {
  /**
   * Process document transformation using Claude AI
   * 
   * @param {string} sourceDoc1Id - ID of the first source document
   * @param {string} sourceDoc2Id - ID of the second source document
   * @param {string} templateDocId - ID of the template document (PDF)
   * @param {string} instruction - Custom instruction for Claude
   * @param {string} model - Claude model to use
   * @param {number} maxTokens - Maximum tokens for Claude response
   * @returns {Promise<Object>} - Result of the transformation process
   */
  async transformDocuments(sourceDoc1Id, sourceDoc2Id, templateDocId, instruction, model = 'claude-3-haiku-20240307', maxTokens = 4000) {
    try {
      // Get source documents content
      const sourceDoc1 = await fileService.getFileById(sourceDoc1Id);
      const sourceDoc2 = await fileService.getFileById(sourceDoc2Id);
      const templateDoc = await fileService.getFileById(templateDocId);
      
      if (!sourceDoc1 || !sourceDoc2 || !templateDoc) {
        throw new Error('One or more documents not found');
      }
      
      // Validate template is PDF
      if (templateDoc.mimeType !== 'application/pdf') {
        throw new Error('Template document must be a PDF file');
      }
      
      // Create transformations folder if it doesn't exist
      const transformationsFolder = '/transformations';
      await this.createTransformationsFolder(transformationsFolder);
      
      // Prepare prompt for Claude
      const prompt = this.buildTransformationPrompt(sourceDoc1, sourceDoc2, templateDoc, instruction);
      
      // Call Claude API
      const claudeResponse = await claudeService.sendMessage(
        prompt,
        model,
        maxTokens
      );
      
      if (!claudeResponse.success) {
        throw new Error(claudeResponse.error || 'Failed to process transformation with Claude AI');
      }
      
      // Generate output filename and save the transformed content
      const outputFile = await this.saveTransformedDocument(
        transformationsFolder, 
        claudeResponse.message
      );
      
      return {
        success: true,
        message: 'Transformation completed successfully',
        data: {
          transformedDocument: outputFile,
          model: model
        }
      };
    } catch (error) {
      console.error('Error in transformation service:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while processing your transformation request'
      };
    }
  }
  
  /**
   * Create transformations folder if it doesn't exist
   * 
   * @param {string} folderPath - Path to transformations folder
   * @returns {Promise<void>}
   * @private
   */
  async createTransformationsFolder(folderPath) {
    try {
      await fileService.createFolderIfNotExists(folderPath);
      console.log('Transformations folder created or already exists');
    } catch (error) {
      console.error('Error creating transformations folder:', error);
      throw new Error('Failed to create transformations folder');
    }
  }
  
  /**
   * Build prompt for Claude AI
   * 
   * @param {Object} sourceDoc1 - First source document
   * @param {Object} sourceDoc2 - Second source document
   * @param {Object} templateDoc - Template document
   * @param {string} instruction - Custom instruction
   * @returns {string} - Formatted prompt for Claude
   * @private
   */
  buildTransformationPrompt(sourceDoc1, sourceDoc2, templateDoc, instruction) {
    return `
I need you to transform two documents into a new document that follows the format of a template.

DOCUMENT 1:
${sourceDoc1.content}

DOCUMENT 2:
${sourceDoc2.content}

TEMPLATE STRUCTURE (PDF):
The template is a PDF document with the following structure and sections:
${templateDoc.metadata ? templateDoc.metadata.description || 'PDF Template' : 'PDF Template'}

INSTRUCTION:
${instruction}

Please provide the transformed content that follows the template format while incorporating relevant information from both source documents.
`;
  }
  
  /**
   * Save transformed document to transformations folder
   * 
   * @param {string} folderPath - Path to transformations folder
   * @param {string} content - Transformed content
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} - Saved file information
   * @private
   */
  async saveTransformedDocument(folderPath, content, userId = 'system') {
    try {
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `transformed_document_${timestamp}.txt`;
      const outputPath = path.join(folderPath, outputFilename);
      
      // Save the transformed content
      const savedFile = await fileService.saveFile(
        outputPath,
        content,
        'text/plain',
        userId
      );
      
      return savedFile;
    } catch (error) {
      console.error('Error saving transformed document:', error);
      throw new Error('Failed to save transformed document');
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

module.exports = new TransformationService();
