import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB, getDbStatus } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database & Seed Initial Datasets
connectDB().finally(async () => {
  await seedInitialData();
});

// Middleware configuration
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to QuizMaster REST API Server!',
    frontendApp: 'http://localhost:5173',
    documentation: {
      healthCheck: '/api/health',
      quizzes: '/api/quizzes',
      auth: '/api/auth',
      attempts: '/api/attempts',
      admin: '/api/admin',
    },
    status: 'Running',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'OK',
    service: 'QuizMaster API Server',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/admin', adminRoutes);

// Fallback for 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: [${req.method}] ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 QuizMaster API Server listening on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
