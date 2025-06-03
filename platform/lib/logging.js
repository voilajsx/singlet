/**
 * @fileoverview Enhanced logging with dynamic levels
 * @description Auto-sets debug level in development
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
 * Initialize logger with dynamic level based on environment
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

  // Auto-set debug level in development unless explicitly configured
  let logLevel = loggingConfig.level;
  if (appConfig.environment === 'development' && !process.env.LOG_LEVEL) {
    logLevel = 'debug';
    console.log('🐛 Development mode: Auto-enabling DEBUG logging');
  }

  const transports = [
    new ConsoleTransport({
      level: logLevel,
      colorize: true,
      prettyPrint: appConfig.environment === 'development',
    }),
  ];

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
    defaultMeta: {
      service: appConfig.name,
      environment: appConfig.environment,
      version: appConfig.version,
    },
    transports,
  });

  console.log(`📊 Logger initialized with level: ${logLevel.toUpperCase()}`);
  return logger;
}

/**
 * Enhanced getLogger that automatically creates child loggers
 * @param {string} [context] - Feature/app name for child logger (optional)
 * @returns {Object} Logger instance (child if context provided, base if not)
 */
export function getLogger(context) {
  if (!logger) {
    throw new Error('Logger not initialized. Call initLogger() first.');
  }

  if (context) {
    return logger.child({ feature: context });
  }

  return logger;
}
