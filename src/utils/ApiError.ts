/**
 * Base class for all API errors.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];
  public readonly success: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: any[] = [],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    
    // Capture stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', errors: any[] = []) {
    super(400, message, errors);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', errors: any[] = []) {
    super(401, message, errors);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', errors: any[] = []) {
    super(403, message, errors);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found', errors: any[] = []) {
    super(404, message, errors);
  }
}