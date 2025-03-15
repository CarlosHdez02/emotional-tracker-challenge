import { useState, useContext } from 'react';
import styled from 'styled-components';
import { EmotionContext } from '../context/EmotionContext';

const TrackerContainer = styled.div`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #34495e;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const RangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Range = styled.input`
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
`;

const Button = styled.button`
  background-color: #3CABDB;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
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
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  
  &.success {
    background-color: #d5f5e3;
    color: #27ae60;
  }
  
  &.error {
    background-color: #f8d7da;
    color: #c0392b;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckboxLabel = styled.label`
  color: #34495e;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const EmotionTracker = () => {
  const [form, setForm] = useState({
    emotion: 'neutral',
    intensity: 5,
    notes: '',
    triggers: [],
    activities: []
  });
  
  const [status, setStatus] = useState({ message: '', type: '' });
  const { addEmotion, loading } = useContext(EmotionContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setForm({ 
        ...form, 
        [category]: [...form[category], value] 
      });
    } else {
      setForm({ 
        ...form, 
        [category]: form[category].filter(item => item !== value) 
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addEmotion({
        emotion: form.emotion,
        intensity: Number(form.intensity),
        notes: form.notes,
        triggers: form.triggers,
        activities: form.activities
      });
      
      // Reset form
      setForm({
        emotion: 'neutral',
        intensity: 5,
        notes: '',
        triggers: [],
        activities: []
      });
      
      // Show success message
      setStatus({ message: 'Emoción registrada exitosamente', type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      setStatus({ message: 'Error al registrar la emoción', type: 'error' });
    }
  };

  const triggerOptions = [
    { value: 'conflict', label: 'Conflicto' },
    { value: 'stress', label: 'Estrés' },
    { value: 'achievement', label: 'Logro' },
    { value: 'disappointment', label: 'Decepción' },
    { value: 'socialInteraction', label: 'Interacción Social' }
  ];

  const activityOptions = [
    { value: 'exercise', label: 'Ejercicio' },
    { value: 'meditation', label: 'Meditación' },
    { value: 'reading', label: 'Lectura' },
    { value: 'socializing', label: 'Socializar' },
    { value: 'work', label: 'Trabajo' },
    { value: 'rest', label: 'Descanso' }
  ];
  
  return (
    <TrackerContainer>
      <Title>¿Cómo te sientes hoy?</Title>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="emotion">Emoción</Label>
          <Select
            id="emotion"
            name="emotion"
            value={form.emotion}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="happy">Feliz</option>
            <option value="sad">Triste</option>
            <option value="angry">Enojado</option>
            <option value="anxious">Ansioso</option>
            <option value="neutral">Neutral</option>
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="intensity">Intensidad</Label>
          <RangeContainer>
            <Range
              type="range"
              id="intensity"
              name="intensity"
              min="1"
              max="10"
              value={form.intensity}
              onChange={handleChange}
              disabled={loading}
            />
            <RangeLabels>
              <span>Baja</span>
              <span>{form.intensity}</span>
              <span>Alta</span>
            </RangeLabels>
          </RangeContainer>
        </InputGroup>

        <InputGroup>
          <Label>Desencadenantes</Label>
          <CheckboxGroup>
            {triggerOptions.map(option => (
              <CheckboxContainer key={`trigger-${option.value}`}>
                <Checkbox
                  type="checkbox"
                  id={`trigger-${option.value}`}
                  value={option.value}
                  checked={form.triggers.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(e, 'triggers')}
                  disabled={loading}
                />
                <CheckboxLabel htmlFor={`trigger-${option.value}`}>
                  {option.label}
                </CheckboxLabel>
              </CheckboxContainer>
            ))}
          </CheckboxGroup>
        </InputGroup>

        <InputGroup>
          <Label>Actividades Realizadas</Label>
          <CheckboxGroup>
            {activityOptions.map(option => (
              <CheckboxContainer key={`activity-${option.value}`}>
                <Checkbox
                  type="checkbox"
                  id={`activity-${option.value}`}
                  value={option.value}
                  checked={form.activities.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(e, 'activities')}
                  disabled={loading}
                />
                <CheckboxLabel htmlFor={`activity-${option.value}`}>
                  {option.label}
                </CheckboxLabel>
              </CheckboxContainer>
            ))}
          </CheckboxGroup>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="notes">Notas</Label>
          <TextArea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="¿Qué desencadenó esta emoción? ¿Algún pensamiento o reflexión?"
            disabled={loading}
          />
        </InputGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Emoción'}
        </Button>
        
        {status.message && (
          <StatusMessage className={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </Form>
    </TrackerContainer>
  );
};

export default EmotionTracker;