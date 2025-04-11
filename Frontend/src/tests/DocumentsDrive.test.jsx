import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentsDrive from '../components/documents/DocumentsDrive';

// Mock the fileService
jest.mock('../services/fileService', () => ({
  getDirectoryContents: jest.fn().mockResolvedValue({
    data: {
      success: true,
      data: [
        {
          name: 'test-file.txt',
          isDirectory: false,
          size: 2048,
          modifiedAt: '2025-04-11T01:00:00.000Z'
        },
        {
          name: 'test-folder',
          isDirectory: true,
          modifiedAt: '2025-04-10T01:00:00.000Z'
        }
      ]
    }
  }),
  getFileUrl: jest.fn().mockImplementation((path) => `/file/${btoa(encodeURIComponent(path))}`),
  downloadFile: jest.fn().mockResolvedValue(true)
}));

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

describe('DocumentsDrive Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders files and folders correctly', async () => {
    render(
      <BrowserRouter>
        <DocumentsDrive />
      </BrowserRouter>
    );
    
    // Wait for content to load
    const fileName = await screen.findByText('test-file.txt');
    expect(fileName).toBeInTheDocument();
    
    const folderName = screen.getByText('test-folder');
    expect(folderName).toBeInTheDocument();
  });

  test('view button opens file in new tab with correct URL', async () => {
    render(
      <BrowserRouter>
        <DocumentsDrive />
      </BrowserRouter>
    );
    
    // Wait for content to load
    await screen.findByText('test-file.txt');
    
    // Find and click the View button
    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);
    
    // Check if window.open was called with the correct URL
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining('/file/'), '_blank');
  });
});
