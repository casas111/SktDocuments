import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMetadataDisplay from '../components/documents/EnhancedMetadataDisplay';
import fileService from '../services/fileService';

// Mock the file service
jest.mock('../services/fileService');

describe('EnhancedMetadataDisplay', () => {
  const mockOnDownload = jest.fn();
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnShare = jest.fn();
  
  const fileItem = {
    name: 'test-document.pdf',
    isDirectory: false,
    size: 1024000,
    modifiedAt: '2025-04-09T15:30:00Z',
    path: '/test-document.pdf'
  };
  
  const folderItem = {
    name: 'Test Folder',
    isDirectory: true,
    modifiedAt: '2025-04-10T10:00:00Z',
    path: '/Test Folder'
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock metadata API response for file
    fileService.getMetadata.mockImplementation((path) => {
      if (path.includes('test-document.pdf')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              name: 'test-document.pdf',
              isDirectory: false,
              size: 1024000,
              mimeType: 'application/pdf',
              createdAt: '2025-04-09T15:00:00Z',
              modifiedAt: '2025-04-09T15:30:00Z',
              accessedAt: '2025-04-10T08:15:00Z',
              path: '/test-document.pdf',
              attributes: {
                author: 'John Doe',
                pageCount: 42,
                keywords: 'test, document, pdf'
              },
              permissions: {
                read: true,
                write: true,
                execute: false,
                owner: true
              }
            }
          }
        });
      } else if (path.includes('Test Folder')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              name: 'Test Folder',
              isDirectory: true,
              createdAt: '2025-04-10T09:30:00Z',
              modifiedAt: '2025-04-10T10:00:00Z',
              path: '/Test Folder',
              itemCount: 5,
              contents: [
                { name: 'Subfolder', isDirectory: true },
                { name: 'document1.docx', isDirectory: false, size: 256000 },
                { name: 'document2.xlsx', isDirectory: false, size: 512000 },
                { name: 'image.jpg', isDirectory: false, size: 1048576 },
                { name: 'presentation.pptx', isDirectory: false, size: 768000 }
              ]
            }
          }
        });
      }
    });
    
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      },
      writable: true
    });
  });
  
  test('renders file metadata correctly', async () => {
    render(
      <EnhancedMetadataDisplay
        item={fileItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(fileService.getMetadata).toHaveBeenCalled();
    });
    
    // Check if basic file information is displayed
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF File')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    
    // Check if dates are displayed
    expect(screen.getByText(/April 9, 2025/)).toBeInTheDocument(); // Created date
    
    // Check if additional attributes are displayed
    expect(screen.getByText('author:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('pageCount:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Check if permissions are displayed
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Write')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });
  
  test('renders folder metadata correctly', async () => {
    render(
      <EnhancedMetadataDisplay
        item={folderItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(fileService.getMetadata).toHaveBeenCalled();
    });
    
    // Check if basic folder information is displayed
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
    expect(screen.getByText('Folder')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
    
    // Check if dates are displayed
    expect(screen.getByText(/April 10, 2025/)).toBeInTheDocument(); // Created date
    
    // Check if folder contents tab is available
    const contentsTab = screen.getByText('Contents');
    fireEvent.click(contentsTab);
    
    // Check if folder contents are displayed
    expect(screen.getByText('Subfolder')).toBeInTheDocument();
    expect(screen.getByText('document1.docx')).toBeInTheDocument();
    expect(screen.getByText('document2.xlsx')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
    expect(screen.getByText('presentation.pptx')).toBeInTheDocument();
  });
  
  test('handles action buttons correctly', async () => {
    render(
      <EnhancedMetadataDisplay
        item={fileItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(fileService.getMetadata).toHaveBeenCalled();
    });
    
    // Test Download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    expect(mockOnDownload).toHaveBeenCalled();
    
    // Test Rename button
    const renameButton = screen.getByText('Rename');
    fireEvent.click(renameButton);
    expect(mockOnRename).toHaveBeenCalled();
    
    // Test Share button
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    expect(mockOnShare).toHaveBeenCalled();
    
    // Test Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalled();
  });
  
  test('copies path to clipboard', async () => {
    render(
      <EnhancedMetadataDisplay
        item={fileItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(fileService.getMetadata).toHaveBeenCalled();
    });
    
    // Test Copy Path button
    const copyPathButton = screen.getByText('Copy Path');
    fireEvent.click(copyPathButton);
    
    // Check if clipboard API was called with the correct path
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('/test-document.pdf');
  });
  
  test('handles loading state correctly', () => {
    // Mock getMetadata to return a pending promise
    fileService.getMetadata.mockImplementation(() => new Promise(() => {}));
    
    render(
      <EnhancedMetadataDisplay
        item={fileItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('handles error state correctly', async () => {
    // Mock getMetadata to return an error
    fileService.getMetadata.mockRejectedValue(new Error('Failed to load metadata'));
    
    render(
      <EnhancedMetadataDisplay
        item={fileItem}
        currentPath="/"
        onDownload={mockOnDownload}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading metadata/)).toBeInTheDocument();
    });
  });
});
