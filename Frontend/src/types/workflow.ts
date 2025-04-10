export interface Process {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  steps: ProcessStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  order: number;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
} 