import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentsDrive from '../components/documents/DocumentsDrive';
import fileService from '../services/fileService';

// Mock the file service
jest.mock('../services/fileService');

describe('DocumentsDrive Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful API responses
    fileService.getDirectoryContents.mockResolvedValue({
      data: {
        success: true,
        data: [
          { name: 'Test Folder', isDirectory: true, modifiedAt: '2025-04-10T10:00:00Z' },
          { name: 'test-document.pdf', isDirectory: false, size: 1024000, modifiedAt: '2025-04-09T15:30:00Z' },
          { name: 'image.jpg', isDirectory: false, size: 512000, modifiedAt: '2025-04-08T09:45:00Z' }
        ]
      }
    });
    
    fileService.getMetadata.mockResolvedValue({
      data: {
        success: true,
        data: {
          name: 'test-document.pdf',
          isDirectory: false,
          size: 1024000,
          type: 'application/pdf',
          createdAt: '2025-04-09T15:00:00Z',
          modifiedAt: '2025-04-09T15:30:00Z',
          path: '/test-document.pdf'
        }
      }
    });
  });
  
  test('renders document drive with folder and files', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Check if folder and files are displayed
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
  });
  
  test('navigates to folder when clicked', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Reset mock to prepare for the next API call
    fileService.getDirectoryContents.mockClear();
    
    // Mock response for folder contents
    fileService.getDirectoryContents.mockResolvedValue({
      data: {
        success: true,
        data: [
          { name: 'Subfolder', isDirectory: true, modifiedAt: '2025-04-10T10:00:00Z' },
          { name: 'document-in-folder.docx', isDirectory: false, size: 256000, modifiedAt: '2025-04-09T14:20:00Z' }
        ]
      }
    });
    
    // Click on the folder
    fireEvent.click(screen.getByText('Test Folder'));
    
    // Check if the API was called with the correct path
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalledWith('/Test Folder', expect.anything());
    });
    
    // Check if new folder contents are displayed
    expect(screen.getByText('Subfolder')).toBeInTheDocument();
    expect(screen.getByText('document-in-folder.docx')).toBeInTheDocument();
  });
  
  test('shows file metadata when file is selected', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Click on a file to select it
    fireEvent.click(screen.getByText('test-document.pdf'));
    
    // Check if metadata sidebar is opened
    await waitFor(() => {
      expect(fileService.getMetadata).toHaveBeenCalled();
    });
    
    // The metadata sidebar should be visible with file details
    // Note: This might need adjustment based on how the metadata sidebar is implemented
    expect(screen.getByText('File Information')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument(); // Formatted size
  });
  
  test('creates a new folder', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Mock successful folder creation
    fileService.createFolder.mockResolvedValue({
      data: {
        success: true
      }
    });
    
    // Click on New Folder button
    fireEvent.click(screen.getByText('New Folder'));
    
    // Enter folder name in dialog
    fireEvent.change(screen.getByLabelText('Folder Name'), { target: { value: 'New Test Folder' } });
    
    // Click Create button
    fireEvent.click(screen.getByText('Create'));
    
    // Check if the API was called with the correct parameters
    await waitFor(() => {
      expect(fileService.createFolder).toHaveBeenCalledWith('/', 'New Test Folder');
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Folder created successfully')).toBeInTheDocument();
  });
  
  test('uploads files', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Click on Upload button
    fireEvent.click(screen.getByText('Upload'));
    
    // Check if upload dialog is opened
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    
    // Note: Testing actual file upload would require more complex setup
    // This is a simplified test that just checks if the dialog opens
  });
  
  test('searches for files', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Mock search results
    fileService.searchFiles.mockResolvedValue({
      data: {
        success: true,
        data: [
          { name: 'test-document.pdf', isDirectory: false, size: 1024000, path: '/test-document.pdf', modifiedAt: '2025-04-09T15:30:00Z' }
        ]
      }
    });
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test-document' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Check if search results are displayed
    expect(screen.getByText('Search Results (1)')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });
  
  test('toggles between grid and list views', async () => {
    render(<DocumentsDrive />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(fileService.getDirectoryContents).toHaveBeenCalled();
    });
    
    // Default view should be grid
    expect(screen.getByTestId('grid-view')).toHaveClass('active');
    
    // Click on list view button
    fireEvent.click(screen.getByTestId('list-view-button'));
    
    // List view should now be active
    expect(screen.getByTestId('list-view')).toHaveClass('active');
    
    // Click on grid view button
    fireEvent.click(screen.getByTestId('grid-view-button'));
    
    // Grid view should now be active again
    expect(screen.getByTestId('grid-view')).toHaveClass('active');
  });
});
