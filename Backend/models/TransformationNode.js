/**
 * TransformationNode model
 * 
 * This model represents a transformation node in the workflow system.
 * The node is configured at creation time with a name, instruction, and output template,
 * but only calls Claude during trigger events with input documents.
 */

const { v4: uuidv4 } = require('uuid');

class TransformationNode {
  /**
   * Create a new transformation node
   * 
   * @param {Object} options - Node configuration options
   * @param {string} options.name - Name of the node
   * @param {string} options.instruction - Instructions for Claude AI
   * @param {string} options.templateId - ID of the template document
   * @param {string} options.model - Claude model to use (default: 'claude-3-haiku-20240307')
   * @param {number} options.maxTokens - Maximum tokens for Claude response (default: 4000)
   */
  constructor(options = {}) {
    this.id = options.id || `transformation-${uuidv4()}`;
    this.type = 'transformationNode';
    this.name = options.name || 'Untitled Transformation';
    this.instruction = options.instruction || '';
    this.templateId = options.templateId || '';
    this.model = options.model || 'claude-3-haiku-20240307';
    this.maxTokens = options.maxTokens || 4000;
    this.createdAt = options.createdAt || new Date().toISOString();
    this.updatedAt = options.updatedAt || new Date().toISOString();
    this.status = options.status || 'configured'; // configured, processing, completed, error
    this.inputDocuments = options.inputDocuments || [];
    this.outputDocument = options.outputDocument || null;
    this.error = options.error || null;
  }

  /**
   * Validate node configuration
   * 
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name) {
      errors.push('Name is required');
    }

    if (!this.instruction) {
      errors.push('Instruction is required');
    }

    if (!this.templateId) {
      errors.push('Template document is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Set input documents for transformation
   * 
   * @param {Array<string>} documentIds - Array of document IDs
   */
  setInputDocuments(documentIds) {
    this.inputDocuments = documentIds;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Set output document after transformation
   * 
   * @param {string} documentId - ID of the output document
   */
  setOutputDocument(documentId) {
    this.outputDocument = documentId;
    this.status = 'completed';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Set error status
   * 
   * @param {string} errorMessage - Error message
   */
  setError(errorMessage) {
    this.error = errorMessage;
    this.status = 'error';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Set processing status
   */
  setProcessing() {
    this.status = 'processing';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert node to JSON
   * 
   * @returns {Object} JSON representation of the node
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      instruction: this.instruction,
      templateId: this.templateId,
      model: this.model,
      maxTokens: this.maxTokens,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      inputDocuments: this.inputDocuments,
      outputDocument: this.outputDocument,
      error: this.error
    };
  }

  /**
   * Create a node from JSON
   * 
   * @param {Object} json - JSON representation of the node
   * @returns {TransformationNode} New TransformationNode instance
   */
  static fromJSON(json) {
    return new TransformationNode(json);
  }
}

module.exports = TransformationNode;
