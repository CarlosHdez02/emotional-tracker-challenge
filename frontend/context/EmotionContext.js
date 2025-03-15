import React, { createContext, useState, useEffect } from 'react';
import APIService from '../services/api';


const apiService = new APIService();

// Create context
export const EmotionContext = createContext();

export const EmotionProvider = ({ children }) => {
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all emotions for the logged-in user
  const getEmotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEmotions = await apiService.getLoggedInUserEmotions();
      console.log(fetchedEmotions)
      setEmotions(fetchedEmotions.data)
      console.log(emotions)
     
    } catch (error) {
      console.error("Error fetching emotions:", error);
      setError("Error al cargar las emociones");
    } finally {
      setLoading(false);
    }
  };

  // Add new emotion
  const addEmotion = async (emotionData) => {
    setLoading(true);
    try {
      const newEmotion = await apiService.createNewUserEmotion({
        ...emotionData,
        date: new Date().toISOString() // Add current date
      });
      
      if (newEmotion) {
        // Ensure emotions is always an array
        setEmotions(prevEmotions => 
          Array.isArray(prevEmotions) ? [newEmotion, ...prevEmotions] : [newEmotion]
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding emotion:", error);
      setError("Error al agregar la emoción");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update existing emotion
  const updateEmotion = async (emotionId, emotionData) => {
    setLoading(true);
    try {
      const updatedEmotion = await apiService.updateUserEmotion(emotionId, emotionData);
      
      if (updatedEmotion) {
        setEmotions(prevEmotions => {
          if (!Array.isArray(prevEmotions)) return [updatedEmotion];
          
          return prevEmotions.map(emotion => 
            emotion.id === emotionId || emotion._id === emotionId ? updatedEmotion : emotion
          );
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating emotion:", error);
      setError("Error al actualizar la emoción");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get emotion summary for a user
  const getEmotionSummary = async (userId) => {
    try {
      return await apiService.getUserEmotionsSummary(userId);
    } catch (error) {
      console.error("Error getting emotion summary:", error);
      setError("Error al obtener el resumen de emociones");
      return null;
    }
  };

  // Get detailed information about a specific emotion
  const getEmotionDetails = async (emotionId) => {
    try {
      return await apiService.getEmotionInformationById(emotionId);
    } catch (error) {
      console.error("Error getting emotion details:", error);
      setError("Error al obtener detalles de la emoción");
      return null;
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Load emotions on initial render
  useEffect(() => {
    getEmotions();
  }, []);

  return (
    <EmotionContext.Provider
      value={{
        emotions,
        loading,
        error,
        getEmotions,
        addEmotion,
        updateEmotion,
        getEmotionSummary,
        getEmotionDetails,
        clearError
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};