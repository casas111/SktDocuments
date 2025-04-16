const claudeService = require('../utils/claudeService');
const { Document } = require('../models');
const fileStorageService = require('./fileStorageService');

class ComparisonNodeService {
  constructor() {
    // Initialize any required resources
  }
  
  /**
   * Execute a comparison node using Claude API
   * @param {string} nodeId - The ID of the node
   * @param {string} nodeName - The name of the node
   * @param {Array<string>} inputDocuments - Array of document URLs
   * @param {string} instruction - Comparison instruction
   * @returns {Promise<Object>} The result of the comparison
   */
  async executeComparison(nodeId, nodeName, inputDocuments, instruction) {
    try {
      // Validate input
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length !== 2) {
        return {
          success: false,
          error: 'Comparison node requires exactly 2 input documents'
        };
      }
      
      if (!instruction) {
        return {
          success: false,
          error: 'Comparison instruction is required'
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
      
      // Call Claude API to compare documents
      const result = await claudeService.compareDocuments(
        documentContents[0].content,
        documentContents[1].content,
        instruction
      );
      
      if (!result.success) {
        return {
          success: false,
          error: `Error comparing documents: ${result.error}`
        };
      }
      
      // Create a new document with the comparison result
      const comparisonDocument = await Document.create({
        name: `Comparison_${documentContents[0].name}_${documentContents[1].name}`,
        type: 'txt',
        content: result.result,
        size: Buffer.byteLength(result.result),
        url: `/api/documents/comparison_${Date.now()}`
      });
      
      return {
        success: true,
        outputDocuments: [comparisonDocument.url],
        comparisonDetails: {
          document1: documentContents[0].name,
          document2: documentContents[1].name,
          instruction: instruction
        }
      };
    } catch (error) {
      console.error('Error executing comparison node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Validate comparison node configuration
   * @param {Object} config - The configuration to validate
   * @returns {Object} Validation result
   */
  validateComparisonConfig(config) {
    const errors = [];
    
    if (!config.name || config.name.trim() === '') {
      errors.push('Node name is required');
    }
    
    if (!config.instruction || config.instruction.trim() === '') {
      errors.push('Comparison instruction is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ComparisonNodeService();
