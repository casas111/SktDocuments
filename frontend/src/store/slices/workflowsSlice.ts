import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
export interface Node {
  id: string;
  type: 'transformation' | 'comparison' | 'simetrik_integration' | 'communication';
  name: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    instruction?: string;
    outputTemplate?: string;
    config: Record<string, any>;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowsState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  selectedNode: Node | null;
  loading: boolean;
  error: string | null;
  executionStatus: {
    nodeId: string;
    status: 'idle' | 'running' | 'success' | 'error';
    message: string;
  } | null;
}

// Initial state
const initialState: WorkflowsState = {
  workflows: [],
  currentWorkflow: null,
  selectedNode: null,
  loading: false,
  error: null,
  executionStatus: null,
};

// Async thunks will be implemented here when backend is ready
export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      // This will be replaced with actual API call
      return [] as Workflow[];
    } catch (error) {
      return rejectWithValue('Failed to fetch workflows');
    }
  }
);

// Create the slice
const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setCurrentWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.currentWorkflow = action.payload;
    },
    setSelectedNode: (state, action: PayloadAction<Node | null>) => {
      state.selectedNode = action.payload;
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflows.push(action.payload);
    },
    updateWorkflow: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex(wf => wf.id === action.payload.id);
      if (index !== -1) {
        state.workflows[index] = action.payload;
      }
      if (state.currentWorkflow?.id === action.payload.id) {
        state.currentWorkflow = action.payload;
      }
    },
    removeWorkflow: (state, action: PayloadAction<string>) => {
      state.workflows = state.workflows.filter(wf => wf.id !== action.payload);
      if (state.currentWorkflow?.id === action.payload) {
        state.currentWorkflow = null;
      }
    },
    addNode: (state, action: PayloadAction<Node>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes.push(action.payload);
      }
    },
    updateNode: (state, action: PayloadAction<Node>) => {
      if (state.currentWorkflow) {
        const index = state.currentWorkflow.nodes.findIndex(node => node.id === action.payload.id);
        if (index !== -1) {
          state.currentWorkflow.nodes[index] = action.payload;
        }
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes = state.currentWorkflow.nodes.filter(node => node.id !== action.payload);
        state.currentWorkflow.connections = state.currentWorkflow.connections.filter(
          conn => conn.source !== action.payload && conn.target !== action.payload
        );
      }
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.connections.push(action.payload);
      }
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.connections = state.currentWorkflow.connections.filter(conn => conn.id !== action.payload);
      }
    },
    setExecutionStatus: (state, action: PayloadAction<WorkflowsState['executionStatus']>) => {
      state.executionStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  setCurrentWorkflow,
  setSelectedNode,
  addWorkflow,
  updateWorkflow,
  removeWorkflow,
  addNode,
  updateNode,
  removeNode,
  addConnection,
  removeConnection,
  setExecutionStatus,
} = workflowsSlice.actions;

// Export selectors
export const selectWorkflows = (state: RootState) => state.workflows.workflows;
export const selectCurrentWorkflow = (state: RootState) => state.workflows.currentWorkflow;
export const selectSelectedNode = (state: RootState) => state.workflows.selectedNode;
export const selectWorkflowsLoading = (state: RootState) => state.workflows.loading;
export const selectWorkflowsError = (state: RootState) => state.workflows.error;
export const selectExecutionStatus = (state: RootState) => state.workflows.executionStatus;

export default workflowsSlice.reducer;
