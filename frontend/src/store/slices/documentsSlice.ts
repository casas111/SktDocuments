import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import axios from 'axios';

// Define types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

interface DocumentsState {
  documents: Document[];
  folders: Folder[];
  labels: Label[];
  currentFolder: Folder | null;
  selectedDocument: Document | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DocumentsState = {
  documents: [],
  folders: [],
  labels: [],
  currentFolder: null,
  selectedDocument: null,
  loading: false,
  error: null,
};

// Async thunks will be implemented here when backend is ready
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (folderId: string | null, { rejectWithValue }) => {
    try {
      // This will be replaced with actual API call
      return [] as Document[];
    } catch (error) {
      return rejectWithValue('Failed to fetch documents');
    }
  }
);

// Create the slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    setSelectedDocument: (state, action: PayloadAction<Document | null>) => {
      state.selectedDocument = action.payload;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
    },
    updateDocument: (state, action: PayloadAction<Document>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
    addFolder: (state, action: PayloadAction<Folder>) => {
      state.folders.push(action.payload);
    },
    updateFolder: (state, action: PayloadAction<Folder>) => {
      const index = state.folders.findIndex(folder => folder.id === action.payload.id);
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
    },
    removeFolder: (state, action: PayloadAction<string>) => {
      state.folders = state.folders.filter(folder => folder.id !== action.payload);
    },
    addLabel: (state, action: PayloadAction<Label>) => {
      state.labels.push(action.payload);
    },
    updateLabel: (state, action: PayloadAction<Label>) => {
      const index = state.labels.findIndex(label => label.id === action.payload.id);
      if (index !== -1) {
        state.labels[index] = action.payload;
      }
    },
    removeLabel: (state, action: PayloadAction<string>) => {
      state.labels = state.labels.filter(label => label.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  setCurrentFolder,
  setSelectedDocument,
  addDocument,
  updateDocument,
  removeDocument,
  addFolder,
  updateFolder,
  removeFolder,
  addLabel,
  updateLabel,
  removeLabel,
} = documentsSlice.actions;

// Export selectors
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectFolders = (state: RootState) => state.documents.folders;
export const selectLabels = (state: RootState) => state.documents.labels;
export const selectCurrentFolder = (state: RootState) => state.documents.currentFolder;
export const selectSelectedDocument = (state: RootState) => state.documents.selectedDocument;
export const selectDocumentsLoading = (state: RootState) => state.documents.loading;
export const selectDocumentsError = (state: RootState) => state.documents.error;

export default documentsSlice.reducer;
