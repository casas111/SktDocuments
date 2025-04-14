import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '../src/store/slices/documentsSlice';
import uiReducer from '../src/store/slices/uiSlice';
import DocumentsPage from '../src/pages/DocumentsPage';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Integration Test: DocumentsPage', () => {
  let store;

  beforeEach(() => {
    // Create a test store with the necessary reducers
    store = configureStore({
      reducer: {
        documents: documentsReducer,
        ui: uiReducer,
      },
    });

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/folders')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'folder-1', name: 'Sample Folder 1', parentId: null },
              { id: 'folder-2', name: 'Sample Folder 2', parentId: null },
              { id: 'folder-3', name: 'Sample Folder 3', parentId: null },
            ]
          }
        });
      } else if (url.includes('/documents')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'file-1', name: 'Document 1.pdf', type: 'application/pdf', folderId: null },
              { id: 'file-2', name: 'Document 2.pdf', type: 'application/pdf', folderId: null },
              { id: 'file-3', name: 'Document 3.pdf', type: 'application/pdf', folderId: null },
            ]
          }
        });
      } else if (url.includes('/labels')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'label-1', name: 'Important', color: '#ff0000' },
              { id: 'label-2', name: 'Urgent', color: '#ff9900' },
              { id: 'label-3', name: 'Review', color: '#0000ff' },
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders the documents page with folders and files', async () => {
    // Arrange & Act
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DocumentsPage />
        </BrowserRouter>
      </Provider>
    );

    // Assert
    expect(screen.getByText(/Documents/i)).toBeInTheDocument();
    
    // Wait for API calls to complete
    await waitFor(() => {
      expect(screen.getByText(/Sample Folder 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Document 1.pdf/i)).toBeInTheDocument();
    });
    
    // Verify API calls
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/folders'));
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/documents'));
  });

  it('allows creating a new folder', async () => {
    // Arrange
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'new-folder', name: 'New Test Folder', parentId: null }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <DocumentsPage />
        </BrowserRouter>
      </Provider>
    );

    // Act
    fireEvent.click(screen.getByText(/New Folder/i));
    
    // Fill in the folder name
    const nameInput = await waitFor(() => screen.getByLabelText(/Folder Name/i));
    fireEvent.change(nameInput, { target: { value: 'New Test Folder' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Create/i));

    // Assert
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/folders'),
        expect.objectContaining({ name: 'New Test Folder' })
      );
    });
  });

  it('allows searching for documents', async () => {
    // Arrange
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DocumentsPage />
        </BrowserRouter>
      </Provider>
    );

    // Act
    const searchInput = screen.getByPlaceholderText(/Search documents and folders/i);
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Document 1.pdf/i)).toBeInTheDocument();
      // Document 2 and 3 should be filtered out
      expect(screen.queryByText(/Document 2.pdf/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Document 3.pdf/i)).not.toBeInTheDocument();
    });
  });

  it('navigates to a folder when clicked', async () => {
    // Arrange
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/folders/folder-1')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { 
              id: 'folder-1', 
              name: 'Sample Folder 1',
              subfolders: [],
              documents: [
                { id: 'file-4', name: 'Folder Document.pdf', type: 'application/pdf' }
              ]
            }
          }
        });
      }
      // Return default mock responses for other URLs
      return mockedAxios.get.getMockImplementation()(url);
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <DocumentsPage />
        </BrowserRouter>
      </Provider>
    );

    // Wait for folders to load
    await waitFor(() => {
      expect(screen.getByText(/Sample Folder 1/i)).toBeInTheDocument();
    });

    // Act
    fireEvent.click(screen.getByText(/Sample Folder 1/i));

    // Assert
    await waitFor(() => {
      // Breadcrumb should show the folder name
      expect(screen.getByText(/Sample Folder 1/i)).toBeInTheDocument();
      // Should show documents in the folder
      expect(screen.getByText(/Folder Document.pdf/i)).toBeInTheDocument();
    });
  });
});
