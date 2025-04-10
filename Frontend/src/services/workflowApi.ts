import axios from 'axios';
import { Process } from '../types/workflow';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const processTranslation = async (documentId: string, exampleDocumentId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/workflow/process/translation`, {
      documentId,
      exampleDocumentId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProcessStatus = async (processId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workflow/process/${processId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllProcesses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workflow/process`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 