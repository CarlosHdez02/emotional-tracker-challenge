import React, { createContext, useState, useEffect } from 'react';
import DataSharing from '../services/dataSharing';

// Create context
export const DataSharingContext = createContext();

export const DataSharingProvider = ({ children }) => {
  const [assignedTherapist, setAssignedTherapist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSharing] = useState(new DataSharing());

  // Get assigned therapist for the logged-in user
  const getAssignedTherapist = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await dataSharing.getAssignedTherapist();
        if (response && response.therapist) {
            setAssignedTherapist(response.therapist); // ✅ Set only the therapist data
        } else {
            setAssignedTherapist(null);
        }
    } catch (error) {
        console.error("Error fetching assigned therapist:", error);
        setError("Error al cargar el terapeuta asignado");
    } finally {
        setLoading(false);
    }
};


  // Assign therapist to user
  const assignTherapist = async (email) => {
    setLoading(true);
    try {
      const result = await dataSharing.assignTherapistToUser(email);
      if (result) {
        await getAssignedTherapist(); // Refresh assigned therapist data
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error assigning therapist:", error);
      setError("Error al asignar el terapeuta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Share emotions with therapist
  const shareEmotions = async () => {
    setLoading(true);
    try {
      const result = await dataSharing.shareEmotionsWithTherapist();
      return result;
    } catch (error) {
      console.error("Error sharing emotions:", error);
      setError("Error al compartir las emociones");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get therapist details
  const getTherapistDetails = async (therapistId) => {
    try {
      return await dataSharing.getTherapistDetails(therapistId);
    } catch (error) {
      console.error("Error getting therapist details:", error);
      setError("Error al obtener detalles del terapeuta");
      return null;
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const users = await dataSharing.getUsers();
      // Filter therapists and return the full user objects
      return users.filter(user => user.role === 'therapist');
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Error al obtener los terapeutas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    // Load assigned therapist on initial render
    getAssignedTherapist();
  }, []);

  return (
    <DataSharingContext.Provider
      value={{
        assignedTherapist,
        loading,
        error,
        getAssignedTherapist,
        assignTherapist,
        shareEmotions,
        getTherapistDetails,
        clearError,
        getUsers
      }}
    >
      {children}
    </DataSharingContext.Provider>
  );
};