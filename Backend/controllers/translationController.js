/**
 * Backend controller for handling Claude AI translation functionality
 */
const claudeService = require('../services/claudeService');
const fileService = require('../services/fileService');
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');

/**
 * Controller for Claude AI translation endpoints
 */
class TranslationController {
  /**
   * Process document translation using Claude AI
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async translateDocuments(req, res) {
    try {
      const { 
        sourceDoc1Id, 
        sourceDoc2Id, 
        templateDocId, 
        instruction,
        model = 'claude-3-haiku-20240307',
        maxTokens = 4000
      } = req.body;
      
      // Validate required parameters
      if (!sourceDoc1Id || !sourceDoc2Id || !templateDocId || !instruction) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: sourceDoc1Id, sourceDoc2Id, templateDocId, and instruction are required'
        });
      }
      
      // Get source documents content
      const sourceDoc1 = await fileService.getFileById(sourceDoc1Id);
      const sourceDoc2 = await fileService.getFileById(sourceDoc2Id);
      const templateDoc = await fileService.getFileById(templateDocId);
      
      if (!sourceDoc1 || !sourceDoc2 || !templateDoc) {
        return res.status(404).json({
          success: false,
          error: 'One or more documents not found'
        });
      }
      
      // Validate template is PDF
      if (templateDoc.mimeType !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Template document must be a PDF file'
        });
      }
      
      // Create translations folder if it doesn't exist
      const translationsFolder = '/translations';
      try {
        await fileService.createFolderIfNotExists(translationsFolder);
      } catch (folderError) {
        console.error('Error creating translations folder:', folderError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create translations folder'
        });
      }
      
      // Prepare prompt for Claude
      const prompt = `
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
      
      // Call Claude API
      const claudeResponse = await claudeService.sendMessage(
        prompt,
        model,
        maxTokens
      );
      
      if (!claudeResponse.success) {
        return res.status(500).json({
          success: false,
          error: claudeResponse.error || 'Failed to process translation with Claude AI'
        });
      }
      
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `translated_document_${timestamp}.txt`;
      const outputPath = path.join(translationsFolder, outputFilename);
      
      // Save the translated content
      try {
        const savedFile = await fileService.saveFile(
          outputPath,
          claudeResponse.message,
          'text/plain',
          req.user ? req.user.id : 'system'
        );
        
        return res.status(200).json({
          success: true,
          message: 'Translation completed successfully',
          data: {
            translatedDocument: savedFile,
            model: model
          }
        });
      } catch (saveError) {
        console.error('Error saving translated document:', saveError);
        return res.status(500).json({
          success: false,
          error: 'Failed to save translated document'
        });
      }
    } catch (error) {
      console.error('Error in translation controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while processing your translation request'
      });
    }
  }
  
  /**
   * Get available Claude models for translation
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTranslationModels(req, res) {
    try {
      const models = claudeService.getAvailableModels();
      
      return res.status(200).json({
        success: true,
        models: models
      });
    } catch (error) {
      console.error('Error getting translation models:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while retrieving models'
      });
    }
  }
}

module.exports = new TranslationController();
