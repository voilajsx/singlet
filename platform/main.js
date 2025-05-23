/**
 * @fileoverview Main bootstrap module for @voilajsx/singlet framework
 * @description Handles server initialization, middleware setup, and lifecycle management
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /platform/main.js
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routing.js';
import { loadConfig, ConfigError } from '@voilajsx/appkit/config';
import { configSchema, envMap } from './app.config.js';

// Import logger initialization and getter from the new centralized logger file
import { initializeAndGetAppLogger, getAppLogger } from './lib/logger.js';

/**
 * @typedef {Object} ServerConfig
 * @property {number} port - Server port number
 * @property {string} host - Server host address
 * @property {string} environment - Current environment (development/production)
 */

let appConfig = {};
let logger; // This logger variable will hold the initialized instance
let fastifyInstance; // Declared at module scope

/**
 * Bootstrap the Singlet framework application
 * Sets up CORS, logging hooks, routes, and error handlers
 * @async
 * @function bootstrap
 * @throws {Error} When bootstrap configuration fails
 * @returns {Promise<void>}
 */
async function bootstrap() {
  try {
    // 1. Load Application Configuration from environment variables
    const loadedConfig = await loadConfig(process.env, {
      validate: true,
      schema: configSchema,
      env: true,
      interpolate: true,
      map: envMap,
    });
    appConfig = loadedConfig;

    appConfig.app = appConfig.app || {};
    appConfig.server = appConfig.server || {};
    appConfig.logging = appConfig.logging || {};
    appConfig.features = appConfig.features || {};

    appConfig.server.port = parseInt(appConfig.server.port || '3000', 10);
    appConfig.server.host = appConfig.server.host || '0.0.0.0';

    if (appConfig.server.ssl) {
      appConfig.server.ssl.enabled =
        String(appConfig.server.ssl.enabled || 'false').toLowerCase() ===
        'true';
    } else {
      appConfig.server.ssl = { enabled: false, key: null, cert: null };
    }

    appConfig.logging.enableFileLogging =
      String(appConfig.logging.enableFileLogging || 'true').toLowerCase() ===
      'true';
    appConfig.logging.retentionDays = parseInt(
      appConfig.logging.retentionDays || '5',
      10
    );
    appConfig.logging.maxSize = parseInt(
      appConfig.logging.maxSize || '10485760',
      10
    );
    appConfig.logging.dirname = 'platform/logs';
    appConfig.logging.filename = appConfig.logging.filename || 'app.log';

    // 2. Initialize Appkit Logger using the new centralized function
    logger = initializeAndGetAppLogger(
      {
        level: appConfig.logging.level,
        enableFileLogging: appConfig.logging.enableFileLogging,
        dirname: appConfig.logging.dirname,
        filename: appConfig.logging.filename,
        retentionDays: appConfig.logging.retentionDays,
        maxSize: appConfig.logging.maxSize,
      },
      {
        service: appConfig.app.name || '@voilajsx/singlet-app',
        environment: appConfig.app.environment || 'development',
        version: appConfig.app.version || '1.0.0',
      }
    );

    logger.info('[Application] Greeting! Starting your Singlet application...');

    // 3. Initialize Fastify
    fastifyInstance = Fastify({
      logger: false, // Disable Fastify's default logger
    });

    fastifyInstance.addHook('onRequest', async (request, reply) => {
      logger.info(`[Singlet] Incoming request`, {
        method: request.method,
        url: request.url,
        remoteAddress: request.ip,
      });
    });

    fastifyInstance.addHook('onResponse', async (request, reply) => {
      logger.info(`[Singlet] Request completed`, {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      });
    });

    await fastifyInstance.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await fastifyInstance.register(routes);

    fastifyInstance.setErrorHandler(async (error, request, reply) => {
      if (logger) {
        logger.error('Unhandled error occurred', {
          error: error.message,
          stack: error.stack,
          code: error.code,
          method: request.method,
          url: request.url,
        });
      } else {
        console.error(
          '❌ Unhandled error occurred (logger not initialized):',
          error
        );
      }
      reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
        framework: '@voilajsx/singlet',
        timestamp: new Date().toISOString(),
      });
    });

    if (logger) {
      logger.info('[Singlet] Bootstrap completed successfully');
    } else {
      console.log(
        '[Singlet] Bootstrap completed successfully (logger not initialized)'
      );
    }
  } catch (err) {
    if (logger) {
      logger.error('[Singlet] Bootstrap failed:', err);
    } else {
      console.error(
        '❌ Singlet Framework bootstrap failed before logger initialization:',
        err
      );
    }
    if (err instanceof ConfigError) {
      console.error(
        `Config Error Details: Code: ${err.code}, Message: ${err.message}`
      );
      if (err.details && err.details.errors) {
        err.details.errors.forEach((validationErr) => {
          console.error(
            `  - Path: ${validationErr.path || 'N/A'}, Issue: ${
              validationErr.message
            }`
          );
        });
      }
    }
    throw err;
  }
}

/**
 * Start the Singlet framework server
 * Initializes bootstrap and starts listening on configured port
 * @async
 * @function start
 * @returns {Promise<void>}
 * @throws {Error} When server startup fails
 */
async function start() {
  try {
    await bootstrap();

    const PORT = appConfig.server.port || 3000;
    const HOST = appConfig.server.host || '0.0.0.0';

    await fastifyInstance.listen({ port: PORT, host: HOST });

    if (logger) {
      logger.info('🚀 @voilajsx/singlet Framework Started:', {
        url: `http://${HOST}:${PORT}`,
        healthUrl: `http://${HOST}:${PORT}/health`,
        apiInfoUrl: `http://${HOST}:${PORT}/api/info`,
        environment: appConfig.app.environment || 'development',
        frameworkVersion: appConfig.app.version || '1.0.0',
      });
    } else {
      console.log(
        `🚀 @voilajsx/singlet Framework Started on http://${HOST}:${PORT}`
      );
    }
  } catch (err) {
    if (logger) {
      logger.error('[Singlet] Server startup failed:', err);
    } else {
      console.error('❌ Singlet Framework server startup failed:', err);
    }
    throw err;
  }
}

/**
 * Stop the Singlet framework server gracefully
 * Closes all connections and cleans up resources
 * @async
 * @function stop
 * @returns {Promise<void>}
 * @throws {Error} When shutdown process fails
 */
async function stop() {
  try {
    if (logger) {
      logger.info('🛑 Shutting down @voilajsx/singlet framework...');
    } else {
      console.log(
        '\n🛑 Shutting down @voilajsx/singlet framework (logger not initialized)...'
      );
    }

    console.log('[Shutdown] Attempting to close Fastify instance...');
    if (fastifyInstance) {
      await fastifyInstance.close();
      console.log('[Shutdown] Fastify instance closed.');
    } else {
      console.log(
        '[Shutdown] Fastify instance not initialized, skipping close.'
      );
    }

    console.log(
      '[Shutdown] Attempting to flush and close logger transports with timeout...'
    );
    if (logger) {
      const loggerShutdownTimeout = 1000;
      try {
        await Promise.race([
          (async () => {
            await logger.flush();
            await logger.close();
          })(),
          new Promise((resolve, reject) =>
            setTimeout(
              () => reject(new Error('Logger shutdown timed out')),
              loggerShutdownTimeout
            )
          ),
        ]);
        console.log(
          '[Shutdown] Logger transports flushed and closed within timeout.'
        );
      } catch (loggerErr) {
        console.warn(
          `[Shutdown] Warning: ${
            loggerErr.message || 'Logger shutdown failed'
          }. Proceeding with exit.`
        );
      }
    } else {
      console.log(
        '[Shutdown] Logger not initialized, skipping flush and close.'
      );
    }

    if (logger) {
      logger.info('✅ Singlet framework closed gracefully');
    } else {
      console.log('✅ Singlet framework closed gracefully');
    }
  } catch (err) {
    console.error('❌ Error during Singlet shutdown:', err);
  } finally {
    console.log('[Shutdown] Exiting process...');
    process.exit(0);
  }
}

/**
 * Handle process signals for graceful shutdown
 */
process.on('SIGINT', async () => {
  await stop();
});

process.on('SIGTERM', async () => {
  await stop();
});

/**
 * Export Singlet framework functions, the Fastify instance as 'app', and the logger getter function.
 * @exports
 */
export { start, stop, fastifyInstance as app, getAppLogger as appLogger };
