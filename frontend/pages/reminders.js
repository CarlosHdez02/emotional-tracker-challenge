import { ReminderProvider } from '../context/ReminderContext';
import ReminderForm from '../components/ReminderForm';
import ReminderList from '../components/ReminderList';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-top: 0;
`;

const ReminderPage = () => {
  return (
    <ReminderProvider>
      <PageContainer>
        <Header>
          <Title>Mental Health Reminders</Title>
          <Subtitle>
            Schedule activities to improve your mental wellbeing
          </Subtitle>
        </Header>
        
        <ReminderForm />
        <ReminderList />
      </PageContainer>
    </ReminderProvider>
  );
};

export default ReminderPage;