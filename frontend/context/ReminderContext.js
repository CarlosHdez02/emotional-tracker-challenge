import React, { createContext, useState, useEffect } from 'react';
import Reminders from '../services/reminder'; // Adjust path as needed

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
      setReminders(fetchedReminders.data || fetchedReminders);
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
      const newReminder = await reminderService.createNewReminder({
        ...reminderData,
      //  createdAt: new Date().toISOString()
      });
      
      if (newReminder) {
        setReminders(prevReminders => 
          Array.isArray(prevReminders) ? [newReminder, ...prevReminders] : [newReminder]
        );
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
      const updatedReminder = await reminderService.updateUserReminder(reminderId, reminderData);
      
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
  const toggleReminderStatus = async (reminderId, status) => {
    setLoading(true);
    try {
      await reminderService.updateReminderStatus(reminderId, { status });
      
      setReminders(prevReminders => {
        if (!Array.isArray(prevReminders)) return prevReminders;
        
        return prevReminders.map(reminder => {
          if (reminder.id === reminderId || reminder._id === reminderId) {
            return { ...reminder, status };
          }
          return reminder;
        });
      });
      return true;
    } catch (error) {
      console.error("Error toggling reminder status:", error);
      setError("Error updating reminder status");
      return false;
    } finally {
      setLoading(false);
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
        getReminderById,
        clearError
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};