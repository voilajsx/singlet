// platform/tests/vitest.setup.js

import { vi } from 'vitest';

// --- Mocks for @platform/lib/logging ---
vi.mock('@platform/lib/logging.js', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  initLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    flush: vi.fn(),
    close: vi.fn(),
  })),
}));

// --- Mocks for @platform/lib/error.js ---
class MockAppError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'AppError'; // Useful for general debugging and specific checks
    this.type = type; // Critical for the `error` field in the response payload
    this.details = details;
    this.statusCode = this.getStatusCode(type);
  }

  getStatusCode(type) {
    switch (type) {
      case 'VALIDATION_ERROR':
        return 400;
      case 'NOT_FOUND':
        return 404;
      case 'AUTH_ERROR':
        return 401;
      case 'SERVER_ERROR':
        return 500;
      default:
        return 500;
    }
  }

  // This method defines the exact JSON structure your tests are expecting for AppErrors.
  // It matches the behavior of your actual `formatErrorForFastify` function.
  toJSON() {
    return {
      error: this.type, // Directly use the AppError's `type` for the 'error' field
      message: this.message,
      // Only include `details` if it's not empty, to match cleaner JSON output.
      ...(Object.keys(this.details).length > 0 && { details: this.details }),
      timestamp: new Date().toISOString(), // Ensure `timestamp` is always present.
    };
  }
}

vi.mock('@platform/lib/error.js', () => ({
  // The global error handler for Fastify.
  // It's designed to catch thrown errors (including AppErrors) and format the response.
  errorHandler: vi.fn(() => (error, req, reply) => {
    // --- Uncomment these lines for detailed debugging if issues persist ---
    // console.log("\n--- ErrorHandler Mock Called ---");
    // console.log("Incoming Error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    // console.log("Incoming Error name:", error.name);
    // console.log("Incoming Error message:", error.message);
    // console.log("Does error have .type property?", !!error.type);
    // console.log("Error.originalError (if any):", error.originalError ? JSON.stringify(error.originalError, Object.getOwnPropertyNames(error.originalError), 2) : 'N/A');
    // console.log("Error.cause (if any):", error.cause ? JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause), 2) : 'N/A');
    // --- End Debugging ---

    let finalError = error; // Start with the raw error received by Fastify.

    // Attempt to unwrap Fastify's internal error if it exists.
    // Look for a nested error that has our specific 'type' property (unique to AppError).
    if (error && (error.originalError || error.cause)) {
      if (error.originalError && error.originalError.type) {
        finalError = error.originalError;
      } else if (error.cause && error.cause.type) {
        finalError = error.cause;
      }
    }

    let responsePayload;
    let statusCode;

    // Check if the finalError has our AppError's specific `type` property.
    // This is more robust than `instanceof` or `name` checks if Fastify alters the error object.
    if (finalError.type) {
      // If it has a 'type' property, assume it's our AppError.
      statusCode = finalError.statusCode || 500; // Use its statusCode, fallback to 500
      responsePayload = finalError.toJSON(); // Use its toJSON to get the structured payload
    } else {
      // Fallback for errors that are not identifiable as our AppError types.
      // This will catch generic Fastify errors, or any other unexpected JavaScript errors.
      statusCode = error.statusCode || 500;
      const errorMessage = error.message || 'An unexpected error occurred.';

      // Explicitly set the 'error' field based on standard HTTP status codes
      // or fall back to the error's name. This handles the 'Bad Request' received issue
      // when it's NOT an AppError.
      let errorTitle = error.name || 'Error';
      if (statusCode === 400) errorTitle = 'Bad Request';
      else if (statusCode === 404) errorTitle = 'Not Found';
      else if (statusCode === 401) errorTitle = 'Unauthorized';
      else if (statusCode === 403) errorTitle = 'Forbidden';
      else if (statusCode === 500) errorTitle = 'Internal Server Error';

      responsePayload = {
        error: errorTitle,
        message: errorMessage,
        timestamp: new Date().toISOString(), // Always include timestamp here too.
        // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Optional: include stack in dev.
      };
    }
    // Send the constructed payload with the determined status code.
    reply.status(statusCode).send(responsePayload);
  }),

  // This handler is for routes that were *not matched* at all.
  // It should return a generic 404.
  // The '404 for invalid language' test case is handled by `errorHandler` because the route is matched,
  // but then *throws* `notFoundError`.
  notFoundHandler: vi.fn(() => (req, reply) => {
    const error = new MockAppError('NOT_FOUND', `Route ${req.url} not found`);
    reply.status(error.statusCode).send(error.toJSON());
  }),

  // Export the MockAppError class and all factory functions.
  // These factories will create MockAppError instances with the correct `type` property.
  AppError: MockAppError,
  validationError: vi.fn((message, details) => {
    return new MockAppError('VALIDATION_ERROR', message, {
      framework: '@voilajsx/singlet',
      validationErrors: details
        ? Object.keys(details).map((key) => ({
            path: key,
            message: details[key],
          }))
        : [],
    });
  }),
  notFoundError: vi.fn((message) => {
    // This is the factory function called by `greeting.routes.js`
    // when a specific language is not found.
    return new MockAppError('NOT_FOUND', message || 'Not found');
  }),
  authError: vi.fn(
    (message) =>
      new MockAppError('AUTH_ERROR', message || 'Authentication failed')
  ),
  serverError: vi.fn(
    (message, details) =>
      new MockAppError('SERVER_ERROR', message || 'Server error', details)
  ),
}));

// --- Mocks for @platform/lib/config.js ---
// Maintains a simple in-memory store for configuration values used in tests.
const mockConfigStore = new Map();
vi.mock('@platform/lib/config.js', () => ({
  initConfig: vi.fn(async () => {
    // Simulate loading default configuration values expected by `app.js`.
    mockConfigStore.set('server.port', 3000);
    mockConfigStore.set('server.host', '0.0.0.0');
    mockConfigStore.set('app.name', '@voilajsx/singlet-app');
    mockConfigStore.set('app.version', '1.0.0');
    mockConfigStore.set('app.environment', 'test');
    mockConfigStore.set('features.greeting', true); // Essential for route discovery.
  }),
  getConfig: vi.fn((path, defaultValue) => {
    if (mockConfigStore.has(path)) {
      return mockConfigStore.get(path);
    }
    if (path.startsWith('features.')) {
      return defaultValue !== undefined ? defaultValue : true;
    }
    return defaultValue;
  }),
  hasConfig: vi.fn((path) => mockConfigStore.has(path)),
  createConfigSchema: vi.fn(),
  validateConfigSchema: vi.fn(() => ({
    valid: true,
    errors: [],
    warnings: [],
  })),
}));

// --- Mocks for @platform/lib/validation.js ---
// Simulates the `validateRequest` function, performing basic schema validation
// and throwing a `MockAppError` on validation failure.
vi.mock('@platform/lib/validation.js', () => ({
  validateRequest: vi.fn((body, schema) => {
    const errors = {};
    if (schema.properties) {
      for (const key in schema.properties) {
        const prop = schema.properties[key];
        const value = body[key];

        if (
          prop.required &&
          (value === undefined || value === null || value === '')
        ) {
          errors[key] = 'Field is required';
        }
        if (
          value !== undefined &&
          value !== null &&
          prop.minLength &&
          value.length < prop.minLength
        ) {
          errors[key] = `Field must be at least ${prop.minLength} characters`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      // Throw a `MockAppError` of type `VALIDATION_ERROR`.
      // The `message` here is the internal message for the `AppError` instance.
      // The `errorHandler` (via `toJSON`) will then correctly map this `type` to the `error` field in the payload.
      throw new MockAppError('VALIDATION_ERROR', 'Validation failed', {
        framework: '@voilajsx/singlet',
        validationErrors: Object.keys(errors).map((key) => ({
          path: key,
          message: errors[key],
        })),
      });
    }

    // Apply default values from the schema if validation passes.
    const validatedBody = { ...body };
    if (schema.properties) {
      for (const key in schema.properties) {
        const prop = schema.properties[key];
        if (validatedBody[key] === undefined && prop.default !== undefined) {
          validatedBody[key] = prop.default;
        }
      }
    }
    return validatedBody;
  }),
}));
