import React, { createContext, useState, useEffect } from 'react';
import APIService from '../services/api';
import Cookie from 'js-cookie';

// Create an instance of the API service
const apiService = new APIService();

// Create context
export const EmotionContext = createContext();

export const EmotionProvider = ({ children }) => {
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all emotions for the logged-in user
  const getEmotions = async (userId) => {
    const token = Cookie.get('token');
    if (!token) {
      console.log("No token available, skipping emotion fetch");
      return;
    }
    
    // Update the token in the API service to ensure it's fresh
    apiService.updateToken(token);
    
    setLoading(true);
    setError(null);
    try {
      // Pass userId explicitly to ensure we're fetching for the correct user
      const fetchedEmotions = await apiService.getLoggedInUserEmotions(userId);
      console.log("Fetched emotions for user:", userId, fetchedEmotions);
      
      if (fetchedEmotions && fetchedEmotions.data) {
        setEmotions(fetchedEmotions.data);
      } else {
        setEmotions([]);
      }
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
        // Ensure we're handling the data structure consistently
        const emotionToAdd = newEmotion.data || newEmotion;
        
        // Create a new array with the new emotion first
        setEmotions(prevEmotions => {
          const prevEmotionsArray = Array.isArray(prevEmotions) ? prevEmotions : 
            (prevEmotions?.data && Array.isArray(prevEmotions.data)) ? prevEmotions.data : [];
          
          return [emotionToAdd, ...prevEmotionsArray];
        });
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
        // Ensure we're handling the data structure consistently
        const emotionToUpdate = updatedEmotion.data || updatedEmotion;
        
        setEmotions(prevEmotions => {
          const prevEmotionsArray = Array.isArray(prevEmotions) ? prevEmotions : 
            (prevEmotions?.data && Array.isArray(prevEmotions.data)) ? prevEmotions.data : [];
          
          return prevEmotionsArray.map(emotion => 
            emotion.id === emotionId || emotion._id === emotionId ? emotionToUpdate : emotion
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

  // Reset emotions - used when logging out
  const resetEmotions = () => {
    setEmotions([]);
    setError(null);
  };

  const deleteEmotion = async (emotionId) => {
    setLoading(true);
    try {
      // Call the API service to delete the emotion
      const result = await apiService.deleteUserEmotion(emotionId);
      
      if (result) {
        // Remove the emotion from the state
        setEmotions(prevEmotions => {
          if (!Array.isArray(prevEmotions)) return prevEmotions;
          return prevEmotions.filter(emotion => 
            emotion.id !== emotionId && emotion._id !== emotionId
          );
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting emotion", error);
      setError("Error al eliminar la emoción");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmotionContext.Provider
      value={{
        emotions,
        loading,
        error,
        deleteEmotion,
        getEmotions,
        addEmotion,
        updateEmotion,
        getEmotionSummary,
        getEmotionDetails,
        clearError,
        resetEmotions
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};