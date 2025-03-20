import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ReminderContext } from '../context/ReminderContext';
import ReminderUpdateModal from './ReminderUpdateModal';
import { ConfirmationModal } from './Modal';

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
  background-color: ${props => 
    props.variant === 'complete' ? '#27ae60' : 
    props.variant === 'delete' ? '#e74c3c' : 
    props.variant === 'edit' ? '#f39c12' : '#3498db'
  };
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

// Pagination styles
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#3498db' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#475569'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#e2e8f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
    toggleReminderStatus,
    deleteReminder
  } = useContext(ReminderContext);
  
  // Track which reminder is being toggled
  const [togglingReminders, setTogglingReminders] = useState({});
  // Track which reminder is being deleted
  const [deletingReminders, setDeletingReminders] = useState({});
  // Track status feedback messages
  const [statusMessages, setStatusMessages] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [paginatedReminders, setPaginatedReminders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  
  // Update modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  // Initialize reminders and pagination
  useEffect(() => {
    getReminders();
  }, []);

  // Update pagination when reminders change
  useEffect(() => {
    if (Array.isArray(reminders)) {
      setTotalPages(Math.ceil(reminders.length / itemsPerPage));
      
      // Ensure current page is valid
      if (currentPage > Math.ceil(reminders.length / itemsPerPage) && reminders.length > 0) {
        setCurrentPage(1);
      }
      
      // Paginate reminders
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedReminders(reminders.slice(startIndex, endIndex));
    } else {
      setPaginatedReminders([]);
      setTotalPages(0);
    }
  }, [reminders, currentPage, itemsPerPage]);

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
            message: currentStatus ? 'Marked as incomplete' : 'Marked as complete' 
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
  
  const openDeleteModal = (reminder) => {
    setReminderToDelete(reminder);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReminderToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!reminderToDelete) return;
    
    const reminderId = reminderToDelete._id;
    setDeletingReminders(prev => ({ ...prev, [reminderId]: true }));
    
    try {
      const success = await deleteReminder(reminderId);
      
      if (!success) {
        // Show error message if the operation didn't succeed
        setStatusMessages(prev => ({ 
          ...prev, 
          [reminderId]: { 
            type: 'error', 
            message: 'Failed to delete reminder' 
          } 
        }));
      }
    } catch (err) {
      // Show error message
      setStatusMessages(prev => ({ 
        ...prev, 
        [reminderId]: { 
          type: 'error', 
          message: 'Error deleting reminder' 
        } 
      }));
    } finally {
      // Clear loading state
      setDeletingReminders(prev => ({ ...prev, [reminderId]: false }));
      // Close modal
      closeDeleteModal();
    }
  };
  
  const openUpdateModal = (reminderId) => {
    setSelectedReminderId(reminderId);
    setIsUpdateModalOpen(true);
  };
  
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedReminderId(null);
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading && !paginatedReminders.length) {
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
        {Array.isArray(paginatedReminders) && paginatedReminders.map(reminder => (
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
                    reminder.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'
                  )}
                </ButtonContent>
              </Button>
            </ButtonGroup>
            
            <ActionButtonGroup>
              <Button 
                variant="edit" 
                onClick={() => openUpdateModal(reminder._id)}
              >
                Edit
              </Button>
              
              <Button 
                variant="delete" 
                onClick={() => openDeleteModal(reminder)}
              >
                Delete
              </Button>
            </ActionButtonGroup>
            
            {statusMessages[reminder._id] && (
              <StatusMessage className={statusMessages[reminder._id].type}>
                {statusMessages[reminder._id].message}
              </StatusMessage>
            )}
          </ReminderCard>
        ))}
      </RemindersList>
      
      {totalPages > 1 && (
        <PaginationContainer>
          <PageButton 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
          >
            &lt; Prev
          </PageButton>
          
          {[...Array(totalPages)].map((_, index) => (
            <PageButton
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </PageButton>
        </PaginationContainer>
      )}
      
      {/* Update Modal */}
      <ReminderUpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={closeUpdateModal} 
        reminderId={selectedReminderId} 
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={reminderToDelete ? deletingReminders[reminderToDelete._id] : false}
      />
    </ListContainer>
  );
};

export default ReminderList;