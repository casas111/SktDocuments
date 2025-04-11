import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FileViewer from '../components/documents/FileViewer';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ fileId: 'dGVzdC9maWxlLnR4dA==' }), // Base64 encoded "test/file.txt"
  useNavigate: () => jest.fn()
}));

// Mock the fileService
jest.mock('../services/fileService', () => ({
  getMetadata: jest.fn().mockResolvedValue({
    data: {
      success: true,
      data: {
        name: 'file.txt',
        size: 1024,
        modifiedAt: '2025-04-11T02:00:00.000Z',
        createdAt: '2025-04-10T01:00:00.000Z',
        mimeType: 'text/plain'
      }
    }
  }),
  downloadFile: jest.fn().mockResolvedValue(true)
}));

describe('FileViewer Component', () => {
  test('renders file metadata correctly', async () => {
    render(
      <BrowserRouter>
        <FileViewer />
      </BrowserRouter>
    );
    
    // Wait for file data to load
    const fileName = await screen.findByText('file.txt');
    expect(fileName).toBeInTheDocument();
    
    // Check if other metadata is displayed
    expect(screen.getByText(/text\/plain/)).toBeInTheDocument();
    expect(screen.getByText(/1 KB/)).toBeInTheDocument();
    expect(screen.getByText(/Modified:/)).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    
    // Check if download button is present
    const downloadButton = screen.getByText('Download');
    expect(downloadButton).toBeInTheDocument();
  });
});
