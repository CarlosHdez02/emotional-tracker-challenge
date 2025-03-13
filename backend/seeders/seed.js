import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Emotion from '../models/emotionModel.js';

// Configuración de la conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI;

// Usuarios de prueba
const users = [
  {
    name: 'Usuario de Prueba',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user'
  },
  {
    name: 'Administrador',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    name: 'María García',
    email: 'maria@example.com',
    password: bcrypt.hashSync('maria123', 10),
    role: 'user',
    therapistId: '60d5ec9af682fbd39ecbc99a' // ID ficticio
  }
];

// Función para generar emociones aleatorias
const generateEmotions = (userId, count = 10) => {
  const emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral'];
  const activities = ['exercise', 'meditation', 'reading', 'socializing', 'work', 'sleep'];
  const triggers = ['stress', 'conflict', 'achievement', 'relaxation', 'social interaction'];
  
  const emotionRecords = [];
  
  // Generar registros para los últimos 30 días
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Entre hoy y hace 30 días
    
    emotionRecords.push({
      user: userId,
      date: date,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      intensity: Math.floor(Math.random() * 10) + 1,
      notes: `Nota de ejemplo #${i+1}`,
      triggers: [triggers[Math.floor(Math.random() * triggers.length)]],
      activities: [activities[Math.floor(Math.random() * activities.length)]]
    });
  }
  
  return emotionRecords;
};

// Función principal para poblar la base de datos
const seedDatabase = async () => {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Limpiando base de datos existente...');
    await User.deleteMany();
    await Emotion.deleteMany();
    
    console.log('Insertando usuarios...');
    const createdUsers = await User.insertMany(users);
    
    console.log('Generando e insertando emociones...');
    let allEmotions = [];
    
    for (const user of createdUsers) {
      const userEmotions = generateEmotions(user._id, 15);
      allEmotions = [...allEmotions, ...userEmotions];
    }
    
    await Emotion.insertMany(allEmotions);
    
    console.log('¡Base de datos poblada con éxito!');
    console.log(`Insertados ${createdUsers.length} usuarios`);
    console.log(`Insertados ${allEmotions.length} registros de emociones`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar el seeder
seedDatabase();
