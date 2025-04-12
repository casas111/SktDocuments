import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

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

export interface TranslationRequest {
  nodeName: string;
  inputDocumentUrls: string[];
  exampleFormatUrl: string;
  instructions: string;
  model: string;
}

export interface TranslationResult {
  success: boolean;
  outputDocumentUrl?: string;
  outputDocumentName?: string;
  error?: string;
}

class TranslationService {
  /**
   * Process a translation using Claude AI
   * 
   * @param request Translation request with document URLs and instructions
   * @returns Promise with translation result
   */
  async processTranslation(request: TranslationRequest): Promise<TranslationResult> {
    try {
      // Extract document IDs from URLs
      const inputDocIds = request.inputDocumentUrls.map(url => this.extractDocumentIdFromUrl(url));
      const templateDocId = this.extractDocumentIdFromUrl(request.exampleFormatUrl);
      
      // Validate extracted IDs
      if (inputDocIds.some(id => !id) || !templateDocId) {
        return {
          success: false,
          error: 'Invalid document URLs provided'
        };
      }
      
      // Create a unique node ID if not provided
      const nodeId = `translation-${Date.now()}`;
      
      // Make API request to process translation
      const response = await axios.post(`${API_ENDPOINTS.TRANSLATION}/process`, {
        nodeId,
        nodeName: request.nodeName,
        sourceDoc1Id: inputDocIds[0],
        sourceDoc2Id: inputDocIds.length > 1 ? inputDocIds[1] : inputDocIds[0], // Use first doc as fallback
        templateDocId,
        instruction: request.instructions,
        model: request.model
      });
      
      if (response.data.success) {
        return {
          success: true,
          outputDocumentUrl: this.constructDocumentUrl(response.data.data.translatedDocument?.path),
          outputDocumentName: response.data.data.translatedDocument?.name
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to process translation'
        };
      }
    } catch (error) {
      console.error('Error processing translation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
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
      return pathParts[pathParts.length - 1] || null;
    } catch (error) {
      console.error('Invalid URL format:', url);
      return null;
    }
  }
  
  /**
   * Construct document URL from path
   * 
   * @param path Document path
   * @returns Full document URL
   */
  private constructDocumentUrl(path?: string): string {
    if (!path) return '';
    
    // If path is already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Extract filename from path
    const pathParts = path.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Construct URL
    return `http://localhost:3000/file/${filename}`;
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

export default TranslationService;
