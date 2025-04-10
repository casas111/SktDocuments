import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Process } from '../types/workflow';

interface WorkflowStoreContextType {
  processes: Process[];
  loading: boolean;
  error: string | null;
  refreshProcesses: () => Promise<void>;
  addProcess: (process: Process) => void;
  updateProcess: (processId: string, updates: Partial<Process>) => void;
  removeProcess: (processId: string) => void;
}

const WorkflowStoreContext = createContext<WorkflowStoreContextType | undefined>(undefined);

export const WorkflowStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to fetch processes
      setProcesses([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch processes');
    } finally {
      setLoading(false);
    }
  };

  const addProcess = (process: Process) => {
    setProcesses(prev => [...prev, process]);
  };

  const updateProcess = (processId: string, updates: Partial<Process>) => {
    setProcesses(prev => prev.map(process => 
      process.id === processId ? { ...process, ...updates } : process
    ));
  };

  const removeProcess = (processId: string) => {
    setProcesses(prev => prev.filter(process => process.id !== processId));
  };

  const value = {
    processes,
    loading,
    error,
    refreshProcesses,
    addProcess,
    updateProcess,
    removeProcess
  };

  return React.createElement(
    WorkflowStoreContext.Provider,
    { value },
    children
  );
};

export const useWorkflowStore = () => {
  const context = useContext(WorkflowStoreContext);
  if (context === undefined) {
    throw new Error('useWorkflowStore must be used within a WorkflowStoreProvider');
  }
  return context;
}; 