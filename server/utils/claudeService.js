const axios = require('axios');

class ClaudeService {
  constructor() {
    // In a production environment, this would be loaded from environment variables
    this.apiKey = process.env.CLAUDE_API_KEY || 'dummy_api_key';
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = 'claude-3-opus-20240229'; // Using the latest Claude model
  }

  /**
   * Initialize the Claude API client with configuration
   * @param {Object} config - Configuration options
   */
  initialize(config = {}) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    
    if (config.model) {
      this.model = config.model;
    }
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    
    console.log('Claude API service initialized with model:', this.model);
  }

  /**
   * Create headers for Claude API requests
   * @returns {Object} Headers object
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }

  /**
   * Process a document using Claude API
   * @param {string} documentContent - The content of the document to process
   * @param {string} instruction - The instruction for Claude to follow
   * @returns {Promise<Object>} The Claude API response
   */
  async processDocument(documentContent, instruction) {
    try {
      console.log(`Processing document with instruction: ${instruction}`);
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${instruction}\n\nDocument content:\n${documentContent}`
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        result: response.data.content[0].text,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error processing document with Claude API:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Compare two documents using Claude API
   * @param {string} document1Content - The content of the first document
   * @param {string} document2Content - The content of the second document
   * @param {string} instruction - The comparison instruction for Claude
   * @returns {Promise<Object>} The Claude API response with comparison results
   */
  async compareDocuments(document1Content, document2Content, instruction) {
    try {
      console.log(`Comparing documents with instruction: ${instruction}`);
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${instruction}\n\nDocument 1:\n${document1Content}\n\nDocument 2:\n${document2Content}`
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        result: response.data.content[0].text,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error comparing documents with Claude API:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Generate a transformation template based on example documents
   * @param {string} exampleInput - Example input document
   * @param {string} exampleOutput - Example output document
   * @returns {Promise<Object>} The Claude API response with generated template
   */
  async generateTransformationTemplate(exampleInput, exampleOutput) {
    try {
      console.log('Generating transformation template from examples');
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `I need to create a transformation template for documents. Please analyze the following example input and output documents, then generate a detailed transformation template that would convert similar input documents to the desired output format.\n\nExample Input Document:\n${exampleInput}\n\nExample Output Document:\n${exampleOutput}\n\nPlease provide a clear, step-by-step transformation template that explains how to convert from the input format to the output format.`
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        template: response.data.content[0].text,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error generating transformation template with Claude API:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Extract structured data from a document
   * @param {string} documentContent - The content of the document
   * @param {string} schema - The schema for the structured data
   * @returns {Promise<Object>} The Claude API response with extracted data
   */
  async extractStructuredData(documentContent, schema) {
    try {
      console.log('Extracting structured data from document');
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `Extract structured data from the following document according to this schema: ${schema}\n\nDocument content:\n${documentContent}\n\nPlease return the extracted data in valid JSON format.`
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      
      // Try to parse the response as JSON
      let extractedData;
      try {
        const jsonMatch = response.data.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                         response.data.content[0].text.match(/\{[\s\S]*\}/);
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response.data.content[0].text;
        extractedData = JSON.parse(jsonString);
      } catch (parseError) {
        console.warn('Could not parse JSON from Claude response:', parseError);
        extractedData = { rawResponse: response.data.content[0].text };
      }
      
      return {
        success: true,
        data: extractedData,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error extracting structured data with Claude API:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Generate a summary of a document
   * @param {string} documentContent - The content of the document
   * @param {Object} options - Options for the summary
   * @returns {Promise<Object>} The Claude API response with summary
   */
  async generateSummary(documentContent, options = {}) {
    try {
      const { maxLength = 'medium', focus = 'general' } = options;
      
      console.log(`Generating ${maxLength} summary with focus on ${focus}`);
      
      let instruction = 'Please summarize the following document.';
      
      if (maxLength === 'short') {
        instruction = 'Please provide a brief summary of the following document in 2-3 sentences.';
      } else if (maxLength === 'medium') {
        instruction = 'Please provide a concise summary of the following document in about 1-2 paragraphs.';
      } else if (maxLength === 'long') {
        instruction = 'Please provide a comprehensive summary of the following document, capturing all key points.';
      }
      
      if (focus !== 'general') {
        instruction += ` Focus on aspects related to ${focus}.`;
      }
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${instruction}\n\nDocument content:\n${documentContent}`
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        summary: response.data.content[0].text,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error generating summary with Claude API:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = new ClaudeService();
