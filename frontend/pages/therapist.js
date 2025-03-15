import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Layout from '../components/Layout';
import TherapistDataSharing from '../components/TherapistDataSharing';
import { AuthContext } from '../context/AuthContext';

const SharingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
`;

const InfoBox = styled.div`
  background-color: #edf2f7;
  border-left: 4px solid #3498db;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export default function TherapistSharing() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  
  // Basic auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  if (loading || !user) {
    return (
      <Layout title="Compartir con terapeuta - Terapia Emocional">
        <p>Cargando...</p>
      </Layout>
    );
  }
  
  return (
    <Layout title="Compartir con terapeuta - Terapia Emocional">
      <SharingContainer>
        <Title>Compartir con tu terapeuta</Title>
        
        <InfoBox>
          Esta función te permite compartir tu registro emocional con tu terapeuta de manera segura.
          Tú decides qué información compartir y por cuánto tiempo.
        </InfoBox>
        
        <TherapistDataSharing />
      </SharingContainer>
    </Layout>
  );
}