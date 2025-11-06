import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { CLIENT_URL, NODE_ENV } from './config/env.config';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import './config/passport.config'; 
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './config/logger.config';
import morgan from 'morgan';

const app = express();

app.use(cors({
  origin: CLIENT_URL, 
  credentials: true
}));
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); 

const stream = {
  write: (message: string) => {
    // Pipe Morgan's output to Winston's 'http' level
    logger.http(message.trim());
  },
};

// 'combined' is a standard Apache log format
// In development, you could use 'dev' for a colorized, shorter log
const morganFormat = NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream }));


// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'UP' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- ADD ERROR HANDLER AS THE LAST MIDDLEWARE ---
app.use(errorHandler);

export default app;