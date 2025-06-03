/**
 * @fileoverview Error handling for Singlet Framework with smart defaults
 * @description Provides error utilities with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/error.js
 */

import {
  ErrorTypes,
  AppError,
  validationError,
  notFoundError,
  authError,
  serverError,
  errorHandler as appkitErrorHandler,
  asyncHandler as appkitAsyncHandler,
  notFoundHandler as appkitNotFoundHandler,
} from '@voilajsx/appkit/error';
import { getLogger } from './logging.js';

/**
 * Fastify-compatible asyncHandler that maintains AppKit interface
 * Fixes the response handling issue while keeping the same function signature
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped handler compatible with Fastify
 */
export function asyncHandler(fn) {
  return async (request, reply) => {
    try {
      // Execute the handler
      const result = await fn(request, reply);

      // If reply was already sent, don't interfere
      if (reply.sent) {
        return;
      }

      // If handler returned a value, let Fastify handle it
      if (result !== undefined) {
        return result;
      }
    } catch (error) {
      // Re-throw to let Fastify's error system handle it
      throw error;
    }
  };
}

/**
 * Fastify-compatible errorHandler that maintains AppKit interface
 * @param {Object} options - Error handler options (maintains AppKit compatibility)
 * @returns {Function} Fastify error handler
 */
export function errorHandler(options = {}) {
  const logger = getLogger().child({ operation: 'errorHandler' });

  return async (error, request, reply) => {
    // Log the error
    logger.error('Request error occurred:', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      type: error.type,
    });

    // Handle AppKit errors with proper status codes
    if (error.type) {
      const statusCode = getStatusCodeFromErrorType(error.type);
      const formattedError = formatErrorForFastify(error);
      return reply.status(statusCode).send(formattedError);
    }

    // Handle validation errors
    if (error.validation) {
      const validationErr = validationError('Validation failed', {
        fields: error.validation,
      });
      return reply.status(400).send(formatErrorForFastify(validationErr));
    }

    // Handle other common errors
    if (error.name === 'JsonWebTokenError') {
      const authErr = authError('Invalid token');
      return reply.status(401).send(formatErrorForFastify(authErr));
    }

    if (error.name === 'CastError') {
      const validationErr = validationError('Invalid ID format');
      return reply.status(400).send(formatErrorForFastify(validationErr));
    }

    // Generic server error
    const genericError = serverError('Internal server error');
    return reply.status(500).send(formatErrorForFastify(genericError));
  };
}

/**
 * Fastify-compatible notFoundHandler that maintains AppKit interface
 * @param {Object} options - Not found handler options (maintains AppKit compatibility)
 * @returns {Function} Fastify not found handler
 */
export function notFoundHandler(options = {}) {
  return async (request, reply) => {
    const error = notFoundError(
      `Route ${request.method} ${request.url} not found`
    );
    return reply.status(404).send(formatErrorForFastify(error));
  };
}

/**
 * Maps AppKit error types to HTTP status codes
 * @param {string} errorType - AppKit error type
 * @returns {number} HTTP status code
 */
function getStatusCodeFromErrorType(errorType) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    AUTH_ERROR: 401,
    AUTHORIZATION_ERROR: 403,
    CONFLICT: 409,
    RATE_LIMIT_EXCEEDED: 429,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };
  return statusMap[errorType] || 500;
}

/**
 * Formats AppKit errors for Fastify response
 * @param {AppError} error - AppKit error
 * @returns {Object} Formatted error object
 */
function formatErrorForFastify(error) {
  return {
    error: error.type || 'SERVER_ERROR',
    message: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Re-export all other appkit error functions with same names
 * These work perfectly with Fastify as-is
 */
export {
  ErrorTypes,
  AppError,
  validationError,
  notFoundError,
  authError,
  serverError,
} from '@voilajsx/appkit/error';
