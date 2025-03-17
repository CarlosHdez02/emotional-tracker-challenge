import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReminderList from '../../components/ReminderList';
import { ReminderContext } from '../../context/ReminderContext';
import userEvent from '@testing-library/user-event';

// Mock data for testing
const mockReminders = [
  {
    _id: '1',
    title: 'Exercise',
    category: 'Health',
    scheduledTime: '2025-03-16T10:00:00Z',
    frequency: 'Daily',
    activity: 'Go for a run',
    description: 'Morning jog in the park',
    isCompleted: false
  },
  {
    _id: '2',
    title: 'Read Book',
    category: 'Self-improvement',
    scheduledTime: '2025-03-16T18:00:00Z',
    frequency: 'Weekly',
    activity: 'Read 30 pages',
    description: 'Read from current book',
    isCompleted: true
  }
];

// Mock the context
const createMockContext = (overrides = {}) => ({
  reminders: mockReminders,
  loading: false,
  error: null,
  getReminders: jest.fn(),
  toggleReminderStatus: jest.fn().mockImplementation(() => Promise.resolve(true)),
  ...overrides
});

// Helper to render with context
const renderWithContext = (ui, contextValue) => {
  return render(
    <ReminderContext.Provider value={contextValue}>
      {ui}
    </ReminderContext.Provider>
  );
};

describe('ReminderList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders loading state correctly', () => {
    const contextValue = createMockContext({ loading: true });
    renderWithContext(<ReminderList />, contextValue);
    
    expect(screen.getByText('Loading reminders...')).toBeInTheDocument();
    expect(contextValue.getReminders).toHaveBeenCalledTimes(1);
  });

  test('renders error state correctly', () => {
    const contextValue = createMockContext({ error: 'Failed to load reminders' });
    renderWithContext(<ReminderList />, contextValue);
    
    expect(screen.getByText(/Error loading reminders/)).toBeInTheDocument();
    expect(screen.getByText('Failed to load reminders')).toBeInTheDocument();
  });

  test('renders empty state when no reminders exist', () => {
    const contextValue = createMockContext({ reminders: [] });
    renderWithContext(<ReminderList />, contextValue);
    
    expect(screen.getByText('No reminders yet. Create one to get started!')).toBeInTheDocument();
  });

  test('renders reminder list correctly', () => {
    const contextValue = createMockContext();
    renderWithContext(<ReminderList />, contextValue);
    
    // Check if titles are rendered
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Read Book')).toBeInTheDocument();
    
    // Check if categories are rendered
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Self-improvement')).toBeInTheDocument();
    
    // Check for activities
    expect(screen.getByText(/Go for a run/)).toBeInTheDocument();
    expect(screen.getByText(/Read 30 pages/)).toBeInTheDocument();
    
    // Check for descriptions
    expect(screen.getByText('Morning jog in the park')).toBeInTheDocument();
    expect(screen.getByText('Read from current book')).toBeInTheDocument();
    
    // Check status buttons
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('calls toggleReminderStatus when status button is clicked', async () => {
    const toggleReminderStatus = jest.fn().mockResolvedValue(true);
    const contextValue = createMockContext({ toggleReminderStatus });
    renderWithContext(<ReminderList />, contextValue);
    
    // Click the button for incomplete reminder
    const incompleteButton = screen.getByText('Incomplete');
    fireEvent.click(incompleteButton);
    
    // Check if toggleReminderStatus was called with correct params
    expect(toggleReminderStatus).toHaveBeenCalledWith('1', true);
    
    // Wait for button to show loading state
    expect(await screen.findByText('Updating...')).toBeInTheDocument();
    
    // Fast-forward to finish the loading state
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    });

    // Check for success message
    expect(screen.getByText('Complete')).toBeInTheDocument();
    
    // Fast-forward to clear the message
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    });
  });

  test('shows error message when toggle status fails', async () => {
    const toggleReminderStatus = jest.fn().mockRejectedValue(new Error('Failed'));
    const contextValue = createMockContext({ toggleReminderStatus });
    renderWithContext(<ReminderList />, contextValue);
    
    // Click the button for incomplete reminder
    const incompleteButton = screen.getByText('Incomplete');
    fireEvent.click(incompleteButton);
    
    // Check if toggleReminderStatus was called
    expect(toggleReminderStatus).toHaveBeenCalledWith('1', true);
    
    // Wait for error message to appear
    expect(await screen.findByText('Error updating status')).toBeInTheDocument();
  });
  
  test('shows error when toggleReminderStatus returns false', async () => {
    const toggleReminderStatus = jest.fn().mockResolvedValue(false);
    const contextValue = createMockContext({ toggleReminderStatus });
    renderWithContext(<ReminderList />, contextValue);
    
    // Click the button
    const incompleteButton = screen.getByText('Incomplete');
    fireEvent.click(incompleteButton);
    
    // Wait for error message
    expect(await screen.findByText('Failed to update status')).toBeInTheDocument();
  });

  test('displays formatted date correctly', () => {
    const contextValue = createMockContext();
    renderWithContext(<ReminderList />, contextValue);
    
    // Get the scheduled time from mock data and format it
    const date = new Date('2025-03-16T10:00:00Z');
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // This will depend on the user's locale, so we need to use a partial match
    // We use .toBeInTheDocument() to handle the dynamic date formatting
    const formattedDateParts = date.toLocaleDateString(undefined, options).split(' ');
    formattedDateParts.forEach(part => {
      const regex = new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const elements = screen.getAllByText(regex);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
  
  test('renders completed reminder with proper styling', () => {
    const contextValue = createMockContext();
    renderWithContext(<ReminderList />, contextValue);
    
    // Get the completed reminder title
    const completedTitle = screen.getByText('Read Book');
    
    // Check if it has line-through style (indirect way to check - checking parent)
    expect(completedTitle).toHaveStyle('text-decoration: line-through');
    
    // Check if the parent card has completed styling
    // Note: This is a bit tricky to test directly with styled-components
    const completedCard = completedTitle.closest('div');
    expect(completedCard).toHaveStyle('opacity: 0.7');
  });

  test('handles getReminders useEffect hook', () => {
    const getReminders = jest.fn();
    const contextValue = createMockContext({ getReminders });
    renderWithContext(<ReminderList />, contextValue);
    
    expect(getReminders).toHaveBeenCalledTimes(1);
  });
  
  test('button should be disabled while toggling status', async () => {
    // Create a toggleReminderStatus function that doesn't resolve immediately
    const toggleReminderStatus = jest.fn().mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    }));
    
    const contextValue = createMockContext({ toggleReminderStatus });
    renderWithContext(<ReminderList />, contextValue);
    
    // Get the button and click it
    const incompleteButton = screen.getByText('Incomplete');
    fireEvent.click(incompleteButton);
    
    // The button should now be disabled
    await waitFor(() => {
      expect(incompleteButton).toBeDisabled();
    });
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    
    // The button should now be enabled again
    await waitFor(() => {
      const updatedButton = screen.getByText('Incomplete');
      expect(updatedButton).not.toBeDisabled();
    });
  });
  
  test('handles non-array reminders gracefully', () => {
    const contextValue = createMockContext({ reminders: null });
    renderWithContext(<ReminderList />, contextValue);
    
    expect(screen.getByText('No reminders yet. Create one to get started!')).toBeInTheDocument();
  });
});