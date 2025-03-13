import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseConnect } from './database/config.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import UserRoutes from './routes/userRoutes.js';

dotenv.config();
console.log(process.env);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConnect = new DatabaseConnect();
dbConnect.handleInitDb();

// Initialize routes
const userRoutesInstance = new UserRoutes();

// Routes
app.use('/api/users', userRoutesInstance.getRouter());
//app.use('/api/emotions', emotionRoutes);

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));