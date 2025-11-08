import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { NODE_ENV } from '../config/env.config';
import mongoose from 'mongoose'; 

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];
  let stack = err.stack;

  // Check if it's one of our custom ApiErrors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } 
  // --- 2. ADD THIS BLOCK to handle Mongoose Validation Errors ---
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed. Please check your input.';
    // Format the errors into a clean array
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
    }));
  }
  else {
    // Log any other unexpected errors
    console.error('UNHANDLED ERROR:', err);
  }

  // Prepare the response
  const errorResponse = {
    success: false,
    statusCode,
    message,
    errors,
    stack: NODE_ENV === 'development' ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};