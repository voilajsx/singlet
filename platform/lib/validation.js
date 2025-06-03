/**
 * @fileoverview Validation integration for Singlet Framework with smart defaults
 * @description Provides validation utilities with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/validation.js
 */

import {
  validate,
  validateAsync,
  createValidator,
  createAsyncValidator,
  isEmail,
  isUrl,
  isAlphanumeric,
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
  commonSchemas,
  ValidationError,
  utils,
} from '@voilajsx/appkit/validation';

/**
 * Re-export core appkit validation functions with same names
 */
export {
  validate,
  validateAsync,
  createValidator,
  createAsyncValidator,
  isEmail,
  isUrl,
  isAlphanumeric,
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
  commonSchemas,
  ValidationError,
  utils,
};

/**
 * Creates a validation error with Singlet-specific formatting
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Error} Validation error instance
 */
function createValidationError(message, details = null) {
  const error = new ValidationError(message, details?.validationErrors);
  error.details = {
    framework: '@voilajsx/singlet',
    timestamp: new Date().toISOString(),
    ...details,
  };
  return error;
}

/**
 * Validates request data against a schema with Singlet defaults
 * @param {any} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} options - Validation options
 * @param {string} [options.part='body'] - Request part (body, query, params)
 * @param {number} [options.statusCode=400] - HTTP status code for errors
 * @returns {any} Validated and potentially transformed data
 * @throws {ValidationError} If validation fails
 */
export function validateRequest(data, schema, options = {}) {
  try {
    const part = options.part || 'body';
    let processedData = data;

    // Preprocess query and params
    if (part === 'query') {
      processedData = sanitizeObject(data, { removeEmpty: true });
    } else if (part === 'params') {
      processedData = sanitizeObject(data, {
        properties: Object.keys(data).reduce(
          (acc, key) => ({
            ...acc,
            [key]: { trim: true },
          }),
          {}
        ),
      });
    }

    const result = validate(processedData, schema, options);

    if (!result.valid) {
      const errorMessages = result.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(', ');
      throw createValidationError(
        `${part} validation failed: ${errorMessages}`,
        {
          validationErrors: result.errors,
          receivedData: data,
          part,
        }
      );
    }

    return result.value;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw createValidationError(`${part} validation failed`, {
      originalError: error.message,
      receivedData: data,
      part,
    });
  }
}

/**
 * Creates validation middleware for Fastify routes with Singlet defaults
 * @param {Object} schema - Validation schema
 * @param {Object} options - Validation options
 * @param {string} [options.part='body'] - Request part to validate
 * @param {number} [options.statusCode=400] - HTTP status code for errors
 * @returns {Function} Fastify middleware function
 */
export function createValidationMiddleware(schema, options = {}) {
  return async (request, reply) => {
    try {
      const target = options.part || 'body';
      request[target] = validateRequest(request[target], schema, {
        ...options,
        part: target,
      });
    } catch (error) {
      reply.code(options.statusCode || 400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.details,
      });
    }
  };
}
