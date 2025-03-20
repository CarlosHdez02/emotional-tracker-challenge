import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { ReminderContext } from '../context/ReminderContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;
  
  &:hover:not(:disabled) {
    background-color: #d0d0d0;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const DebugInfo = styled.pre`
  background-color: #f8f9fa;
  padding: 0.5rem;
  font-size: 0.8rem;
  margin-top: 1rem;
  overflow-x: auto;
  max-height: 100px;
  display: none; /* Set to 'block' to show debug info */
`;

const ReminderUpdateModal = ({ isOpen, onClose, reminderId }) => {
  const { getReminderById, updateReminder } = useContext(ReminderContext);
  
  const [reminderData, setReminderData] = useState({
    title: '',
    category: '',
    activity: '',
    description: '',
    scheduledTime: '',
    frequency: 'daily'
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  
  // Load reminder details when the modal opens
  useEffect(() => {
    if (isOpen && reminderId) {
      loadReminderDetails();
    }
  }, [isOpen, reminderId]);
  
  const loadReminderDetails = async () => {
    setLoading(true);
    try {
      const reminder = await getReminderById(reminderId);
      
      if (!reminder) {
        throw new Error('Reminder not found');
      }
      
      // Store original data for debugging
      setOriginalData(reminder);
      setDebugInfo(prev => ({ ...prev, originalData: reminder }));
      
      // Format the date for the datetime-local input
      let formattedTime = '';
      if (reminder.scheduledTime) {
        try {
          const date = new Date(reminder.scheduledTime);
          if (!isNaN(date.getTime())) {
            // Format: YYYY-MM-DDThh:mm
            formattedTime = date.toISOString().slice(0, 16);
            setDebugInfo(prev => ({ 
              ...prev, 
              dateConversion: {
                original: reminder.scheduledTime,
                jsDate: date.toString(),
                formatted: formattedTime 
              }
            }));
          } else {
            console.warn('Invalid date encountered:', reminder.scheduledTime);
            setDebugInfo(prev => ({ 
              ...prev, 
              dateError: `Invalid date: ${reminder.scheduledTime}` 
            }));
          }
        } catch (dateErr) {
          console.error('Error formatting date:', dateErr);
          setDebugInfo(prev => ({ 
            ...prev, 
            dateError: dateErr.message 
          }));
        }
      }
      
      // Prepare the form data
      const formData = {
        title: reminder.title || '',
        category: reminder.category || '',
        activity: reminder.activity || '',
        description: reminder.description || '',
        scheduledTime: formattedTime,
        frequency: reminder.frequency || 'daily'
      };
      
      setReminderData(formData);
      setDebugInfo(prev => ({ ...prev, formData }));
      setError(null);
    } catch (err) {
      console.error('Error loading reminder details:', err);
      setError('Could not load reminder details: ' + (err.message || err));
      setDebugInfo(prev => ({ ...prev, loadError: err.message || err }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminderData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Start with a clean object for the update
      const updatedReminder = {
        title: reminderData.title,
        category: reminderData.category,
        activity: reminderData.activity,
        description: reminderData.description,
        frequency: reminderData.frequency,
      };
      
      // Handle the scheduledTime conversion carefully
      if (reminderData.scheduledTime) {
        try {
          const date = new Date(reminderData.scheduledTime);
          if (!isNaN(date.getTime())) {
            updatedReminder.scheduledTime = date.toISOString();
          } else {
            throw new Error('Invalid date format');
          }
        } catch (dateErr) {
          throw new Error(`Date conversion failed: ${dateErr.message}`);
        }
      }
      
      // Preserve any fields from the original data that we're not explicitly updating
      // but might be required by the backend
      if (originalData) {
        if (originalData.isCompleted !== undefined) {
          updatedReminder.isCompleted = originalData.isCompleted;
        }
        // Add other needed fields here
      }
      
      setDebugInfo(prev => ({ 
        ...prev, 
        submittingData: updatedReminder,
        reminderId
      }));
      
      const success = await updateReminder(reminderId, updatedReminder);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update reminder. Please try again.');
      }
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError(`Error updating reminder: ${err.message || 'Unknown error'}`);
      setDebugInfo(prev => ({ ...prev, updateError: err.message || err }));
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Update Reminder</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        {loading && <p>Loading...</p>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={reminderData.title}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                name="category"
                value={reminderData.category}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="activity">Activity</Label>
              <Input
                type="text"
                id="activity"
                name="activity"
                value={reminderData.activity}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={reminderData.description}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                type="datetime-local"
                id="scheduledTime"
                name="scheduledTime"
                value={reminderData.scheduledTime}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                id="frequency"
                name="frequency"
                value={reminderData.frequency}
                onChange={handleChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="once">Once</option>
              </Select>
            </FormGroup>
            
            <ButtonGroup>
              <CancelButton type="button" onClick={onClose}>
                Cancel
              </CancelButton>
              <SaveButton type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Reminder'}
              </SaveButton>
            </ButtonGroup>
          </Form>
        )}
        
        {/* Debug information - hidden by default */}
        <DebugInfo>
          {JSON.stringify(debugInfo, null, 2)}
        </DebugInfo>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReminderUpdateModal;