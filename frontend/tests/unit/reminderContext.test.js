import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { ReminderContext, ReminderProvider } from '../../context/ReminderContext';
import Reminders from '../../services/reminder';

// Mock the Reminders service
jest.mock('../services/reminder');

describe('ReminderContext', () => {
  // Set up mock implementation for Reminders service
  const mockReminders = [
    { _id: '1', title: 'Test 1', activity: 'Activity 1', status: false },
    { _id: '2', title: 'Test 2', activity: 'Activity 2', status: true }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock implementations
    Reminders.mockImplementation(() => ({
      getUserReminder: jest.fn().mockResolvedValue({ data: mockReminders }),
      createNewReminder: jest.fn().mockImplementation(data => Promise.resolve({ ...data, _id: '3' })),
      updateUserReminder: jest.fn().mockImplementation((id, data) => Promise.resolve({ ...data, _id: id })),
      updateReminderStatus: jest.fn().mockResolvedValue(true),
      getUserReminderById: jest.fn().mockImplementation(id => 
        Promise.resolve(mockReminders.find(r => r._id === id) || null)
      )
    }));
  });

  test('provides the context value', () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Check if all expected properties exist
    expect(contextValue).toHaveProperty('reminders');
    expect(contextValue).toHaveProperty('loading');
    expect(contextValue).toHaveProperty('error');
    expect(contextValue).toHaveProperty('getReminders');
    expect(contextValue).toHaveProperty('addReminder');
    expect(contextValue).toHaveProperty('updateReminder');
    expect(contextValue).toHaveProperty('toggleReminderStatus');
    expect(contextValue).toHaveProperty('getReminderById');
    expect(contextValue).toHaveProperty('clearError');
  });

  test('loads reminders on initial render', async () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Initially loading should be true
    expect(contextValue.loading).toBe(true);
    
    await waitFor(() => {
      // After loading completes
      expect(contextValue.loading).toBe(false);
      expect(contextValue.reminders).toEqual(mockReminders);
    });
  });

  test('addReminder adds a new reminder', async () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
    
    // Add a new reminder
    const newReminderData = {
      title: 'New Reminder',
      activity: 'New Activity',
      category: 'meditation'
    };
    
    let result;
    await act(async () => {
      result = await contextValue.addReminder(newReminderData);
    });
    
    expect(result).toBe(true);
    
    // Check if the reminder service was called correctly
    const reminderService = Reminders.mock.instances[0];
    expect(reminderService.createNewReminder).toHaveBeenCalledWith(newReminderData);
    
    // Check if the state was updated
    await waitFor(() => {
      expect(contextValue.reminders[0]).toEqual({ ...newReminderData, _id: '3' });
    });
  });

  test('updateReminder updates an existing reminder', async () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
    
    // Update a reminder
    const updatedData = {
      title: 'Updated Title',
      activity: 'Updated Activity'
    };
    
    let result;
    await act(async () => {
      result = await contextValue.updateReminder('1', updatedData);
    });
    
    expect(result).toBe(true);
    
    // Check if the reminder service was called correctly
    const reminderService = Reminders.mock.instances[0];
    expect(reminderService.updateUserReminder).toHaveBeenCalledWith('1', updatedData);
  });

  test('toggleReminderStatus updates the status of a reminder', async () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
    
    // Toggle a reminder status
    let result;
    await act(async () => {
      result = await contextValue.toggleReminderStatus('1', true);
    });
    
    expect(result).toBe(true);
    
    // Check if the reminder service was called correctly
    const reminderService = Reminders.mock.instances[0];
    expect(reminderService.updateReminderStatus).toHaveBeenCalledWith('1', { status: true });
    
    // Check if the state was updated
    await waitFor(() => {
      const updatedReminder = contextValue.reminders.find(r => r._id === '1');
      expect(updatedReminder.status).toBe(true);
    });
  });

  test('getReminderById retrieves a specific reminder', async () => {
    let contextValue;
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
    
    // Get a reminder by ID
    let result;
    await act(async () => {
      result = await contextValue.getReminderById('1');
    });
    
    expect(result).toEqual(mockReminders[0]);
    
    // Check if the reminder service was called correctly
    const reminderService = Reminders.mock.instances[0];
    expect(reminderService.getUserReminderById).toHaveBeenCalledWith('1');
  });

  test('clearError clears error state', async () => {
    let contextValue;
    
    // Mock implementation to cause an error
    Reminders.mockImplementation(() => ({
      getUserReminder: jest.fn().mockRejectedValue(new Error('Test error'))
    }));
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for error to be set
    await waitFor(() => {
      expect(contextValue.error).toBe('Error loading reminders');
    });
    
    // Clear error
    act(() => {
      contextValue.clearError();
    });
    
    expect(contextValue.error).toBe(null);
  });

  test('handles errors when fetching reminders', async () => {
    let contextValue;
    
    // Mock implementation to cause an error
    Reminders.mockImplementation(() => ({
      getUserReminder: jest.fn().mockRejectedValue(new Error('Test error'))
    }));
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    await waitFor(() => {
      expect(contextValue.error).toBe('Error loading reminders');
      expect(contextValue.loading).toBe(false);
    });
  });

  test('handles errors when adding a reminder', async () => {
    let contextValue;
    
    Reminders.mockImplementation(() => ({
      getUserReminder: jest.fn().mockResolvedValue({ data: mockReminders }),
      createNewReminder: jest.fn().mockRejectedValue(new Error('Test error'))
    }));
    
    render(
      <ReminderProvider>
        <ReminderContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ReminderContext.Consumer>
      </ReminderProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(contextValue.loading).toBe(false);
    });
    
    // Attempt to add a reminder
    let result;
    await act(async () => {
      result = await contextValue.addReminder({ title: 'Test' });
    });
    
    expect(result).toBe(false);
    expect(contextValue.error).toBe('Error adding reminder');
  });
});