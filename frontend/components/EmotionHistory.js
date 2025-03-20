import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { EmotionContext } from '../context/EmotionContext';
import { ConfirmationModal } from './Modal';

const HistoryContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h2`
  margin-top: 0;
  color: #2c3e50;
`;

const EmptyState = styled.p`
  color: #7f8c8d;
  text-align: center;
  font-style: italic;
`;

const EmotionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmotionCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EmotionHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const EmotionName = styled.span`
  font-weight: bold;
  text-transform: capitalize;
  
  &.happy { color: #27ae60; }
  &.sad { color: #2980b9; }
  &.angry { color: #c0392b; }
  &.anxious { color: #f39c12; }
  &.neutral { color: #7f8c8d; }
`;

const EmotionDate = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const EmotionIntensity = styled.div`
  margin: 0.5rem 0;
  
  span {
    font-size: 0.9rem;
    color: #7f8c8d;
  }
`;

const EmotionNotes = styled.p`
  margin: 0;
  color: #34495e;
`;

const TagsContainer = styled.div`
  margin: 0.5rem 0;
`;

const TagsTitle = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-right: 0.5rem;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: #34495e;
  
  &.trigger {
    background-color: #ebf5fb;
    color: #2980b9;
  }
  
  &.activity {
    background-color: #e8f8f5;
    color: #27ae60;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: #3CABDB;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #c0392b;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`;

const RetryButton = styled.button`
  background-color: #3CABDB;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#3CABDB' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#34495e'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 2.5rem;
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#e0e0e0'};
  }
  
  &:disabled {
    background-color: #f0f0f0;
    color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem
  margin-top: 0.5rem;
`;

const DeleteButton = styled.button`
  background-color: #e74c3c;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e74c3c;
    color: white;
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const EmotionHistory = () => {
  const { emotions, loading, error, getEmotions, deleteEmotion } = useContext(EmotionContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [emotionToDelete, setEmotionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  

  const emotionsArray = Array.isArray(emotions) 
    ? emotions 
    : (emotions?.data && Array.isArray(emotions.data)) 
      ? emotions.data 
      : [];


  const totalEmotions = emotionsArray.length;
  const totalPages = Math.ceil(totalEmotions / itemsPerPage);
  

  const indexOfLastEmotion = currentPage * itemsPerPage;
  const indexOfFirstEmotion = indexOfLastEmotion - itemsPerPage;
  const currentEmotions = emotionsArray.slice(indexOfFirstEmotion, indexOfLastEmotion);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    getEmotions();
  }, []);
  
  
  useEffect(() => {
    setCurrentPage(1);
  }, [totalEmotions]);
  
  const translateEmotion = (emotion) => {
    const translations = {
      happy: "Feliz",
      sad: "Triste",
      angry: "Enojado",
      anxious: "Ansioso",
      neutral: "Neutral"
    };
    return translations[emotion] || emotion;
  };

  const translateTrigger = (trigger) => {
    const translations = {
      conflict: "Conflicto",
      stress: "Estrés",
      achievement: "Logro",
      disappointment: "Decepción",
      socialInteraction: "Interacción Social"
    };
    return translations[trigger] || trigger;
  };

  const translateActivity = (activity) => {
    const translations = {
      exercise: "Ejercicio",
      meditation: "Meditación",
      reading: "Lectura",
      socializing: "Socializar",
      work: "Trabajo",
      rest: "Descanso"
    };
    return translations[activity] || activity;
  };
  
  const handleRetry = () => {
    getEmotions();
  };
  
  // Page numbers to show
  const getPageNumbers = () => {
    const maxPageNumbers = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
    
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  // Handle delete button click
  const openDeleteModal = (emotion) => {
    setEmotionToDelete(emotion);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEmotionToDelete(null);
  };
  
  // Handle confirmation
  const handleConfirmDelete = async () => {
    if (!emotionToDelete) return;
    
    const emotionId = emotionToDelete.id || emotionToDelete._id;
    setDeleteLoading(true);
    
    try {
      const success = await deleteEmotion(emotionId);
      if (success) {
        // If we're on a page that would be empty after deletion, go to previous page
        if (currentEmotions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error("Error deleting emotion:", error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setEmotionToDelete(null);
    }
  };
  
  return (
    <HistoryContainer>
      <Title>Historial de Emociones</Title>
      
      {loading ? (
        <LoadingSpinner>Cargando...</LoadingSpinner>
      ) : emotionsArray.length === 0 ? (
        <div>
          <EmptyState>No hay emociones registradas aún. ¡Comienza a hacer seguimiento de tus emociones arriba!</EmptyState>
          {error && (
            <div>
              <ErrorMessage>Hubo un problema al cargar las emociones</ErrorMessage>
              <RetryButton onClick={handleRetry}>Intentar Nuevamente</RetryButton>
            </div>
          )}
        </div>
      ) : (
        <>
          <EmotionList>
            {currentEmotions.map((emotion) => {
              // Ensure we have a valid emotion object
              if (!emotion) return null;
              
            
              const emotionKey = emotion.id || emotion._id || `emotion-${Date.now()}-${Math.random()}`;
              
              return (
                <EmotionCard key={emotionKey}>
                  <EmotionHeader>
                    <EmotionName className={emotion.emotion}>
                      {translateEmotion(emotion.emotion)}
                    </EmotionName>
                    <EmotionDate>{formatDate(emotion.date || new Date())}</EmotionDate>
                  </EmotionHeader>
                  
                  <EmotionIntensity>
                    Intensidad: <span>{emotion.intensity}/10</span>
                  </EmotionIntensity>

                  {emotion.triggers && emotion.triggers.length > 0 && (
                    <TagsContainer>
                      <TagsTitle>Desencadenantes:</TagsTitle>
                      <TagsList>
                        {emotion.triggers.map((trigger, index) => (
                          <Tag key={`trigger-${emotionKey}-${index}`} className="trigger">
                            {translateTrigger(trigger)}
                          </Tag>
                        ))}
                      </TagsList>
                    </TagsContainer>
                  )}

                  {emotion.activities && emotion.activities.length > 0 && (
                    <TagsContainer>
                      <TagsTitle>Actividades:</TagsTitle>
                      <TagsList>
                        {emotion.activities.map((activity, index) => (
                          <Tag key={`activity-${emotionKey}-${index}`} className="activity">
                            {translateActivity(activity)}
                          </Tag>
                        ))}
                      </TagsList>
                    </TagsContainer>
                  )}
                  
                  {emotion.notes && <EmotionNotes>{emotion.notes}</EmotionNotes>}
                  
                  {/* Delete button */}
                  <ActionButtons>
                    <DeleteButton onClick={() => openDeleteModal(emotion)}>
                      Eliminar
                    </DeleteButton>
                  </ActionButtons>
                </EmotionCard>
              );
            })}
          </EmotionList>
          
          {totalPages > 1 && (
            <>
              <PaginationContainer>
                <PageButton onClick={prevPage} disabled={currentPage === 1}>
                  &laquo;
                </PageButton>
                
                {getPageNumbers().map(number => (
                  <PageButton 
                    key={number} 
                    active={number === currentPage}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </PageButton>
                ))}
                
                <PageButton onClick={nextPage} disabled={currentPage === totalPages}>
                  &raquo;
                </PageButton>
              </PaginationContainer>
              
              <PageInfo>
                Mostrando {indexOfFirstEmotion + 1}-{Math.min(indexOfLastEmotion, totalEmotions)} de {totalEmotions} emociones
              </PageInfo>
            </>
          )}
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta emoción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteLoading}
      />
    </HistoryContainer>
  );
};

export default EmotionHistory;