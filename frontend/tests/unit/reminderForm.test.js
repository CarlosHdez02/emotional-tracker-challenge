import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReminderForm from '../../components/ReminderForm';
import { ReminderContext } from '../../context/ReminderContext';

describe('ReminderForm', () => {
  const mockAddReminder = jest.fn();
  const defaultContextValue = {
    addReminder: mockAddReminder,
    loading: false
  };

  const renderWithContext = (contextValue = defaultContextValue) => {
    return render(
      <ReminderContext.Provider value={contextValue}>
        <ReminderForm />
      </ReminderContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });



  test('form inputs update correctly on change', async () => {
    renderWithContext();
    
    const titleInput = screen.getByLabelText('Title');
    const activityInput = screen.getByLabelText('Activity');
    const categorySelect = screen.getByLabelText('Category');
    const frequencySelect = screen.getByLabelText('Frequency');
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    
    await userEvent.type(titleInput, 'Morning Meditation');
    await userEvent.type(activityInput, 'Guided breathing');
    await userEvent.selectOptions(categorySelect, 'meditation');
    await userEvent.selectOptions(frequencySelect, 'daily');
    await userEvent.type(descriptionInput, 'Focus on mindfulness');
    
    expect(titleInput).toHaveValue('Morning Meditation');
    expect(activityInput).toHaveValue('Guided breathing');
    expect(categorySelect).toHaveValue('meditation');
    expect(frequencySelect).toHaveValue('daily');
    expect(descriptionInput).toHaveValue('Focus on mindfulness');
  });



  test('submits form with correct values', async () => {
    mockAddReminder.mockResolvedValue(true);
    renderWithContext();
    
    // Fill in form
    await userEvent.type(screen.getByLabelText('Title'), 'Test Reminder');
    await userEvent.type(screen.getByLabelText('Activity'), 'Test Activity');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'meditation');
    
    // Use a fixed date-time for testing
    const scheduledTimeInput = screen.getByLabelText('Scheduled Time');
    fireEvent.change(scheduledTimeInput, { target: { value: '2023-05-20T10:30' } });
    
    await userEvent.selectOptions(screen.getByLabelText('Frequency'), 'weekly');
    await userEvent.type(screen.getByLabelText('Description (Optional)'), 'Test Description');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Create Reminder' }));
    
    // Check if addReminder was called with correct args
    expect(mockAddReminder).toHaveBeenCalledWith({
      title: 'Test Reminder',
      activity: 'Test Activity',
      category: 'meditation',
      scheduledTime: '2023-05-20T10:30',
      frequency: 'weekly',
      description: 'Test Description'
    });
  });



});
