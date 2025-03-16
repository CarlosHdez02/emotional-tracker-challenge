import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ReminderContext } from '../context/ReminderContext';

const ListContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin-top: 0;
  color: #2c3e50;
`;

const EmptyState = styled.p`
  color: #7f8c8d;
  text-align: center;
  font-style: italic;
  margin: 2rem 0;
`;

const RemindersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReminderCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  ${props => props.completed && `
    opacity: 0.7;
    border-left: 4px solid #27ae60;
  `}
`;

const ReminderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ReminderTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  ${props => props.completed && `
    text-decoration: line-through;
  `}
`;

const CategoryBadge = styled.span`
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-weight: 500;
`;

const ReminderTime = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0;
`;

const ReminderActivity = styled.p`
  margin: 0.5rem 0;
  color: #34495e;
`;

const ReminderDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'complete' ? '#27ae60' : props.variant === 'delete' ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: ${props => props.fullWidth ? '1' : 'initial'};
  position: relative;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div`
  font-size: 0.8rem;
  padding: 0.25rem;
  text-align: center;
  margin-top: 0.5rem;
  border-radius: 4px;
  
  &.success {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
  }
  
  &.error {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #7f8c8d;
`;

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ReminderList = () => {
  const { 
    reminders, 
    loading, 
    error, 
    getReminders, 
    toggleReminderStatus 
  } = useContext(ReminderContext);
  
  // Track which reminder is being toggled
  const [togglingReminders, setTogglingReminders] = useState({});
  // Track status feedback messages
  const [statusMessages, setStatusMessages] = useState({});

  useEffect(() => {
    getReminders();
  }, []);

  const handleToggleStatus = async (reminderId, currentStatus) => {
    // Set loading state for this specific button
    setTogglingReminders(prev => ({ ...prev, [reminderId]: true }));
    // Clear any previous status message
    setStatusMessages(prev => ({ ...prev, [reminderId]: null }));
    
    try {
      // Toggle the status - pass the new status (opposite of current)
      const newStatus = !currentStatus;
      const success = await toggleReminderStatus(reminderId, newStatus);
      
      if (success) {
        // Show success message
        setStatusMessages(prev => ({ 
          ...prev, 
          [reminderId]: { 
            type: 'success', 
            message: currentStatus ? 'Incomplete' : 'Complete' 
          } 
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatusMessages(prev => ({ ...prev, [reminderId]: null }));
        }, 3000);
      } else {
        // Show error message if the operation didn't succeed
        setStatusMessages(prev => ({ 
          ...prev, 
          [reminderId]: { 
            type: 'error', 
            message: 'Failed to update status' 
          } 
        }));
      }
    } catch (err) {
      // Show error message
      setStatusMessages(prev => ({ 
        ...prev, 
        [reminderId]: { 
          type: 'error', 
          message: 'Error updating status' 
        } 
      }));
    } finally {
      // Clear loading state
      setTogglingReminders(prev => ({ ...prev, [reminderId]: false }));
    }
  };

  if (loading) {
    return <LoadingMessage>Loading reminders...</LoadingMessage>;
  }

  return (
    <ListContainer>
      <Title>Your Reminders</Title>
      
      {error && (
        <EmptyState>Error loading reminders: {error}</EmptyState>
      )}
      
      {!loading && reminders && reminders.length === 0 && (
        <EmptyState>No reminders yet. Create one to get started!</EmptyState>
      )}
      
      <RemindersList>
        {Array.isArray(reminders) && reminders.map(reminder => (
          <ReminderCard key={reminder._id} completed={reminder.isCompleted}>
            <ReminderHeader>
              <ReminderTitle completed={reminder.isCompleted}>{reminder.title}</ReminderTitle>
              <CategoryBadge>{reminder.category}</CategoryBadge>
            </ReminderHeader>
            
            <ReminderTime>
              {formatDate(reminder.scheduledTime)} • {reminder.frequency}
            </ReminderTime>
            
            <ReminderActivity>
              <strong>Activity:</strong> {reminder.activity}
            </ReminderActivity>
            
            {reminder.description && (
              <ReminderDescription>{reminder.description}</ReminderDescription>
            )}
            
            <ButtonGroup>
              <Button 
                variant={reminder.isCompleted ? 'primary' : 'complete'} 
                fullWidth
                disabled={togglingReminders[reminder._id]}
                onClick={() => handleToggleStatus(reminder._id, reminder.isCompleted)}
              >
                <ButtonContent>
                  {togglingReminders[reminder._id] ? (
                    <>
                      <Spinner /> Updating...
                    </>
                  ) : (
                    reminder.isCompleted ? 'Completed' : 'Incomplete'
                  )}
                </ButtonContent>
              </Button>
            </ButtonGroup>
            
            {statusMessages[reminder._id] && (
              <StatusMessage className={statusMessages[reminder._id].type}>
                {statusMessages[reminder._id].message}
              </StatusMessage>
            )}
          </ReminderCard>
        ))}
      </RemindersList>
    </ListContainer>
  );
};

export default ReminderList;