export interface Process {
  id: string;
  documentId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime: Date | null;
  progress: number;
  error: string | null;
  metadata: {
    nodeId: string | null;
    nodeType: string | null;
    description: string;
  };
} 