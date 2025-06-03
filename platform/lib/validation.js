/**
 * @fileoverview Request validation module for @voilajsx/singlet framework
 * @description Provides request validation utilities using @voilajsx/appkit
 * @package @voilajsx/singlet
 * @file /platform/lib/validation.js
 */

// Fix: Use static import instead of dynamic await import
import { validate } from '@voilajsx/appkit/validation';

/**
 * Creates a validation error with details
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Error} Validation error instance
 */
function createValidationError(message, details = null) {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.details = details;
  return error;
}

/**
 * Validates request data against a schema
 * @param {any} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} options - Validation options
 * @returns {any} Validated and potentially transformed data
 * @throws {Error} If validation fails
 */
export function validateRequest(data, schema, options = {}) {
  try {
    const result = validate(data, schema, options);

    if (!result.valid) {
      // Convert validation errors to our error format
      const errorMessages = result.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(', ');

      throw createValidationError(
        `Request validation failed: ${errorMessages}`,
        {
          validationErrors: result.errors,
          receivedData: data,
        }
      );
    }

    return result.value;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw error;
    }
    throw createValidationError('Request validation failed', {
      originalError: error.message,
      receivedData: data,
    });
  }
}

/**
 * Creates a validation middleware for Fastify routes
 * @param {Object} schema - Validation schema
 * @param {Object} options - Validation options
 * @returns {Function} Fastify middleware function
 */
export function createValidationMiddleware(schema, options = {}) {
  return async (request, reply) => {
    try {
      // Validate request body by default, but allow other targets
      const target = options.target || 'body';
      const data = request[target];

      const validatedData = validateRequest(data, schema, options);

      // Replace request data with validated/transformed data
      request[target] = validatedData;
    } catch (error) {
      reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.details,
      });
    }
  };
}

/**
 * Validates query parameters
 * @param {Object} queryParams - Query parameters to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated query parameters
 * @throws {Error} If validation fails
 */
export function validateQuery(queryParams, schema) {
  return validateRequest(queryParams, schema);
}

/**
 * Validates route parameters
 * @param {Object} params - Route parameters to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated route parameters
 * @throws {Error} If validation fails
 */
export function validateParams(params, schema) {
  return validateRequest(params, schema);
}
