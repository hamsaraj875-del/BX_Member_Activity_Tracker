import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import contributionRoutes from './routes/contributionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();

// Initialize DB
connectDB();

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow during development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Setup Session Middleware
const mongoUri = process.env.MONGODB_URI;
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'bx_analytics_session_secret_key_secure_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
};

if (mongoUri && !mongoUri.includes('<cluster>')) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 30,
      autoRemove: 'native',
    });
  } catch (e) {
    console.warn('[Session Warning] Could not attach MongoStore, using memory session store:', e.message);
  }
}

app.use(session(sessionConfig));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'BX Analytics Backend',
    version: '1.0.0',
    mode: process.env.USE_MOCK_DATA === 'true' ? 'mock' : 'live',
    sessionAuth: 'active',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 BX Analytics Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend UI available on http://localhost:5173`);
  console.log(`🔐 Authentication: MongoDB Express Sessions`);
  console.log(`=================================================\n`);
});

export default app;
