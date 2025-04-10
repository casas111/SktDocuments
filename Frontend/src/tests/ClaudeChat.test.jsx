import React from 'react';
import { render, screen } from '@testing-library/react';
import ClaudeChat from '../components/ClaudeChat';
import claudeService from '../services/claudeService';

// Mock the claudeService
jest.mock('../services/claudeService');

describe('ClaudeChat Component', () => {
  beforeEach(() => {
    // Mock the getAvailableModels method
    claudeService.getAvailableModels.mockResolvedValue([
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku'
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet'
      }
    ]);
  });

  test('renders the chat interface', async () => {
    render(<ClaudeChat />);
    
    // Check if the component title is rendered
    expect(screen.getByText('Claude AI Chat')).toBeInTheDocument();
    
    // Check if the input field is rendered
    expect(screen.getByPlaceholderText('Type your message to Claude...')).toBeInTheDocument();
    
    // Check if the send button is rendered
    expect(screen.getByText('Send')).toBeInTheDocument();
    
    // Check if the initial message is displayed
    expect(screen.getByText('Start a conversation with Claude AI')).toBeInTheDocument();
  });
});
