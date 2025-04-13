import { useState, useEffect } from 'react';
import { getAllProcesses, processTransformation, getProcessStatus } from '../services/api';
import { Process } from '../types/process';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useWorkflow = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const response = await getAllProcesses();
      setProcesses(response);
    } catch (err) {
      setError('Failed to load processes');
      console.error('Error loading processes:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTransformation = async (documentId: string, targetLanguage: string) => {
    setLoading(true);
    try {
      const response = await processTransformation(documentId, targetLanguage);
      const newProcess = response;
      setProcesses(prev => [...prev, newProcess]);
    } catch (err) {
      setError('Failed to start transformation');
      console.error('Error starting transformation:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkProcessStatus = async (processId: string) => {
    setLoading(true);
    try {
      const response = await getProcessStatus(processId);
      const updatedProcess = response;
      setProcesses(prev => 
        prev.map(process => process.id === processId ? updatedProcess : process)
      );
    } catch (err) {
      setError('Failed to check process status');
      console.error('Error checking process status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  return {
    processes,
    loading,
    error,
    loadProcesses,
    startTransformation,
    checkProcessStatus
  };
};

export default useWorkflow;
