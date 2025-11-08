import winston from 'winston';
import 'winston-daily-rotate-file';
import { NODE_ENV } from './env.config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, 
  debug: 4,
};

// Determine the active log level based on the environment
const level = () => {
  return NODE_ENV === 'development' ? 'debug' : 'warn';
};

// Define colors for development logging
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Define the log format
const logFormat = winston.format.combine(
  // Add a timestamp with a consistent format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  
  // Format for development: colorized, simple
  NODE_ENV === 'development'
    ? winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message}` +
                   (info.stack ? `\n${info.stack}` : '')
        )
      )
    // Format for production: JSON
    : winston.format.combine(
        winston.format.json()
      )
);

// Define the "transports" (where the logs go)
const transports = [
  new winston.transports.Console({
    level: level(), 
    handleExceptions: true,
  }),
  
  // 2. Log all 'info' level and above to a combined file
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log', // e.g., logs/combined-2025-11-06.log
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m', // 20MB
    maxFiles: '14d', // Keep logs for 14 days
    level: 'info',
  }),
  
  // 3. Log all 'error' level and above to a separate error file
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs for 30 days
    level: 'error',
  }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});