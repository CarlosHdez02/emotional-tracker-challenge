import { useState, useContext } from 'react';
import styled from 'styled-components';
import { ReminderContext } from '../context/ReminderContext';

const ReminderContainer = styled.div`
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

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
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

const ReminderForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    activity: '',
    category: 'other',
    scheduledTime: new Date().toISOString().slice(0, 16),
    frequency: 'once'
  });
  
  const [status, setStatus] = useState({ message: '', type: '' });
  const { addReminder, loading } = useContext(ReminderContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await addReminder({
        title: form.title,
        description: form.description,
        activity: form.activity,
        category: form.category,
        scheduledTime: form.scheduledTime,
        frequency: form.frequency
      });
      
      if (success) {
        // Reset form
        setForm({
          title: '',
          description: '',
          activity: '',
          category: 'other',
          scheduledTime: new Date().toISOString().slice(0, 16),
          frequency: 'once'
        });
        
        // Show success message
        setStatus({ message: 'Reminder created successfully', type: 'success' });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setStatus({ message: '', type: '' });
        }, 3000);
      } else {
        setStatus({ message: 'Failed to create reminder', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Error creating reminder', type: 'error' });
    }
  };
  
  return (
    <ReminderContainer>
      <Title>Create Mental Health Reminder</Title>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter a title for your reminder"
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="activity">Activity</Label>
          <Input
            type="text"
            id="activity"
            name="activity"
            value={form.activity}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="What activity do you need to do?"
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="meditation">Meditation</option>
            <option value="exercise">Exercise</option>
            <option value="journaling">Journaling</option>
            <option value="breathing">Breathing Exercise</option>
            <option value="social">Social Activity</option>
            <option value="nature">Nature Time</option>
            <option value="other">Other</option>
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="scheduledTime">Scheduled Time</Label>
          <Input
            type="datetime-local"
            id="scheduledTime"
            name="scheduledTime"
            value={form.scheduledTime}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            id="frequency"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="description">Description (Optional)</Label>
          <TextArea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add any additional details or notes"
            disabled={loading}
          />
        </InputGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Reminder'}
        </Button>
        
        {status.message && (
          <StatusMessage className={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </Form>
    </ReminderContainer>
  );
};

export default ReminderForm;
