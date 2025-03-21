import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseConnect } from './database/config.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import UserRoutes from './routes/userRoutes.js';
import EmotionRoutes from './routes/emotionRoutes.js';
import ReminderRoute from './routes/reminderRoutes.js';
import TherapistRoute from './routes/therapistRoutes.js';
import IdentifyPatternRoute from './routes/identifyPatternRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConnect = new DatabaseConnect();
dbConnect.handleInitDb();

// Initialize routes
const userRoutesInstance = new UserRoutes();
const emotionRoutesInstance = new EmotionRoutes();
const reminderRoutesInstance = new ReminderRoute();
const therapistRoutesInstance = new TherapistRoute()
const identifyPatternsRoutesInstance = new IdentifyPatternRoute()

// Routes
app.use('/api/users', userRoutesInstance.getRouter());
app.use('/api/emotions', emotionRoutesInstance.getRouter());
app.use('/api/reminders', reminderRoutesInstance.getRouter());
app.use('/api/therapist', therapistRoutesInstance.getRouter())
app.use('/api/patterns', identifyPatternsRoutesInstance.getRouter()) //  here will be the identifyPattenrs route

// Unprotected test route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5050;


const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


export { app, server };
