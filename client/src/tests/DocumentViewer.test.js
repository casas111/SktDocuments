import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import DocumentViewer from '../pages/DocumentViewer';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

// Mock the useApp hook
jest.mock('../context/AppContext', () => ({
  ...jest.requireActual('../context/AppContext'),
  useApp: () => ({
    processDocumentWithClaude: jest.fn().mockResolvedValue({
      success: true,
      result: 'Processed content'
    }),
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

describe('DocumentViewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch document data
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 123;
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('renders loading state initially', () => {
    // Override setTimeout to not call the callback immediately
    jest.spyOn(global, 'setTimeout').mockImplementation(() => 123);
    
    renderWithProviders(<DocumentViewer />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  it('renders document details after loading', async () => {
    renderWithProviders(<DocumentViewer />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Financial Report Q1 2025.pdf')).toBeInTheDocument();
    });
    
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
  });
  
  it('switches between view and process tabs', async () => {
    renderWithProviders(<DocumentViewer />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Financial Report Q1 2025.pdf')).toBeInTheDocument();
    });
    
    // Initially on View tab
    expect(screen.getByText('This is a sample financial report for Q1 2025.')).toBeInTheDocument();
    
    // Switch to Process tab
    fireEvent.click(screen.getByText('Process with Claude'));
    
    expect(screen.getByText('Process Document with Claude')).toBeInTheDocument();
    expect(screen.getByText('Enter instructions for Claude to process this document.')).toBeInTheDocument();
  });
  
  it('processes document with Claude', async () => {
    renderWithProviders(<DocumentViewer />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Financial Report Q1 2025.pdf')).toBeInTheDocument();
    });
    
    // Switch to Process tab
    fireEvent.click(screen.getByText('Process with Claude'));
    
    // Enter instructions
    fireEvent.change(screen.getByLabelText('Instructions for Claude'), {
      target: { value: 'Summarize this document' }
    });
    
    // Click process button
    fireEvent.click(screen.getByText('Process Document'));
    
    // Should show processing state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.getByText('Document processed successfully')).toBeInTheDocument();
    });
    
    // Should show results
    expect(screen.getByText(/Processed content based on instruction/)).toBeInTheDocument();
  });
  
  it('shows error when processing with empty instructions', async () => {
    renderWithProviders(<DocumentViewer />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Financial Report Q1 2025.pdf')).toBeInTheDocument();
    });
    
    // Switch to Process tab
    fireEvent.click(screen.getByText('Process with Claude'));
    
    // Click process button without entering instructions
    fireEvent.click(screen.getByText('Process Document'));
    
    // Should show error
    expect(screen.getByText('Please enter an instruction for processing')).toBeInTheDocument();
  });
});
