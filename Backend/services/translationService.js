/**
 * Service for handling file operations related to translations
 */
const fileService = require('./fileService');
const claudeService = require('./claudeService');
const path = require('path');
const fs = require('fs').promises;

/**
 * Translation service for document transformation
 */
class TranslationService {
  /**
   * Process document translation using Claude AI
   * 
   * @param {string} sourceDoc1Id - ID of the first source document
   * @param {string} sourceDoc2Id - ID of the second source document
   * @param {string} templateDocId - ID of the template document (PDF)
   * @param {string} instruction - Custom instruction for Claude
   * @param {string} model - Claude model to use
   * @param {number} maxTokens - Maximum tokens for Claude response
   * @returns {Promise<Object>} - Result of the translation process
   */
  async translateDocuments(sourceDoc1Id, sourceDoc2Id, templateDocId, instruction, model = 'claude-3-haiku-20240307', maxTokens = 4000) {
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
      
      // Create translations folder if it doesn't exist
      const translationsFolder = '/translations';
      await this.createTranslationsFolder(translationsFolder);
      
      // Prepare prompt for Claude
      const prompt = this.buildTranslationPrompt(sourceDoc1, sourceDoc2, templateDoc, instruction);
      
      // Call Claude API
      const claudeResponse = await claudeService.sendMessage(
        prompt,
        model,
        maxTokens
      );
      
      if (!claudeResponse.success) {
        throw new Error(claudeResponse.error || 'Failed to process translation with Claude AI');
      }
      
      // Generate output filename and save the translated content
      const outputFile = await this.saveTranslatedDocument(
        translationsFolder, 
        claudeResponse.message
      );
      
      return {
        success: true,
        message: 'Translation completed successfully',
        data: {
          translatedDocument: outputFile,
          model: model
        }
      };
    } catch (error) {
      console.error('Error in translation service:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while processing your translation request'
      };
    }
  }
  
  /**
   * Create translations folder if it doesn't exist
   * 
   * @param {string} folderPath - Path to translations folder
   * @returns {Promise<void>}
   * @private
   */
  async createTranslationsFolder(folderPath) {
    try {
      await fileService.createFolderIfNotExists(folderPath);
      console.log('Translations folder created or already exists');
    } catch (error) {
      console.error('Error creating translations folder:', error);
      throw new Error('Failed to create translations folder');
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
  buildTranslationPrompt(sourceDoc1, sourceDoc2, templateDoc, instruction) {
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
   * Save translated document to translations folder
   * 
   * @param {string} folderPath - Path to translations folder
   * @param {string} content - Translated content
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} - Saved file information
   * @private
   */
  async saveTranslatedDocument(folderPath, content, userId = 'system') {
    try {
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `translated_document_${timestamp}.txt`;
      const outputPath = path.join(folderPath, outputFilename);
      
      // Save the translated content
      const savedFile = await fileService.saveFile(
        outputPath,
        content,
        'text/plain',
        userId
      );
      
      return savedFile;
    } catch (error) {
      console.error('Error saving translated document:', error);
      throw new Error('Failed to save translated document');
    }
  }
  
  /**
   * Get available Claude models for translation
   * 
   * @returns {Array} - List of available Claude models
   */
  getTranslationModels() {
    return claudeService.getAvailableModels();
  }
}

module.exports = new TranslationService();
