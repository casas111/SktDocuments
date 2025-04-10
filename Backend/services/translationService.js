const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const documentService = require('./documentService');
const { v4: uuidv4 } = require('uuid');

// Mock API key for development - in production, use environment variables
const AI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key';
const AI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Call AI model for translation
 * @param {string} content - Content to translate
 * @param {string} exampleFormat - Example of desired output format
 * @returns {Promise<string>} Translated content
 */
const callAIForTranslation = async (content, exampleFormat) => {
  try {
    // For development, we'll simulate the AI response
    // In production, uncomment the axios call to use the actual API
    
    /*
    const response = await axios.post(
      AI_API_URL,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a document translation assistant. Translate the provided document into the format shown in the example.'
          },
          {
            role: 'user',
            content: `Please translate the following document into the format shown in the example.\n\nDocument to translate:\n${content}\n\nExample format:\n${exampleFormat}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
    */
    
    // Simulate AI response for development
    console.log('Simulating AI translation...');
    console.log('Content length:', content.length);
    console.log('Example format length:', exampleFormat.length);
    
    // Simple simulation - in reality, this would be the AI model's response
    const simulatedResponse = `Translated document based on the example format:\n\n${exampleFormat.substring(0, 100)}\n\nTranslated content from original:\n${content.substring(0, 200)}...\n\nEnd of translation.`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return simulatedResponse;
  } catch (error) {
    console.error('Error calling AI for translation:', error);
    throw new Error('Failed to translate document using AI service');
  }
};

/**
 * Process document translation
 * @param {string} documentId - ID of document to translate
 * @param {string} exampleDocumentId - ID of example document for output format
 * @returns {Promise<Object>} Processed document metadata
 */
const translateDocument = async (documentId, exampleDocumentId) => {
  try {
    // Get source document
    const document = documentService.getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // Get example document
    const exampleDocument = documentService.getDocumentById(exampleDocumentId);
    if (!exampleDocument) {
      throw new Error(`Example document with ID ${exampleDocumentId} not found`);
    }
    
    // Read document content
    const content = await fs.readFile(document.path, 'utf8');
    
    // Read example document content
    const exampleFormat = await fs.readFile(exampleDocument.path, 'utf8');
    
    // Call AI for translation
    const translatedContent = await callAIForTranslation(content, exampleFormat);
    
    // Create output file
    const outputFilename = `translated_${uuidv4()}${path.extname(document.originalName)}`;
    const outputPath = path.join(__dirname, '../storage/processed', outputFilename);
    
    // Write translated content to file
    await fs.writeFile(outputPath, translatedContent);
    
    // Create document metadata
    const translatedDocument = {
      id: uuidv4(),
      originalName: `translated_${document.originalName}`,
      filename: outputFilename,
      mimetype: document.mimetype,
      size: Buffer.byteLength(translatedContent),
      path: outputPath,
      type: 'processed',
      uploadDate: new Date(),
      metadata: {
        sourceDocumentId: documentId,
        exampleDocumentId: exampleDocumentId,
        processType: 'translation',
        processDate: new Date()
      }
    };
    
    // Save document metadata
    return documentService.saveDocument(translatedDocument);
  } catch (error) {
    console.error('Error translating document:', error);
    throw error;
  }
};

module.exports = {
  translateDocument,
  callAIForTranslation
};
