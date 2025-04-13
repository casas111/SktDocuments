import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { TransformationNodeData } from './types';

export interface TransformationResult {
  success: boolean;
  error?: string;
  data?: {
    transformedDocument: {
      name: string;
      path: string;
    };
  };
}

export interface TransformationRequest {
  sourceDocIds: string[];
  templateDocId?: string;
  instruction: string;
  outputTemplate: string;
  model: string;
}

export class TransformationService {
  async processTransformation(request: TransformationRequest): Promise<TransformationResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/transformation/trigger`, request);
      
      if (response.status === 200 && response.data.success) {
        return {
          success: true,
          data: {
            transformedDocument: response.data.transformedDocument
          }
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to process transformation'
        };
      }
    } catch (error) {
      console.error('Error in transformation service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/transformation/models`);
      
      if (response.status === 200 && response.data.success) {
        return response.data.models || [];
      } else {
        console.error('Failed to fetch available models');
        return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
      }
    } catch (error) {
      console.error('Error fetching available models:', error);
      return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
    }
  }

  createDefaultNodeData(): TransformationNodeData {
    return {
      label: 'Document Transformation',
      description: 'Transforms documents using Claude AI',
      sourceDoc: null,
      templateDoc: null,
      instruction: '',
      outputTemplate: '',
      model: 'claude-3-haiku-20240307',
      status: 'idle',
      outputDoc: null
    };
  }

  updateNodeData(data: Partial<TransformationNodeData>): TransformationNodeData {
    return {
      label: 'Document Transformation',
      description: 'Transforms documents using Claude AI',
      sourceDoc: data.sourceDoc || null,
      templateDoc: data.templateDoc || null,
      instruction: data.instruction?.substring(0, 50) + (data.instruction && data.instruction.length > 50 ? '...' : '') || '',
      outputTemplate: data.outputTemplate || '',
      model: data.model || 'claude-3-haiku-20240307',
      status: 'idle',
      outputDoc: null
    };
  }
}
