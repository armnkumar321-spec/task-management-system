import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
const getOrigins = () => {
  const list = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl) {
    clientUrl.split(',').forEach((url) => {
      const clean = url.trim().replace(/\/+$/, '');
      if (clean && !list.includes(clean)) list.push(clean);
    });
  }
  return list;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile, curl, server-to-server, Render health checks)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/+$/, '');
      const origins = getOrigins();

      if (
        origins.includes(normalized) ||
        process.env.NODE_ENV !== 'production' ||
        normalized.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const isDbConnected = req.app.get('mongoose')?.connection?.readyState === 1;

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
