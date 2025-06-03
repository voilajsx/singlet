/**
 * @fileoverview Clean minimal logging setup
 * @description Essential logging with minimal overhead
 * @package @voilajsx/singlet
 * @file /platform/lib/logging.js
 */

import {
  createLogger,
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging';

import { getConfig } from './config.js';

let logger;

/**
 * Initialize logger with clean environment-aware setup
 * @returns {Object} Logger instance
 */
export function initLogger() {
  const appConfig = getConfig('app', {
    name: '@voilajsx/singlet-app',
    version: '1.0.0',
    environment: 'development',
  });

  const loggingConfig = getConfig('logging', {
    level: 'info',
    enableFileLogging: true,
    dirname: 'platform/logs',
    filename: 'app.log',
    retentionDays: 5,
    maxSize: 10485760,
  });

  const isDev = appConfig.environment === 'development';
  const logLevel = loggingConfig.level;

  const transports = [
    new ConsoleTransport({
      level: logLevel,
      colorize: isDev, // Only colorize in development
      prettyPrint: isDev, // Only pretty print in development
    }),
  ];

  // File logging
  if (loggingConfig.enableFileLogging) {
    transports.push(
      new FileTransport({
        level: logLevel,
        dirname: loggingConfig.dirname,
        filename: loggingConfig.filename,
        retentionDays: loggingConfig.retentionDays,
        maxSize: loggingConfig.maxSize,
      })
    );
  }

  logger = createLogger({
    level: logLevel,
    // No default metadata - keep logs clean
    defaultMeta: {},
    transports,
  });

  return logger;
}

/**
 * Get logger instance with optional context
 * @param {string} [context] - Feature context for child logger
 * @returns {Object} Logger instance
 */
export function getLogger(context) {
  if (!logger) {
    throw new Error('Logger not initialized. Call initLogger() first.');
  }

  if (context) {
    const appConfig = getConfig('app');
    const isDev = appConfig.environment === 'development';

    // Clean child loggers in both environments
    const childLogger = isDev
      ? logger.child({}) // No metadata in dev
      : logger.child({}); // No metadata in production either

    return childLogger;
  }

  return logger;
}

/**
 * Environment-aware logging helpers
 */
export const log = {
  /**
   * Feature initialization log - clean in both environments
   * @param {string} featureName - Name of the feature
   * @param {string} route - API route path
   */
  featureLoaded(featureName, route) {
    const isDev = getConfig('app.environment') === 'development';

    if (isDev) {
      logger.info(`✅ Feature: ${featureName} (${route})`);
    } else {
      logger.info(`Feature loaded: ${featureName} -> ${route}`);
    }
  },

  /**
   * Feature initialization start - only in development
   * @param {string} featureName - Name of the feature
   */
  featureInitializing(featureName) {
    const isDev = getConfig('app.environment') === 'development';

    if (isDev) {
      logger.debug(`🎯 Initializing ${featureName} routes...`);
    }
    // Silent in production
  },

  /**
   * Server startup log - clean and minimal
   * @param {string} host - Server host
   * @param {number} port - Server port
   */
  serverReady(host, port) {
    const isDev = getConfig('app.environment') === 'development';

    if (isDev) {
      logger.info(
        `Server ready: http://${host}:${port} [health: /health, api: /api/info]`
      );
    } else {
      logger.info(`Server ready: http://${host}:${port}`);
    }
  },

  /**
   * Feature summary - minimal in production
   * @param {string[]} loadedFeatures - List of loaded features
   * @param {number} successCount - Number of successful features
   */
  featureSummary(loadedFeatures, successCount) {
    const isDev = getConfig('app.environment') === 'development';

    if (isDev) {
      logger.info(
        `Features loaded: ${loadedFeatures.join(', ')} (${successCount} total)`
      );
    } else {
      logger.info(
        `${successCount} features loaded: ${loadedFeatures.join(', ')}`
      );
    }
  },
};
