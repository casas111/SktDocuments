import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-opus-20240229';

// Claude API client for document processing
export class ClaudeApiClient {
  private apiKey: string;
  private model: string;
  
  constructor(apiKey: string = CLAUDE_API_KEY, model: string = CLAUDE_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }
  
  /**
   * Transform documents based on instructions
   * @param documents Array of document contents to transform
   * @param instruction Transformation instruction
   * @param outputTemplate Optional template for the output format
   * @returns Transformed document content
   */
  async transformDocuments(
    documents: string[],
    instruction: string,
    outputTemplate?: string
  ): Promise<string> {
    try {
      const prompt = this.buildTransformationPrompt(documents, instruction, outputTemplate);
      
      const response = await this.callClaudeApi(prompt);
      return response;
    } catch (error) {
      console.error('Error transforming documents with Claude API:', error);
      throw error;
    }
  }
  
  /**
   * Compare documents and generate a comparison report
   * @param document1 First document content
   * @param document2 Second document content
   * @param instruction Comparison instruction
   * @returns Comparison report
   */
  async compareDocuments(
    document1: string,
    document2: string,
    instruction: string
  ): Promise<string> {
    try {
      const prompt = this.buildComparisonPrompt(document1, document2, instruction);
      
      const response = await this.callClaudeApi(prompt);
      return response;
    } catch (error) {
      console.error('Error comparing documents with Claude API:', error);
      throw error;
    }
  }
  
  /**
   * Extract structured data from documents
   * @param document Document content
   * @param schema JSON schema for the structured data
   * @returns Extracted structured data as JSON string
   */
  async extractStructuredData(
    document: string,
    schema: object
  ): Promise<string> {
    try {
      const prompt = this.buildExtractionPrompt(document, schema);
      
      const response = await this.callClaudeApi(prompt);
      return response;
    } catch (error) {
      console.error('Error extracting structured data with Claude API:', error);
      throw error;
    }
  }
  
  /**
   * Analyze document and generate insights
   * @param document Document content
   * @param analysisType Type of analysis to perform
   * @returns Analysis results
   */
  async analyzeDocument(
    document: string,
    analysisType: 'summary' | 'sentiment' | 'entities' | 'custom',
    customInstructions?: string
  ): Promise<string> {
    try {
      const prompt = this.buildAnalysisPrompt(document, analysisType, customInstructions);
      
      const response = await this.callClaudeApi(prompt);
      return response;
    } catch (error) {
      console.error('Error analyzing document with Claude API:', error);
      throw error;
    }
  }
  
  /**
   * Call the Claude API with a prompt
   * @param prompt Prompt to send to Claude
   * @returns Claude's response
   */
  private async callClaudeApi(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      return response.data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
  
  /**
   * Build prompt for document transformation
   */
  private buildTransformationPrompt(
    documents: string[],
    instruction: string,
    outputTemplate?: string
  ): string {
    let prompt = `
I need you to transform the following document(s) based on this instruction:

Instruction: ${instruction}

`;

    if (outputTemplate) {
      prompt += `
Output Template:
${outputTemplate}

`;
    }

    prompt += `
Documents:
${documents.map((doc, index) => `Document ${index + 1}:\n${doc}`).join('\n\n')}

Please provide the transformed output following the instruction${outputTemplate ? ' and template' : ''}.
`;

    return prompt;
  }
  
  /**
   * Build prompt for document comparison
   */
  private buildComparisonPrompt(
    document1: string,
    document2: string,
    instruction: string
  ): string {
    return `
I need you to compare the following two documents and produce a flags report based on this instruction:

Instruction: ${instruction}

Document 1:
${document1}

Document 2:
${document2}

Please provide a detailed flags report with green, yellow, and red flags after running a consistency and integrity check between the two documents.
`;
  }
  
  /**
   * Build prompt for structured data extraction
   */
  private buildExtractionPrompt(
    document: string,
    schema: object
  ): string {
    return `
I need you to extract structured data from the following document according to this JSON schema:

Schema:
${JSON.stringify(schema, null, 2)}

Document:
${document}

Please extract the data and return it as a valid JSON object that conforms to the provided schema.
`;
  }
  
  /**
   * Build prompt for document analysis
   */
  private buildAnalysisPrompt(
    document: string,
    analysisType: 'summary' | 'sentiment' | 'entities' | 'custom',
    customInstructions?: string
  ): string {
    let prompt = `
I need you to analyze the following document and provide `;
    
    switch (analysisType) {
      case 'summary':
        prompt += 'a concise summary of its key points and main message.';
        break;
      case 'sentiment':
        prompt += 'a sentiment analysis, indicating whether the tone is positive, negative, or neutral, with supporting evidence.';
        break;
      case 'entities':
        prompt += 'an extraction of key entities (people, organizations, locations, dates) mentioned in the document.';
        break;
      case 'custom':
        prompt += `the following custom analysis: ${customInstructions}`;
        break;
    }
    
    prompt += `

Document:
${document}

Please provide your analysis in a clear, structured format.
`;
    
    return prompt;
  }
}

// Export a singleton instance
export const claudeApiClient = new ClaudeApiClient();

export default claudeApiClient;
