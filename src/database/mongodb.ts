import mongoose from 'mongoose';
import { DB_URI } from '../config/env.config';
import { logger } from '../config/logger.config';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.error('MongoDB connection error:', { error });
    throw error; 
  }
};

export default connectToDatabase;