import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '../src/store/slices/documentsSlice';
import workflowsReducer from '../src/store/slices/workflowsSlice';
import uiReducer from '../src/store/slices/uiSlice';
import WorkflowsPage from '../src/pages/WorkflowsPage';
import { BrowserRouter } from 'react-router-dom';

// Mock react-flow
jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }) => <div>{children}</div>,
  Background: () => <div data-testid="react-flow-background"></div>,
  Controls: () => <div data-testid="react-flow-controls"></div>,
  MiniMap: () => <div data-testid="react-flow-minimap"></div>,
  Panel: ({ children }) => <div data-testid="react-flow-panel">{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  ReactFlow: ({ children }) => <div data-testid="react-flow">{children}</div>,
}));

// Mock axios
jest.mock('axios');

describe('Integration Test: WorkflowsPage', () => {
  let store;

  beforeEach(() => {
    // Create a test store with the necessary reducers
    store = configureStore({
      reducer: {
        documents: documentsReducer,
        workflows: workflowsReducer,
        ui: uiReducer,
      },
    });
  });

  it('renders the workflows page with canvas and node palette', async () => {
    // Arrange & Act
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WorkflowsPage />
        </BrowserRouter>
      </Provider>
    );

    // Assert
    expect(screen.getByText(/Workflows/i)).toBeInTheDocument();
    expect(screen.getByText(/Node Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Transformation Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparison Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Simetrik Integration Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Communication Node/i)).toBeInTheDocument();
  });

  it('allows creating a new workflow', async () => {
    // Arrange
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WorkflowsPage />
        </BrowserRouter>
      </Provider>
    );

    // Act
    fireEvent.click(screen.getByText(/New Workflow/i));
    
    // Fill in the workflow name
    const nameInput = screen.getByLabelText(/Workflow Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Create/i));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Test Workflow/i)).toBeInTheDocument();
    });
  });

  it('displays the workflow canvas when a workflow is selected', async () => {
    // Arrange
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WorkflowsPage />
        </BrowserRouter>
      </Provider>
    );

    // Act
    // First create a workflow
    fireEvent.click(screen.getByText(/New Workflow/i));
    const nameInput = screen.getByLabelText(/Workflow Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });
    fireEvent.click(screen.getByText(/Create/i));
    
    // Then select it
    await waitFor(() => {
      const workflowItem = screen.getByText(/Test Workflow/i);
      fireEvent.click(workflowItem);
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('react-flow-minimap')).toBeInTheDocument();
      expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();
    });
  });
});
