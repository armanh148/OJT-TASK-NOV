import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorMiddleware } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import incomeRoutes from './routes/incomeRoutes';
import expenseRoutes from './routes/expenseRoutes';
import summaryRoutes from './routes/summaryRoutes';

export const app: Application = express();

// Security Headers
app.use(helmet());

// Cookie Parser for Web Browser Sessions
app.use(cookieParser());

// CORS Configuration
const allowedOrigins =
  env.ALLOWED_ORIGINS === '*'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : env.ALLOWED_ORIGINS.split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in allowed list
      if (!origin || allowedOrigins.includes(origin) || env.ALLOWED_ORIGINS === '*') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Payload size limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Monthly Budget Tracker Backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);

// Catch-all 404 for undefined API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

export default app;

