import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common API Errors
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(409, message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
  stack?: string;
}

/**
 * Handle Mongoose validation errors
 */
function handleMongooseValidationError(error: mongoose.Error.ValidationError): ErrorResponse {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return {
    success: false,
    error: 'Validation Error',
    message: 'Invalid data provided',
    statusCode: 400,
    details: errors,
  };
}

/**
 * Handle Mongoose duplicate key errors
 */
function handleMongooseDuplicateKeyError(error: { keyValue: Record<string, unknown> }): ErrorResponse {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return {
    success: false,
    error: 'Duplicate Error',
    message: `${field} '${value}' already exists`,
    statusCode: 409,
  };
}

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
function handleMongooseCastError(error: mongoose.Error.CastError): ErrorResponse {
  return {
    success: false,
    error: 'Invalid ID',
    message: `Invalid ${error.path}: ${error.value}`,
    statusCode: 400,
  };
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): ErrorResponse {
  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    success: false,
    error: 'Validation Error',
    message: 'Invalid data provided',
    statusCode: 400,
    details: errors,
  };
}

/**
 * Central error handler for API routes
 * 
 * Usage:
 * ```typescript
 * try {
 *   // Your code
 * } catch (error) {
 *   return handleApiError(error);
 * }
 * ```
 * 
 * @param error - Error object
 * @returns NextResponse with formatted error
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  let errorResponse: ErrorResponse;

  // Handle custom API errors
  if (error instanceof ApiError) {
    errorResponse = {
      success: false,
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  // Handle Mongoose validation errors
  else if (error instanceof mongoose.Error.ValidationError) {
    errorResponse = handleMongooseValidationError(error);
  }
  // Handle Mongoose cast errors
  else if (error instanceof mongoose.Error.CastError) {
    errorResponse = handleMongooseCastError(error);
  }
  // Handle Mongoose duplicate key errors
  else if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    errorResponse = handleMongooseDuplicateKeyError(error as unknown as { keyValue: Record<string, unknown> });
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    errorResponse = handleZodError(error);
  }
  // Handle generic errors
  else if (error instanceof Error) {
    errorResponse = {
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }
  // Handle unknown errors
  else {
    errorResponse = {
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    errorResponse.stack = error.stack;
  }

  return NextResponse.json(errorResponse, {
    status: errorResponse.statusCode,
  });
}


export function asyncHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}

