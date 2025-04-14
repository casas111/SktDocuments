import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
interface UIState {
  sidebarOpen: boolean;
  currentView: 'documents' | 'workflows';
  notifications: Notification[];
  isLoading: boolean;
  modalState: {
    open: boolean;
    type: 'createFolder' | 'uploadFile' | 'createWorkflow' | 'createNode' | 'nodeDetails' | 'none';
    data: any;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read: boolean;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  currentView: 'documents',
  notifications: [],
  isLoading: false,
  modalState: {
    open: false,
    type: 'none',
    data: null,
  },
};

// Create the slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
      state.currentView = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id,
        timestamp: Date.now(),
        read: false,
      });
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action: PayloadAction<Omit<UIState['modalState'], 'open'>>) => {
      state.modalState = {
        ...action.payload,
        open: true,
      };
    },
    closeModal: (state) => {
      state.modalState = {
        open: false,
        type: 'none',
        data: null,
      };
    },
  },
});

// Export actions and reducer
export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentView,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setIsLoading,
  openModal,
  closeModal,
} = uiSlice.actions;

// Export selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectModalState = (state: RootState) => state.ui.modalState;

export default uiSlice.reducer;
