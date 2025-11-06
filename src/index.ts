import app from "./app";
import { PORT } from "./config/env.config";
import { logger } from "./config/logger.config";
import connectToDatabase from "./database/mongodb";

// --- CATCH UNHANDLED ERRORS ---
// This catches sync errors
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    stack: err.stack,
  });
  process.exit(1);
});

// This catches async errors (unhandled promise rejections)
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// PORT is already a number from env.config.ts
const port = PORT;

/**
 * Starts the server.
 * Connects to the database first, then starts listening.
 */
const startServer = async () => {
    try {
        // 1. Connect to database
        await connectToDatabase();
        
        // 2. Start listening
        app.listen(port, () => {
            console.log(`API running on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); 
    }
};

startServer();