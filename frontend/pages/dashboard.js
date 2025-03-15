import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { EmotionContext } from '../context/EmotionContext';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-top: 0;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin-bottom: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
`;

const CardText = styled.p`
  color: #7f8c8d;
  margin: 0;
`;

const CardLink = styled.a`
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 1rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.span`
  color: #7f8c8d;
`;

const StatValue = styled.span`
  font-weight: bold;
  color: #2c3e50;
`;

const StatCard = styled(Card)`
  flex: 1;
`;

const StatCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Map emotion types to their Spanish translations
const EMOTION_MAP = {
  'happy': 'Felicidad',
  'calm': 'Calma',
  'neutral': 'Neutral',
  'anxious': 'Ansiedad',
  'sad': 'Tristeza',
  'angry': 'Enojo'
};

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { emotions, loading: emotionsLoading, getEmotions } = useContext(EmotionContext);
  const router = useRouter();
  
  // Basic auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);
  
  // Fetch emotion data when component mounts
  useEffect(() => {
    if (user) {
      getEmotions();
    }
  }, [user]);
  
  // Process emotion data for charts
  const processEmotionData = () => {
    if (!emotions || !emotions.length) return [];
    
    // Sort emotions by date
    const sortedEmotions = [...emotions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get the last 7 entries or fewer if we don't have 7
    const recentEmotions = sortedEmotions.slice(-7);
    
    // Create a map to track emotions by day
    const emotionsByDay = {};
    
    // Process each emotion entry
    recentEmotions.forEach(emotion => {
      const date = new Date(emotion.date);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayOfWeek = dayNames[date.getDay()];
      
      // Initialize day if it doesn't exist
      if (!emotionsByDay[dayOfWeek]) {
        emotionsByDay[dayOfWeek] = {
          fecha: dayOfWeek,
          felicidad: 0,
          ansiedad: 0,
          tristeza: 0,
          calma: 0,
          count: 0
        };
      }
      
      // Map emotion type to the appropriate category and add intensity
      const emotionType = emotion.emotion;
      const intensity = emotion.intensity || 0;
      
      if (emotionType === 'happy') {
        emotionsByDay[dayOfWeek].felicidad += intensity;
      } else if (emotionType === 'anxious') {
        emotionsByDay[dayOfWeek].ansiedad += intensity;
      } else if (emotionType === 'sad') {
        emotionsByDay[dayOfWeek].tristeza += intensity;
      } else if (emotionType === 'calm') {
        emotionsByDay[dayOfWeek].calma += intensity;
      }
      
      emotionsByDay[dayOfWeek].count++;
    });
    
    // Average the emotions by the number of entries for each day
    return Object.values(emotionsByDay).map(day => {
      if (day.count > 0) {
        return {
          fecha: day.fecha,
          felicidad: day.felicidad / day.count,
          ansiedad: day.ansiedad / day.count,
          tristeza: day.tristeza / day.count,
          calma: day.calma / day.count
        };
      }
      return day;
    });
  };
  
  // Process emotion distribution
  const processEmotionDistribution = () => {
    if (!emotions || !emotions.length) return [];
    
    // Count occurrences of each emotion type
    const emotionCounts = {};
    
    emotions.forEach(entry => {
      const emotionType = entry.emotion;
      // Convert to Spanish display name or use the original if not in the map
      const displayName = EMOTION_MAP[emotionType] || emotionType;
      
      if (!emotionCounts[displayName]) {
        emotionCounts[displayName] = 0;
      }
      
      emotionCounts[displayName]++;
    });
    
    // Convert to array format for chart
    return Object.entries(emotionCounts)
      .map(([name, value]) => ({
        name,
        value
      }));
  };
  
  // Calculate average intensity for each emotion type
  const calculateAverageEmotion = (emotionType) => {
    if (!emotions || !emotions.length) return '0.0';
    
    // Map Spanish emotion types to API emotion types
    const emotionTypeMap = {
      'felicidad': 'happy',
      'ansiedad': 'anxious', 
      'tristeza': 'sad',
      'calma': 'calm'
    };
    
    const apiEmotionType = emotionTypeMap[emotionType];
    if (!apiEmotionType) return '0.0';
    
    // Filter entries with the matching emotion type
    const matchingEmotions = emotions.filter(e => e.emotion === apiEmotionType);
    
    if (matchingEmotions.length === 0) return '0.0';
    
    // Calculate average intensity
    const sum = matchingEmotions.reduce((total, emotion) => total + (emotion.intensity || 0), 0);
    return (sum / matchingEmotions.length).toFixed(1);
  };
  
  // Find the most frequent emotion
  const findDominantEmotion = () => {
    if (!emotions || !emotions.length) return 'Sin datos';
    
    const emotionCounts = {};
    
    emotions.forEach(entry => {
      const emotionType = entry.emotion;
      const displayName = EMOTION_MAP[emotionType] || emotionType;
      
      if (!emotionCounts[displayName]) {
        emotionCounts[displayName] = 0;
      }
      
      emotionCounts[displayName]++;
    });
    
    // Find the emotion with the highest count
    let dominantEmotion = 'Sin datos';
    let maxCount = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  };
  
  // Get processed data for charts
  const emotionData = processEmotionData();
  const emotionDistribution = processEmotionDistribution();
  
  if (authLoading || emotionsLoading || !user) {
    return (
      <Layout title="Panel - Terapia Emocional">
        <p>Cargando...</p>
      </Layout>
    );
  }
  
  return (
    <Layout title="Panel - Terapia Emocional">
      <DashboardContainer>
        <WelcomeCard>
          <Title>¡Bienvenido, {user.name}!</Title>
          <Subtitle>Aquí tienes un resumen de tu bienestar emocional</Subtitle>
        </WelcomeCard>
        
        <StatCardGrid>
          <StatCard>
            <CardTitle>Estadísticas Clave</CardTitle>
            <StatRow>
              <StatLabel>Felicidad Promedio:</StatLabel>
              <StatValue>{calculateAverageEmotion('felicidad')}/10</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Ansiedad Promedio:</StatLabel>
              <StatValue>{calculateAverageEmotion('ansiedad')}/10</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Emoción Dominante:</StatLabel>
              <StatValue>{findDominantEmotion()}</StatValue>
            </StatRow>
          </StatCard>
          
          <StatCard>
            <CardTitle>Actividades</CardTitle>
            <StatRow>
            </StatRow>
            <StatRow>
              <StatLabel>Entradas Totales:</StatLabel>
              <StatValue>{emotions ? emotions.length : 0}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Última Entrada:</StatLabel>
              <StatValue>
                {emotions && emotions.length > 0 
                  ? new Date(emotions[emotions.length - 1].date).toLocaleDateString('es-ES')
                  : 'Sin datos'}
              </StatValue>
            </StatRow>
          </StatCard>
        </StatCardGrid>
        
        <Grid>
          <Card>
            <CardTitle>Distribución de Emociones</CardTitle>
            <CardText>Porcentaje de tiempo en cada estado emocional</CardText>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {emotionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </Grid>
        
        <Grid>
          <Card>
            <CardTitle>Seguimiento Emocional</CardTitle>
            <CardText>
              Registra tus emociones diarias y mantén un seguimiento de tu bienestar mental.
            </CardText>
            <CardLink onClick={() => router.push('/emotions')}>
              Seguimiento de Emociones
            </CardLink>
          </Card>
          
          <Card>
            <CardTitle>Recordatorios</CardTitle>
            <CardText>
              Configura recordatorios para actividades que mejoran tu salud mental.
            </CardText>
            <CardLink onClick={() => router.push('/reminders')}>
              Recordatorios
            </CardLink>
          </Card>
          
          <Card>
            <CardTitle>Compartir con Terapeuta</CardTitle>
            <CardText>
              Comparte tus datos de seguimiento emocional con tu terapeuta.
            </CardText>
            <CardLink onClick={() => router.push('/therapist')}>
              Comparte con tu terapeuta
            </CardLink>
          </Card>
        </Grid>
      </DashboardContainer>
    </Layout>
  );
}