import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedUploadComponent from '../components/documents/EnhancedUploadComponent';
import EnhancedDownloadComponent from '../components/documents/EnhancedDownloadComponent';
import fileService from '../services/fileService';

// Mock the file service
jest.mock('../services/fileService');

describe('File Transfer Components', () => {
  describe('EnhancedUploadComponent', () => {
    const mockOnUploadComplete = jest.fn();
    const mockOnError = jest.fn();
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock successful upload
      fileService.uploadFile.mockResolvedValue({
        data: {
          success: true,
          data: {
            name: 'test-file.pdf',
            path: '/test-file.pdf',
            size: 1024000,
            mimeType: 'application/pdf'
          }
        }
      });
    });
    
    test('renders upload component correctly', () => {
      render(
        <EnhancedUploadComponent
          currentPath="/"
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />
      );
      
      // Check if upload zone is displayed
      expect(screen.getByText('Drag & Drop Files Here')).toBeInTheDocument();
      expect(screen.getByText('or')).toBeInTheDocument();
      expect(screen.getByText('Browse Files')).toBeInTheDocument();
    });
    
    test('handles file selection', async () => {
      render(
        <EnhancedUploadComponent
          currentPath="/"
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />
      );
      
      // Create a mock file
      const file = new File(['file content'], 'test-file.pdf', { type: 'application/pdf' });
      
      // Trigger file input change
      const input = screen.getByTestId('file-input');
      fireEvent.change(input, { target: { files: [file] } });
      
      // Check if file is added to the list
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
      
      // Click upload button
      fireEvent.click(screen.getByText('Upload Files'));
      
      // Check if upload API was called
      await waitFor(() => {
        expect(fileService.uploadFile).toHaveBeenCalled();
      });
      
      // Check if completion callback was called
      expect(mockOnUploadComplete).toHaveBeenCalledWith(1);
    });
    
    test('handles drag and drop', async () => {
      render(
        <EnhancedUploadComponent
          currentPath="/"
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />
      );
      
      // Create a mock file
      const file = new File(['file content'], 'test-file.pdf', { type: 'application/pdf' });
      
      // Mock DataTransfer object
      const dataTransfer = {
        files: [file],
        items: [
          {
            kind: 'file',
            type: 'application/pdf',
            getAsFile: () => file
          }
        ],
        types: ['Files']
      };
      
      // Trigger drag events
      const dropzone = screen.getByTestId('dropzone');
      fireEvent.dragEnter(dropzone, { dataTransfer });
      
      // Check if active drop zone styling is applied
      expect(dropzone).toHaveClass('active');
      
      // Trigger drop event
      fireEvent.drop(dropzone, { dataTransfer });
      
      // Check if file is added to the list
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
      
      // Click upload button
      fireEvent.click(screen.getByText('Upload Files'));
      
      // Check if upload API was called
      await waitFor(() => {
        expect(fileService.uploadFile).toHaveBeenCalled();
      });
      
      // Check if completion callback was called
      expect(mockOnUploadComplete).toHaveBeenCalledWith(1);
    });
    
    test('handles upload errors', async () => {
      // Mock upload failure
      fileService.uploadFile.mockRejectedValue(new Error('Upload failed'));
      
      render(
        <EnhancedUploadComponent
          currentPath="/"
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />
      );
      
      // Create a mock file
      const file = new File(['file content'], 'test-file.pdf', { type: 'application/pdf' });
      
      // Trigger file input change
      const input = screen.getByTestId('file-input');
      fireEvent.change(input, { target: { files: [file] } });
      
      // Click upload button
      fireEvent.click(screen.getByText('Upload Files'));
      
      // Check if error callback was called
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
  });
  
  describe('EnhancedDownloadComponent', () => {
    const mockOnDownloadComplete = jest.fn();
    const mockOnError = jest.fn();
    
    const selectedItems = [
      { name: 'test-file.pdf', isDirectory: false, path: '/test-file.pdf', size: 1024000 },
      { name: 'image.jpg', isDirectory: false, path: '/image.jpg', size: 512000 }
    ];
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock successful download
      fileService.downloadFile.mockResolvedValue({
        data: new Blob(['file content'], { type: 'application/pdf' }),
        headers: {
          'content-disposition': 'attachment; filename="test-file.pdf"'
        }
      });
      
      fileService.downloadMultipleFiles.mockResolvedValue({
        data: new Blob(['zip content'], { type: 'application/zip' }),
        headers: {
          'content-disposition': 'attachment; filename="download.zip"'
        }
      });
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      // Mock document.createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };
      document.createElement = jest.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return document.createElement(tag);
      });
    });
    
    test('renders download button correctly', () => {
      render(
        <EnhancedDownloadComponent
          selectedItems={selectedItems}
          currentPath="/"
          onDownloadComplete={mockOnDownloadComplete}
          onError={mockOnError}
        />
      );
      
      // Check if download button is displayed
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
    
    test('downloads single file', async () => {
      render(
        <EnhancedDownloadComponent
          selectedItems={[selectedItems[0]]}
          currentPath="/"
          onDownloadComplete={mockOnDownloadComplete}
          onError={mockOnError}
        />
      );
      
      // Click download button
      fireEvent.click(screen.getByText('Download'));
      
      // Check if download API was called
      await waitFor(() => {
        expect(fileService.downloadFile).toHaveBeenCalledWith('/test-file.pdf');
      });
      
      // Check if completion callback was called
      expect(mockOnDownloadComplete).toHaveBeenCalledWith(1);
    });
    
    test('downloads multiple files as zip', async () => {
      render(
        <EnhancedDownloadComponent
          selectedItems={selectedItems}
          currentPath="/"
          onDownloadComplete={mockOnDownloadComplete}
          onError={mockOnError}
        />
      );
      
      // Click download button
      fireEvent.click(screen.getByText('Download'));
      
      // Check if download API was called
      await waitFor(() => {
        expect(fileService.downloadMultipleFiles).toHaveBeenCalledWith(
          expect.arrayContaining(['/test-file.pdf', '/image.jpg'])
        );
      });
      
      // Check if completion callback was called
      expect(mockOnDownloadComplete).toHaveBeenCalledWith(2);
    });
    
    test('handles download errors', async () => {
      // Mock download failure
      fileService.downloadFile.mockRejectedValue(new Error('Download failed'));
      
      render(
        <EnhancedDownloadComponent
          selectedItems={[selectedItems[0]]}
          currentPath="/"
          onDownloadComplete={mockOnDownloadComplete}
          onError={mockOnError}
        />
      );
      
      // Click download button
      fireEvent.click(screen.getByText('Download'));
      
      // Check if error callback was called
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
    
    test('disables button when no items selected', () => {
      render(
        <EnhancedDownloadComponent
          selectedItems={[]}
          currentPath="/"
          onDownloadComplete={mockOnDownloadComplete}
          onError={mockOnError}
        />
      );
      
      // Check if download button is disabled
      expect(screen.getByText('Download').closest('button')).toBeDisabled();
    });
  });
});
