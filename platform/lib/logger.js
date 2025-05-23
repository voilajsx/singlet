/**
 * @fileoverview Centralized logger for @voilajsx/singlet framework.
 * @description Provides a singleton logger instance for the entire application.
 * @package @voilajsx/singlet
 * @file /platform/lib/logger.js
 */

import {
  createLogger,
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging';

let sharedLoggerInstance = null;

/**
 * Initializes and returns the singleton logger instance.
 * This function should be called ONCE during application bootstrap (e.g., in platform/main.js).
 * Subsequent calls will return the already initialized instance.
 * @param {object} loggingConfig - Configuration object for the logger (e.g., from app.config.js).
 * @param {string} loggingConfig.level - Logging level (e.g., 'info', 'debug').
 * @param {boolean} loggingConfig.enableFileLogging - Whether to enable file logging.
 * @param {string} loggingConfig.dirname - Directory for log files.
 * @param {string} loggingConfig.filename - Name of the log file.
 * @param {number} loggingConfig.retentionDays - How many days to retain log files.
 * @param {number} loggingConfig.maxSize - Maximum size of a log file in bytes.
 * @param {object} defaultMeta - Default metadata to include with each log entry.
 * @returns {import('@voilajsx/appkit/logging').Logger} The initialized logger instance.
 */
export const initializeAndGetAppLogger = (loggingConfig, defaultMeta) => {
  if (sharedLoggerInstance) {
    // If already initialized, return the existing instance.
    console.warn(
      'Logger already initialized. `initializeAndGetAppLogger` should only be called once.'
    );
    return sharedLoggerInstance;
  }

  // Create the logger instance
  const logger = createLogger({
    level: loggingConfig.level || 'info',
    defaultMeta: defaultMeta || {},
    transports: [
      new ConsoleTransport({
        level: loggingConfig.level || 'info',
        colorize: true,
      }),
      ...(loggingConfig.enableFileLogging &&
      loggingConfig.dirname &&
      loggingConfig.filename
        ? [
            new FileTransport({
              dirname: loggingConfig.dirname,
              filename: loggingConfig.filename,
              retentionDays: loggingConfig.retentionDays,
              maxSize: loggingConfig.maxSize,
              level: loggingConfig.level || 'info',
            }),
          ]
        : []),
    ],
  });

  sharedLoggerInstance = logger;
  return sharedLoggerInstance;
};

/**
 * Retrieves the singleton logger instance.
 * Consumers (like feature apps) should use this function to get the logger.
 * @returns {import('@voilajsx/appkit/logging').Logger} The logger instance, or a fallback console logger if not initialized.
 */
export const getAppLogger = () => {
  if (!sharedLoggerInstance) {
    // Fallback for cases where the logger is accessed before it's initialized.
    // This should ideally not happen in a correctly bootstrapped application.
    console.warn(
      'Attempted to access app logger before it was initialized. Returning a fallback console logger.'
    );
    // Provide a basic console object that matches the logger interface enough for common calls
    return {
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      child: () => ({
        // Return a dummy child logger that also uses console
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
      }),
    };
  }
  return sharedLoggerInstance;
};
