const express = require('express');
const router = express.Router();
const claudeService = require('../utils/claudeService');

// Initialize Claude API
router.post('/initialize', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: true, 
        message: 'API key is required' 
      });
    }
    
    claudeService.initialize({
      apiKey,
      model: model || 'claude-3-opus-20240229'
    });
    
    res.status(200).json({
      success: true,
      message: 'Claude API initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Process document with Claude
router.post('/process-document', async (req, res) => {
  try {
    const { documentContent, instruction } = req.body;
    
    if (!documentContent || !instruction) {
      return res.status(400).json({ 
        error: true, 
        message: 'Document content and instruction are required' 
      });
    }
    
    const result = await claudeService.processDocument(documentContent, instruction);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: true, 
        message: result.error 
      });
    }
    
    res.status(200).json({
      success: true,
      result: result.result,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error processing document with Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Compare documents with Claude
router.post('/compare-documents', async (req, res) => {
  try {
    const { document1Content, document2Content, instruction } = req.body;
    
    if (!document1Content || !document2Content || !instruction) {
      return res.status(400).json({ 
        error: true, 
        message: 'Both document contents and instruction are required' 
      });
    }
    
    const result = await claudeService.compareDocuments(
      document1Content, 
      document2Content, 
      instruction
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        error: true, 
        message: result.error 
      });
    }
    
    res.status(200).json({
      success: true,
      result: result.result,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error comparing documents with Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Generate transformation template
router.post('/generate-template', async (req, res) => {
  try {
    const { exampleInput, exampleOutput } = req.body;
    
    if (!exampleInput || !exampleOutput) {
      return res.status(400).json({ 
        error: true, 
        message: 'Example input and output documents are required' 
      });
    }
    
    const result = await claudeService.generateTransformationTemplate(
      exampleInput,
      exampleOutput
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        error: true, 
        message: result.error 
      });
    }
    
    res.status(200).json({
      success: true,
      template: result.template,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error generating transformation template with Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Extract structured data from document
router.post('/extract-data', async (req, res) => {
  try {
    const { documentContent, schema } = req.body;
    
    if (!documentContent || !schema) {
      return res.status(400).json({ 
        error: true, 
        message: 'Document content and schema are required' 
      });
    }
    
    const result = await claudeService.extractStructuredData(
      documentContent,
      schema
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        error: true, 
        message: result.error 
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.data,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error extracting structured data with Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// Generate document summary
router.post('/generate-summary', async (req, res) => {
  try {
    const { documentContent, options } = req.body;
    
    if (!documentContent) {
      return res.status(400).json({ 
        error: true, 
        message: 'Document content is required' 
      });
    }
    
    const result = await claudeService.generateSummary(
      documentContent,
      options || {}
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        error: true, 
        message: result.error 
      });
    }
    
    res.status(200).json({
      success: true,
      summary: result.summary,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error generating summary with Claude API:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
