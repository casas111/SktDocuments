import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Types
export interface FileItem {
  id?: string;
  name: string;
  path: string;
  type?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransformationRequest {
  sourceDocIds: string[];
  templateDocId: string;
  instruction: string;
  outputTemplate?: string;
  model?: string;
}

export interface TransformationResult {
  success: boolean;
  message?: string;
  error?: string;
  status?: 'success' | 'error';
  data?: {
    transformedDocument: {
      id: string;
      name: string;
      path: string;
      size: number;
      mimeType: string;
      createdAt: string;
      modifiedAt: string;
    };
    model: string;
  };
}

export interface TransformationNodeFormData {
  nodeName: string;
  inputDocumentUrls: { id: string; url: string }[];
  exampleFormatUrl: string;
  instructions: string;
  outputTemplate: string;
  model: string;
  outputDoc?: {
    name: string;
    path: string;
  } | null;
}

class TransformationService {
  /**
   * Process a transformation using Claude AI
   * 
   * @param request Transformation request with document URLs and instructions
   * @returns Promise with transformation result
   */
  async processTransformation(request: TransformationRequest): Promise<TransformationResult> {
    try {
      // Extract filenames from URLs
      const sourceDocIds = request.sourceDocIds.map(url => this.extractDocumentIdFromUrl(url));
      const templateDocId = this.extractDocumentIdFromUrl(request.templateDocId);
      
      console.log('Extracted filenames:', {
        sourceDocIds,
        templateDocId
      });

      // Validate required parameters
      if (!sourceDocIds.length || !templateDocId || !request.instruction) {
        const missingParams = [];
        if (!sourceDocIds.length) missingParams.push('sourceDocIds');
        if (!templateDocId) missingParams.push('templateDocId');
        if (!request.instruction) missingParams.push('instruction');
        
        console.log('Missing required parameters:', missingParams);
        return {
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')}`
        };
      }

      const response = await axios.post(`${API_ENDPOINTS.TRANSFORMATION}/process`, {
        sourceDocIds,
        templateDocId,
        instruction: request.instruction,
        outputTemplate: request.outputTemplate || '',
        model: request.model || 'claude-3-haiku-20240307'
      });

      return response.data;
    } catch (error) {
      console.error('Transformation error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Extract document ID from URL
   * Example: http://localhost:3000/file/coach.txt -> coach.txt
   * 
   * @param url Document URL
   * @returns Document ID or null if invalid
   */
  private extractDocumentIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Log the extracted filename for debugging
      console.log('Extracted filename from URL:', filename);
      
      return filename || null;
    } catch (error) {
      console.error('Invalid URL format:', url);
      return null;
    }
  }
  
  /**
   * Get available Claude models
   * 
   * @returns Promise with available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.CLAUDE}/models`);
      
      if (response.data.success) {
        return response.data.models || [];
      } else {
        console.error('Failed to get Claude models:', response.data.error);
        return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
      }
    } catch (error) {
      console.error('Error getting Claude models:', error);
      // Return default models as fallback
      return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
    }
  }
}

export default TransformationService;
