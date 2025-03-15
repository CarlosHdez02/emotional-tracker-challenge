import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { EmotionContext } from '../context/EmotionContext';

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
const EditIcon = styled.span`
  cursor: pointer;
  margin-left: 10px;
  color: #2980b9;
  font-size: 1rem;
  &:hover {
    color: #1c598a;
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const EmotionHistory = () => {
  const { emotions, loading, error, getEmotions, updateEmotion } = useContext(EmotionContext);
  
  // Properly handle the emotions data structure
  const emotionsArray = Array.isArray(emotions) 
    ? emotions 
    : (emotions?.data && Array.isArray(emotions.data)) 
      ? emotions.data 
      : [];

  useEffect(() => {
    getEmotions();
  }, []);
  
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
        <EmotionList>
          {emotionsArray.map((emotion) => (
            <EmotionCard key={emotion.id || emotion._id || Date.now() + Math.random()}>
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
                      <Tag key={`trigger-${index}`} className="trigger">
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
                      <Tag key={`activity-${index}`} className="activity">
                        {translateActivity(activity)}
                      </Tag>
                    ))}
                  </TagsList>
                </TagsContainer>
              )}
              
              {emotion.notes && <EmotionNotes>{emotion.notes}</EmotionNotes>}
            </EmotionCard>
          ))}
        </EmotionList>
      )}
    </HistoryContainer>
  );
};

export default EmotionHistory;