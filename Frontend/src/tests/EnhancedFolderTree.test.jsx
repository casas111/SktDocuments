import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedFolderTree from '../components/documents/EnhancedFolderTree';

describe('EnhancedFolderTree', () => {
  const mockFolders = [
    { name: 'Documents', isDirectory: true, path: '/Documents' },
    { name: 'Images', isDirectory: true, path: '/Images' },
    { name: 'Projects', isDirectory: true, path: '/Projects' },
    { name: 'Projects/Project A', isDirectory: true, path: '/Projects/Project A' },
    { name: 'Projects/Project B', isDirectory: true, path: '/Projects/Project B' },
    { name: 'Archive', isDirectory: true, path: '/Archive' }
  ];
  
  const mockOnNavigate = jest.fn();
  const mockOnFolderCreated = jest.fn();
  const mockOnFolderRenamed = jest.fn();
  const mockOnFolderDeleted = jest.fn();
  const mockOnFolderMoved = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders folder tree correctly', () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Check if all top-level folders are displayed
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    
    // Current folder should be highlighted
    const documentsFolder = screen.getByText('Documents').closest('li');
    expect(documentsFolder).toHaveClass('selected');
  });
  
  test('navigates to folder when clicked', () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Click on Images folder
    fireEvent.click(screen.getByText('Images'));
    
    // Check if navigation callback was called with correct path
    expect(mockOnNavigate).toHaveBeenCalledWith('/Images');
  });
  
  test('expands and collapses folders', () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Projects folder should be collapsed initially
    expect(screen.queryByText('Project A')).not.toBeInTheDocument();
    
    // Click expand icon for Projects folder
    const expandIcons = screen.getAllByTestId('expand-icon');
    const projectsExpandIcon = expandIcons.find(icon => 
      icon.closest('li').textContent.includes('Projects')
    );
    fireEvent.click(projectsExpandIcon);
    
    // Subfolder should now be visible
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
    
    // Click collapse icon
    fireEvent.click(projectsExpandIcon);
    
    // Subfolder should be hidden again
    expect(screen.queryByText('Project A')).not.toBeInTheDocument();
  });
  
  test('shows context menu on right-click', () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Right-click on Images folder
    fireEvent.contextMenu(screen.getByText('Images'));
    
    // Context menu should be visible
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('New Subfolder')).toBeInTheDocument();
  });
  
  test('creates new folder', async () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Right-click on Images folder
    fireEvent.contextMenu(screen.getByText('Images'));
    
    // Click "New Subfolder" in context menu
    fireEvent.click(screen.getByText('New Subfolder'));
    
    // Dialog should appear
    expect(screen.getByText('Create New Folder')).toBeInTheDocument();
    
    // Enter folder name
    const input = screen.getByLabelText('Folder Name');
    fireEvent.change(input, { target: { value: 'New Folder' } });
    
    // Click Create button
    fireEvent.click(screen.getByText('Create'));
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockOnFolderCreated).toHaveBeenCalled();
    });
  });
  
  test('renames folder', async () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Right-click on Images folder
    fireEvent.contextMenu(screen.getByText('Images'));
    
    // Click "Rename" in context menu
    fireEvent.click(screen.getByText('Rename'));
    
    // Dialog should appear
    expect(screen.getByText('Rename Folder')).toBeInTheDocument();
    
    // Enter new folder name
    const input = screen.getByLabelText('New Name');
    fireEvent.change(input, { target: { value: 'Photos' } });
    
    // Click Rename button
    fireEvent.click(screen.getByText('Rename'));
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockOnFolderRenamed).toHaveBeenCalled();
    });
  });
  
  test('deletes folder', async () => {
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Right-click on Images folder
    fireEvent.contextMenu(screen.getByText('Images'));
    
    // Click "Delete" in context menu
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirmation dialog should appear
    expect(screen.getByText('Delete Folder')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    
    // Click Delete button
    fireEvent.click(screen.getByText('Delete', { selector: 'button' }));
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockOnFolderDeleted).toHaveBeenCalled();
    });
  });
  
  test('handles drag and drop', async () => {
    // Mock the HTML5 drag and drop API
    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue('/Images')
    };
    
    render(
      <EnhancedFolderTree
        folders={mockFolders}
        currentPath="/Documents"
        onNavigate={mockOnNavigate}
        onFolderCreated={mockOnFolderCreated}
        onFolderRenamed={mockOnFolderRenamed}
        onFolderDeleted={mockOnFolderDeleted}
        onFolderMoved={mockOnFolderMoved}
      />
    );
    
    // Start drag on Images folder
    fireEvent.dragStart(screen.getByText('Images'), { dataTransfer });
    
    // Drag over Projects folder
    fireEvent.dragOver(screen.getByText('Projects'));
    
    // Drop on Projects folder
    fireEvent.drop(screen.getByText('Projects'), { dataTransfer });
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockOnFolderMoved).toHaveBeenCalled();
    });
  });
});
