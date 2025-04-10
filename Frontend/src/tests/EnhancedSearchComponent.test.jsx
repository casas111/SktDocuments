import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedSearchComponent from '../components/documents/EnhancedSearchComponent';
import fileService from '../services/fileService';

// Mock the file service
jest.mock('../services/fileService');

describe('EnhancedSearchComponent', () => {
  const mockOnSearch = jest.fn();
  const mockOnResultClick = jest.fn();
  const mockOnClearSearch = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;
    
    // Mock search results
    fileService.searchFiles.mockResolvedValue({
      data: {
        success: true,
        data: [
          { 
            name: 'test-document.pdf', 
            isDirectory: false, 
            size: 1024000, 
            path: '/test-document.pdf', 
            modifiedAt: '2025-04-09T15:30:00Z',
            matchContext: 'This is a test document with important information'
          },
          { 
            name: 'test-image.jpg', 
            isDirectory: false, 
            size: 512000, 
            path: '/images/test-image.jpg', 
            modifiedAt: '2025-04-08T09:45:00Z'
          },
          { 
            name: 'Test Folder', 
            isDirectory: true, 
            path: '/Test Folder', 
            modifiedAt: '2025-04-10T10:00:00Z'
          }
        ]
      }
    });
  });
  
  test('renders search input correctly', () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Check if search input is rendered
    expect(screen.getByPlaceholderText('Search files and folders...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
  });
  
  test('performs search and displays results', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Check if onSearch callback was called with results
    expect(mockOnSearch).toHaveBeenCalled();
    
    // Check if search results are displayed
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
    
    // Check if match context is displayed
    expect(screen.getByText('This is a test document with important information')).toBeInTheDocument();
  });
  
  test('handles clicking on search result', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Click on a search result
    fireEvent.click(screen.getByText('test-document.pdf'));
    
    // Check if onResultClick callback was called with the correct result
    expect(mockOnResultClick).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-document.pdf',
        path: '/test-document.pdf'
      })
    );
  });
  
  test('clears search when clear button is clicked', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    // Check if search input is cleared
    expect(searchInput.value).toBe('');
    
    // Check if onClearSearch callback was called
    expect(mockOnClearSearch).toHaveBeenCalled();
  });
  
  test('opens filter popover when filter button is clicked', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Click filter button
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    // Check if filter popover is displayed
    expect(screen.getByText('Filter Options')).toBeInTheDocument();
    expect(screen.getByText('File Type')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('File Size')).toBeInTheDocument();
  });
  
  test('opens sort menu when sort button is clicked', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Click sort button
    const sortButton = screen.getByRole('button', { name: /sort/i });
    fireEvent.click(sortButton);
    
    // Check if sort menu is displayed
    expect(screen.getByText('Relevance')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Date Modified')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
  });
  
  test('applies filters to search', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for initial search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Reset mock to prepare for filtered search
    fileService.searchFiles.mockClear();
    
    // Click filter button
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    // Select document filter
    const documentCheckbox = screen.getByLabelText('Document');
    fireEvent.click(documentCheckbox);
    
    // Apply filters
    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyButton);
    
    // Check if search was performed with filters
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
          types: ['document']
        })
      );
    });
  });
  
  test('saves and applies saved searches', async () => {
    render(
      <EnhancedSearchComponent
        onSearch={mockOnSearch}
        onResultClick={mockOnResultClick}
        onClearSearch={mockOnClearSearch}
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalled();
    });
    
    // Save the search
    const saveButton = screen.getByRole('button', { name: /save search/i });
    fireEvent.click(saveButton);
    
    // Check if search was saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'savedSearches',
      expect.any(String)
    );
    
    // Clear search
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    // Mock localStorage to return saved searches
    localStorage.getItem.mockReturnValue(JSON.stringify([
      {
        query: 'test',
        filters: { types: [], dateRange: { from: null, to: null }, sizeRange: { min: null, max: null }, owner: null },
        sort: 'relevance',
        direction: 'desc',
        timestamp: new Date().toISOString()
      }
    ]));
    
    // Focus on empty search input to show saved searches
    fireEvent.focus(searchInput);
    
    // Check if saved searches are displayed
    expect(screen.getByText('Saved Searches')).toBeInTheDocument();
    
    // Click on saved search
    fireEvent.click(screen.getByText('test'));
    
    // Check if search was performed with saved parameters
    await waitFor(() => {
      expect(fileService.searchFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test'
        })
      );
    });
  });
});
