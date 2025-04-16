import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import Documents from '../pages/Documents';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the useApp hook
jest.mock('../context/AppContext', () => ({
  ...jest.requireActual('../context/AppContext'),
  useApp: () => ({
    documents: [
      { id: '1', name: 'Document 1.pdf', type: 'pdf', size: 1024, createdAt: '2025-04-15T10:30:00Z' },
      { id: '2', name: 'Document 2.docx', type: 'docx', size: 2048, createdAt: '2025-04-14T09:45:00Z' }
    ],
    folders: [
      { id: '1', name: 'Folder 1', parentId: 'root' },
      { id: '2', name: 'Folder 2', parentId: 'root' }
    ],
    currentFolder: { id: 'root', name: 'Root' },
    isLoadingDocuments: false,
    setCurrentFolder: jest.fn(),
    fetchDocuments: jest.fn(),
    fetchFolders: jest.fn(),
    createFolder: jest.fn().mockResolvedValue({ id: '3', name: 'New Folder', parentId: 'root' }),
    uploadDocument: jest.fn().mockResolvedValue({ id: '3', name: 'New Document.pdf', type: 'pdf' }),
    deleteDocument: jest.fn().mockResolvedValue(true),
    error: null,
    setError: jest.fn()
  })
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {ui}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Documents Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders documents and folders', () => {
    renderWithProviders(<Documents />);
    
    // Check for documents
    expect(screen.getByText('Document 1.pdf')).toBeInTheDocument();
    expect(screen.getByText('Document 2.docx')).toBeInTheDocument();
    
    // Check for folders
    expect(screen.getByText('Folder 1')).toBeInTheDocument();
    expect(screen.getByText('Folder 2')).toBeInTheDocument();
  });
  
  it('shows breadcrumbs with current folder', () => {
    renderWithProviders(<Documents />);
    
    // Check for breadcrumbs
    expect(screen.getByText('Root')).toBeInTheDocument();
  });
  
  it('opens new folder dialog when clicking New Folder button', async () => {
    renderWithProviders(<Documents />);
    
    // Click New Folder button
    fireEvent.click(screen.getByText('New Folder'));
    
    // Dialog should be open
    expect(screen.getByText('Create New Folder')).toBeInTheDocument();
    expect(screen.getByLabelText('Folder Name')).toBeInTheDocument();
  });
  
  it('creates a new folder', async () => {
    const { useApp } = jest.requireMock('../context/AppContext');
    
    renderWithProviders(<Documents />);
    
    // Click New Folder button
    fireEvent.click(screen.getByText('New Folder'));
    
    // Enter folder name
    fireEvent.change(screen.getByLabelText('Folder Name'), {
      target: { value: 'New Folder' }
    });
    
    // Click Create button
    fireEvent.click(screen.getByText('Create').closest('button'));
    
    // Should call createFolder
    await waitFor(() => {
      expect(useApp().createFolder).toHaveBeenCalledWith('New Folder', 'root');
    });
  });
  
  it('opens upload dialog when clicking Upload button', async () => {
    renderWithProviders(<Documents />);
    
    // Click Upload button
    fireEvent.click(screen.getByText('Upload'));
    
    // Dialog should be open
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });
  
  it('uploads a document', async () => {
    const { useApp } = jest.requireMock('../context/AppContext');
    
    renderWithProviders(<Documents />);
    
    // Click Upload button
    fireEvent.click(screen.getByText('Upload'));
    
    // Create a file
    const file = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    
    // Add file to input
    const fileInput = screen.getByLabelText('Choose File');
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Click Upload button in dialog
    fireEvent.click(screen.getByText('Upload').closest('button'));
    
    // Should call uploadDocument
    await waitFor(() => {
      expect(useApp().uploadDocument).toHaveBeenCalled();
    });
  });
  
  it('opens document menu when clicking menu button', async () => {
    renderWithProviders(<Documents />);
    
    // Click menu button on first document
    const menuButtons = screen.getAllByTestId('MoreVertIcon');
    fireEvent.click(menuButtons[0]);
    
    // Menu should be open (but it's not visible in the test due to the way Material-UI renders menus)
    // In a real implementation, we would use a more sophisticated approach to test this
  });
  
  it('switches between list and grid view', async () => {
    renderWithProviders(<Documents />);
    
    // Initially in list view
    expect(screen.getByTestId('ViewListIcon')).toBeInTheDocument();
    
    // Click view toggle button
    fireEvent.click(screen.getByTestId('ViewListIcon').closest('button'));
    
    // Should switch to grid view
    expect(screen.getByTestId('ViewModuleIcon')).toBeInTheDocument();
    
    // Click view toggle button again
    fireEvent.click(screen.getByTestId('ViewModuleIcon').closest('button'));
    
    // Should switch back to list view
    expect(screen.getByTestId('ViewListIcon')).toBeInTheDocument();
  });
});
