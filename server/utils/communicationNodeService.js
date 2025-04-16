const { Document } = require('../models');
const fileStorageService = require('./fileStorageService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class CommunicationNodeService {
  constructor() {
    this.communicationsDir = path.join(fileStorageService.baseUploadDir, 'communications');
    fileStorageService.ensureDirectoryExists(this.communicationsDir);
  }
  
  // Execute a communication node
  async executeCommunication(nodeId, nodeName, inputDocuments, communicationConfig) {
    try {
      // Validate input
      if (!inputDocuments || !Array.isArray(inputDocuments) || inputDocuments.length === 0) {
        return {
          success: false,
          error: 'Input documents must be a non-empty array of document URLs'
        };
      }
      
      if (!communicationConfig) {
        return {
          success: false,
          error: 'Communication configuration is required'
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
      
      // In a real implementation, this would send communications via email, API, etc.
      // For now, we'll create a simulated communication result
      const communicationResult = this.generateCommunicationResult(
        nodeName, 
        documentContents,
        communicationConfig
      );
      
      // Create node-specific directory
      const nodeDir = path.join(this.communicationsDir, nodeName.replace(/[^a-zA-Z0-9]/g, '_'));
      fileStorageService.ensureDirectoryExists(nodeDir);
      
      // Create output document
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const outputFileName = `${nodeName.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.txt`;
      const outputPath = path.join(nodeDir, outputFileName);
      
      // Write content to file
      fs.writeFileSync(outputPath, communicationResult);
      
      // Create document record in database
      const outputDocument = await Document.create({
        name: outputFileName,
        path: outputPath,
        type: 'txt',
        size: Buffer.byteLength(communicationResult),
        content: communicationResult,
        url: `/api/documents/${uuidv4()}`
      });
      
      return {
        success: true,
        outputDocuments: [outputDocument.url],
        communicationDetails: {
          inputCount: documentContents.length,
          method: communicationConfig.method,
          recipients: communicationConfig.recipients,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error executing communication node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Generate a communication result (placeholder for actual communication)
  generateCommunicationResult(nodeName, documents, config) {
    const header = `# Communication Result: ${nodeName}\n\n`;
    const timestamp = `**Timestamp:** ${new Date().toISOString()}\n\n`;
    const configDetails = `**Communication Configuration:**\n` +
      `- Method: ${config.method}\n` +
      `- Recipients: ${config.recipients.join(', ')}\n` +
      `- Subject: ${config.subject || 'No subject'}\n\n`;
    
    const documentSection = `## Included Documents (${documents.length})\n\n`;
    const documentSummaries = documents.map((doc, index) => {
      return `### Document ${index + 1}: ${doc.name}\n` +
             `**Type:** ${doc.type}\n` +
             `**Size:** ${Buffer.byteLength(doc.content)} bytes\n\n`;
    }).join('');
    
    // Generate message content based on the communication method
    let messageContent = '';
    if (config.method === 'email') {
      messageContent = `## Email Message\n\n` +
        `**To:** ${config.recipients.join(', ')}\n` +
        `**Subject:** ${config.subject || 'No subject'}\n` +
        `**Body:**\n\n${config.message || 'No message body'}\n\n`;
    } else if (config.method === 'api') {
      messageContent = `## API Request\n\n` +
        `**Endpoint:** ${config.endpoint || 'No endpoint specified'}\n` +
        `**Method:** ${config.httpMethod || 'POST'}\n` +
        `**Headers:**\n${config.headers ? JSON.stringify(config.headers, null, 2) : 'No headers'}\n\n` +
        `**Payload:**\n${config.payload || 'No payload'}\n\n`;
    } else if (config.method === 'webhook') {
      messageContent = `## Webhook Notification\n\n` +
        `**URL:** ${config.webhookUrl || 'No webhook URL specified'}\n` +
        `**Event:** ${config.event || 'No event specified'}\n` +
        `**Payload:**\n${config.payload || 'No payload'}\n\n`;
    } else {
      messageContent = `## Generic Message\n\n` +
        `**Content:**\n\n${config.message || 'No message content'}\n\n`;
    }
    
    const resultSection = `## Communication Status\n\n` +
      `- Status: Simulated (Success)\n` +
      `- Sent At: ${new Date().toISOString()}\n` +
      `- Recipients Processed: ${config.recipients.length}\n\n`;
    
    const conclusion = `## Notes\n\n` +
      `This is a basic implementation of the communication node.\n` +
      `In a production environment, this would send actual communications via the specified method.\n\n`;
    
    return header + timestamp + configDetails + documentSection + 
           documentSummaries + messageContent + resultSection + conclusion;
  }
  
  // Validate communication node configuration
  validateCommunicationConfig(config) {
    const errors = [];
    
    if (!config.name || config.name.trim() === '') {
      errors.push('Node name is required');
    }
    
    if (!config.method || config.method.trim() === '') {
      errors.push('Communication method is required');
    }
    
    if (!config.recipients || !Array.isArray(config.recipients) || config.recipients.length === 0) {
      errors.push('At least one recipient is required');
    }
    
    // Method-specific validation
    if (config.method === 'email' && !config.subject) {
      errors.push('Email subject is required');
    }
    
    if (config.method === 'api' && !config.endpoint) {
      errors.push('API endpoint is required');
    }
    
    if (config.method === 'webhook' && !config.webhookUrl) {
      errors.push('Webhook URL is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new CommunicationNodeService();
