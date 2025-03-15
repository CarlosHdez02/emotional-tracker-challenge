import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BiShare, BiLock, BiCalendar, BiCheckCircle } from 'react-icons/bi';

const ShareContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-top: 0;
`;

const Description = styled.p`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const TherapistContainer = styled.div`
  margin-bottom: 2rem;
`;

const TherapistCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TherapistInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TherapistName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const TherapistEmail = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ShareHistoryContainer = styled.div`
  margin-top: 2rem;
`;

const ShareHistoryTitle = styled.h3`
  color: #2c3e50;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
`;

const ShareItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const ShareItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ShareItemDate = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ShareItemTherapist = styled.h4`
  margin: 0;
  color: #2c3e50;
`;

const ShareItemDetails = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const PrivacyNote = styled.div`
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

export default function TherapistDataSharing() {
  const { user } = useContext(AuthContext);
  const [therapists, setTherapists] = useState([]);
  const [shareHistory, setShareHistory] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTherapists();
    fetchShareHistory();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await axios.get('/api/therapists', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTherapists(response.data);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      setError('Error al cargar los terapeutas');
    }
  };

  const fetchShareHistory = async () => {
    try {
      const response = await axios.get('/api/data-sharing', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShareHistory(response.data);
    } catch (err) {
      console.error('Error fetching share history:', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!selectedTherapist) {
      setError('Por favor selecciona un terapeuta');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Por favor selecciona un rango de fechas');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(
        '/api/data-sharing',
        {
          therapistId: selectedTherapist,
          startDate,
          endDate,
          includeNotes
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setSuccess(true);
      fetchShareHistory();
      
      // Reset form
      setSelectedTherapist('');
      setStartDate('');
      setEndDate('');
      setIncludeNotes(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error sharing data:', err);
      setError('Error al compartir los datos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTherapistName = (id) => {
    const therapist = therapists.find(t => t._id === id);
    return therapist ? therapist.name : 'Terapeuta';
  };

  return (
    <ShareContainer>
      <Title>Compartir datos con tu terapeuta</Title>
      <Description>
        Comparte tu registro emocional con tus terapeutas de manera segura y controlada.
        Tú decides qué información compartir y por cuánto tiempo.
      </Description>
      
      <PrivacyNote>
        <BiLock style={{ marginRight: '0.5rem' }} />
        Tus datos se comparten de manera segura y encriptada. Solo los terapeutas que selecciones podrán acceder a la información y solo durante el período que especifiques.
      </PrivacyNote>
      
      {success && (
        <SuccessMessage>
          <BiCheckCircle size={20} />
          Datos compartidos exitosamente con tu terapeuta.
        </SuccessMessage>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <TherapistContainer>
        <h3>Mis terapeutas</h3>
        
        {therapists.length === 0 ? (
          <EmptyState>
            No tienes terapeutas asociados. Pide a tu terapeuta que te envíe una invitación.
          </EmptyState>
        ) : (
          therapists.map(therapist => (
            <TherapistCard key={therapist._id}>
              <TherapistInfo>
                <TherapistName>{therapist.name}</TherapistName>
                <TherapistEmail>{therapist.email}</TherapistEmail>
              </TherapistInfo>
            </TherapistCard>
          ))
        )}
      </TherapistContainer>
      
      <form onSubmit={handleShare}>
        <FormGroup>
          <Label htmlFor="therapist">Selecciona un terapeuta</Label>
          <Select
            id="therapist"
            value={selectedTherapist}
            onChange={(e) => setSelectedTherapist(e.target.value)}
            required
          >
            <option value="">Seleccionar terapeuta</option>
            {therapists.map(therapist => (
              <option key={therapist._id} value={therapist._id}>
                {therapist.name}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Período de tiempo</Label>
          <DateRangeContainer>
            <DateInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              placeholder="Fecha inicial"
            />
            <DateInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              placeholder="Fecha final"
            />
          </DateRangeContainer>
        </FormGroup>
        
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="includeNotes"
            checked={includeNotes}
            onChange={(e) => setIncludeNotes(e.target.checked)}
          />
          <Label htmlFor="includeNotes" style={{ display: 'inline', marginBottom: 0 }}>
            Incluir notas personales
          </Label>
        </CheckboxContainer>
        
        <Button type="submit" disabled={loading}>
          <BiShare />
          {loading ? 'Compartiendo...' : 'Compartir datos'}
        </Button>
      </form>
      
      <ShareHistoryContainer>
        <ShareHistoryTitle>Historial de compartidos</ShareHistoryTitle>
        
        {shareHistory.length === 0 ? (
          <EmptyState>
            No has compartido datos con ningún terapeuta aún.
          </EmptyState>
        ) : (
          shareHistory.map(share => (
            <ShareItem key={share._id}>
              <ShareItemHeader>
                <ShareItemTherapist>
                  {getTherapistName(share.therapistId)}
                </ShareItemTherapist>
                <ShareItemDate>
                  <BiCalendar />
                  {formatDate(share.createdAt)}
                </ShareItemDate>
              </ShareItemHeader>
              <ShareItemDetails>
                Período: {formatDate(share.startDate)} - {formatDate(share.endDate)}
              </ShareItemDetails>
              <ShareItemDetails>
                Notas incluidas: {share.includeNotes ? 'Sí' : 'No'}
              </ShareItemDetails>
            </ShareItem>
          ))
        )}
      </ShareHistoryContainer>
    </ShareContainer>
  );
}