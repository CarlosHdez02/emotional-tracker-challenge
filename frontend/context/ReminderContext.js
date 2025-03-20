import React, { createContext, useState, useEffect } from 'react';
import Reminders from '../services/reminder'; 

// Create context
export const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize reminders service
  const reminderService = new Reminders();

  // Get all reminders for the logged-in user
  const getReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedReminders = await reminderService.getUserReminder();
      const reminderData = fetchedReminders.data || fetchedReminders;
      
      // Sort reminders by creation date (newest first)
      const sortedReminders = Array.isArray(reminderData) ? 
        [...reminderData].sort((a, b) => new Date(b.createdAt || b.scheduledTime) - new Date(a.createdAt || a.scheduledTime)) : 
        [];
        
      setReminders(sortedReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setError("Error loading reminders");
    } finally {
      setLoading(false);
    }
  };

  // Add new reminder
  const addReminder = async (reminderData) => {
    setLoading(true);
    try {
      const response = await reminderService.createNewReminder(reminderData);
      
      // Handle different response structures
      const newReminder = response.data || response;
      
      if (newReminder) {
      
        setReminders(prevReminders => {
          const updatedReminders = Array.isArray(prevReminders) ? 
            [newReminder, ...prevReminders] : 
            [newReminder];
            
          return updatedReminders;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding reminder:", error);
      setError("Error adding reminder");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update existing reminder
  const updateReminder = async (reminderId, reminderData) => {
    setLoading(true);
    try {
      const response = await reminderService.updateUserReminder(reminderId, reminderData);
      
      // Handle different response structures
      const updatedReminder = response.data || response;

      if (updatedReminder) {
        setReminders(prevReminders => {
          if (!Array.isArray(prevReminders)) return [updatedReminder];

          return prevReminders.map(reminder => 
            reminder.id === reminderId || reminder._id === reminderId ? updatedReminder : reminder
          );
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating reminder:", error);
      setError("Error updating reminder");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle reminder status (complete/incomplete)
  const toggleReminderStatus = async (reminderId, isCompleted) => {
    try {

      setReminders(prevReminders => {
        if (!Array.isArray(prevReminders)) return prevReminders;

        return prevReminders.map(reminder => {
          if (reminder.id === reminderId || reminder._id === reminderId) {
            return { ...reminder, isCompleted };
          }
          return reminder;
        });
      });
      
      // Then update the server
      const response = await reminderService.updateReminderStatus(reminderId, { isCompleted });
      
      // If the server response indicates failure, revert the UI
      if (!response) {
        setReminders(prevReminders => {
          return prevReminders.map(reminder => {
            if (reminder.id === reminderId || reminder._id === reminderId) {
              return { ...reminder, isCompleted: !isCompleted };
            }
            return reminder;
          });
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error toggling reminder status:", error);
      // Revert the UI on error
      setReminders(prevReminders => {
        return prevReminders.map(reminder => {
          if (reminder.id === reminderId || reminder._id === reminderId) {
            return { ...reminder, isCompleted: !isCompleted };
          }
          return reminder;
        });
      });
      setError("Error updating reminder status");
      return false;
    }
  };

  // Delete a reminder
  const deleteReminder = async (reminderId) => {
    try {
      // First update the UI optimistically
      setReminders(prevReminders => {
        if (!Array.isArray(prevReminders)) return prevReminders;
        return prevReminders.filter(reminder => 
          reminder.id !== reminderId && reminder._id !== reminderId
        );
      });
      
      // Then update the server
      const success = await reminderService.deleteReminder(reminderId);
      
      // If the server request fails, refresh the list
      if (!success) {
        getReminders();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      // Refresh the list to ensure correct state
      getReminders();
      setError("Error deleting reminder");
      return false;
    }
  };

  // Get a specific reminder by ID
  const getReminderById = async (reminderId) => {
    try {
      return await reminderService.getUserReminderById(reminderId);
    } catch (error) {
      console.error("Error getting reminder details:", error);
      setError("Error loading reminder details");
      return null;
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Load reminders on initial render
  useEffect(() => {
    getReminders();
  }, []);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        loading,
        error,
        getReminders,
        addReminder,
        updateReminder,
        toggleReminderStatus,
        deleteReminder,
        getReminderById,
        clearError
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export default ReminderProvider;