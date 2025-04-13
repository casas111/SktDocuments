/**
 * Backend controller for handling Claude AI transformation functionality
 */
const claudeService = require('../services/claudeService');
const fileService = require('../services/fileService');
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');

/**
 * Controller for Claude AI transformation endpoints
 */
class TransformationController {
  /**
   * Process document transformation using Claude AI
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async transformDocuments(req, res) {
    try {
      const { 
        sourceDocIds, 
        templateDocId, 
        instruction,
        model = 'claude-3-haiku-20240307',
        maxTokens = 4000
      } = req.body;
      
      console.log('Received request with:', {
        sourceDocIds,
        templateDocId,
        instruction: instruction ? 'present' : 'missing',
        model
      });
      
      // Validate required parameters
      if (!sourceDocIds || !Array.isArray(sourceDocIds) || sourceDocIds.length === 0 || !templateDocId || !instruction) {
        const missingParams = [];
        if (!sourceDocIds || !Array.isArray(sourceDocIds) || sourceDocIds.length === 0) missingParams.push('sourceDocIds');
        if (!templateDocId) missingParams.push('templateDocId');
        if (!instruction) missingParams.push('instruction');
        
        console.log('Missing required parameters:', missingParams);
        return res.status(400).json({
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')} are required`
        });
      }
      
      // Get source documents content
      console.log('Fetching source documents...');
      const sourceDocs = await Promise.all(
        sourceDocIds.map(async (docId) => {
          try {
            return await fileService.getFile(docId);
          } catch (error) {
            console.error(`Error fetching document ${docId}:`, error);
            return null;
          }
        })
      );
      
      const templateDoc = await fileService.getFile(templateDocId);
      
      console.log('Documents found:', {
        sourceDocs: sourceDocs.map(doc => !!doc),
        templateDoc: !!templateDoc
      });
      
      // Check if any required documents are missing
      const missingDocs = [];
      if (!templateDoc) missingDocs.push('templateDoc');
      sourceDocs.forEach((doc, index) => {
        if (!doc) missingDocs.push(`sourceDoc${index + 1}`);
      });
      
      if (missingDocs.length > 0) {
        console.log('Required documents not found:', missingDocs);
        return res.status(404).json({
          success: false,
          error: `Required documents not found: ${missingDocs.join(', ')}`
        });
      }
      
      // Validate template is PDF
      if (templateDoc.metadata.mimeType !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Template document must be a PDF file'
        });
      }
      
      // Create transformations folder if it doesn't exist
      const transformationsFolder = '/transformations';
      try {
        await fileService.createFolderIfNotExists(transformationsFolder);
      } catch (folderError) {
        console.error('Error creating transformations folder:', folderError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create transformations folder'
        });
      }
      
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
${instruction}

Please provide the transformed content that follows the template format while incorporating relevant information from the source document${sourceDocs.length > 1 ? 's' : ''}.
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
          error: claudeResponse.error || 'Failed to process transformation with Claude AI'
        });
      }
      
      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `transformed_document_${timestamp}.txt`;
      const outputPath = path.join('documents', 'transformations', outputFilename);
      
      // Save the transformed content
      try {
        console.log('Saving transformed document to:', outputPath);
        
        const savedFile = await fileService.saveFile(
          outputPath,
          claudeResponse.message,
          'text/plain',
          req.user ? req.user.id : 'system'
        );
        
        return res.status(200).json({
          success: true,
          message: 'Transformation completed successfully',
          data: {
            transformedDocument: savedFile.metadata,
            model: model
          }
        });
      } catch (saveError) {
        console.error('Error saving transformed document:', saveError);
        return res.status(500).json({
          success: false,
          error: 'Failed to save transformed document'
        });
      }
    } catch (error) {
      console.error('Error in transformation controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while processing your transformation request'
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
      const models = claudeService.getAvailableModels();
      
      return res.status(200).json({
        success: true,
        models: models
      });
    } catch (error) {
      console.error('Error getting transformation models:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while retrieving models'
      });
    }
  }
}

module.exports = new TransformationController();
