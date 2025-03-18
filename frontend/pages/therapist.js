import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { DataSharingContext } from '../context/DataSharingContext';

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const TherapistSelector = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const EmailDisplay = styled.div`
  padding: 0.75rem;
  background-color: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  background-color: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const TherapistInfo = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

export default function TherapistShare() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { 
    assignedTherapist, 
    loading,
    error,
    getAssignedTherapist,
    assignTherapist,
    shareEmotions,
    clearError,
    getUsers
  } = useContext(DataSharingContext);
  
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [sharingStatus, setSharingStatus] = useState({ success: false, message: '' });
  
  const router = useRouter();
  
  // Basic auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch therapists on component mount
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const therapistUsers = await getUsers();
        if (therapistUsers && therapistUsers.length > 0) {
          setTherapists(therapistUsers);
        } else {
          setStatusMessage({ success: false, message: 'No hay terapeutas disponibles' });
        }
      } catch (err) {
        console.error('Error fetching therapists:', err);
        setStatusMessage({ success: false, message: 'Error al cargar los terapeutas' });
      }
    };
    
    fetchTherapists();
    getAssignedTherapist();
  }, []);


  useEffect(() => {
   
}, [assignedTherapist]); 

  // Handle therapist selection
  const handleTherapistChange = (e) => {
    setSelectedTherapist(e.target.value);
    clearError();
    setStatusMessage(null);
  };

  // Handle assignment of therapist
  const handleAssignTherapist = async () => {
    if (!selectedTherapist) return;

   

    const success = await assignTherapist(selectedTherapist);

    if (success) {
        await getAssignedTherapist(); 

        const therapist = therapists.find(t => t.email === selectedTherapist);
        setStatusMessage({ 
            success: true, 
            message: `✅ Terapeuta ${therapist ? therapist.name : selectedTherapist} asignado correctamente.` 
        });
    }
};

  // Handle sharing emotions with assigned therapist
  const handleShareEmotions = async () => {
    if (!assignedTherapist) {
      setStatusMessage({ 
        success: false, 
        message: 'Primero debes asignar un terapeuta' 
      });
      return;
    }
    
    const result = await shareEmotions();
    
    if (result) {
      setSharingStatus({ 
        success: true, 
        message: 'Datos compartidos exitosamente con tu terapeuta.' 
      });
    } else {
      setSharingStatus({ 
        success: false, 
        message: 'Error al compartir los datos. Intenta de nuevo.' 
      });
    }
  };
  
  if (authLoading || !user) {
    return (
      <Layout title="Compartir con Terapeuta - Terapia Emocional">
        <p>Cargando...</p>
      </Layout>
    );
  }
  
  return (
    <Layout title="Compartir con Terapeuta - Terapia Emocional">
      <ShareContainer>
        <Title>Compartir Datos con Terapeuta</Title>
        
        <Card>
          <h2>Seleccionar Terapeuta</h2>
          <p>Elige un terapeuta para compartir tus datos emocionales:</p>
          
          <TherapistSelector 
            value={selectedTherapist} 
            onChange={handleTherapistChange}
          >
            <option value="">-- Selecciona un terapeuta --</option>
            {therapists.map(therapist => (
              <option key={therapist.email} value={therapist.email}>
                {therapist.name || therapist.email}
              </option>
            ))}
          </TherapistSelector>
          
          {selectedTherapist && (
            <EmailDisplay>
              Email: {selectedTherapist}
            </EmailDisplay>
          )}
          
          <Button 
            onClick={handleAssignTherapist} 
            disabled={!selectedTherapist || loading}
          >
            {loading ? 'Asignando...' : 'Asignar Terapeuta'}
          </Button>
          
          {error && (
            <StatusMessage success={false}>{error}</StatusMessage>
          )}
          
          {statusMessage && (
            <StatusMessage success={statusMessage.success}>
              {statusMessage.message}
            </StatusMessage>
          )}
        </Card>
        
        {assignedTherapist && (
          <Card>
            <h2>Terapeuta Asignado</h2>
            <TherapistInfo>
              <p><strong>Nombre:</strong> {assignedTherapist.name || 'No disponible'}</p>
              <p><strong>Email:</strong> {assignedTherapist.email}</p>
            </TherapistInfo>
            
            <div style={{ marginTop: '1.5rem' }}>
              <Button onClick={handleShareEmotions} disabled={loading}>
                Compartir Datos Emocionales
              </Button>
              
              {sharingStatus.message && (
                <StatusMessage success={sharingStatus.success}>
                  {sharingStatus.message}
                </StatusMessage>
              )}
            </div>
          </Card>
        )}
      </ShareContainer>
    </Layout>
  );
}