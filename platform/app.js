/**
 * @fileoverview Main bootstrap module for @voilajsx/singlet framework
 * @description Handles server initialization, middleware setup, and lifecycle management
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /platform/app.js
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes.js';

// Import from centralized lib modules
import { initConfig, getConfig } from './lib/config.js';
import { initLogger, getLogger } from './lib/logging.js';
import { errorHandler, notFoundHandler } from './lib/error.js';

/**
 * @typedef {Object} ServerConfig
 * @property {number} port - Server port number
 * @property {string} host - Server host address
 * @property {string} environment - Current environment (development/production)
 */

let logger;
let voilaInstance;

/**
 * Bootstrap the Singlet framework application
 * Sets up configuration, logging, CORS, routes, and error handlers
 * @async
 * @function bootstrap
 * @throws {Error} When bootstrap configuration fails
 * @returns {Promise<void>}
 */
async function bootstrap() {
  try {
    // 1. Initialize Configuration with auto-feature mapping
    await initConfig();

    // 2. Initialize Logger with config integration
    logger = initLogger();
    logger.info('[Singlet] Bootstrap starting...');

    // 3. Initialize Voila Framework
    voilaInstance = Fastify({
      logger: false, // Use our centralized logger instead
    });

    // 4. Add request/response logging hooks with favicon filtering
    voilaInstance.addHook('onRequest', async (request, reply) => {
      // Skip logging favicon and other browser noise
      if (
        request.url === '/favicon.ico' ||
        request.url === '/robots.txt' ||
        request.url === '/apple-touch-icon.png' ||
        request.url === '/manifest.json'
      ) {
        return;
      }

      logger.info('[Singlet] Incoming request', {
        method: request.method,
        url: request.url,
        remoteAddress: request.ip,
      });
    });

    voilaInstance.addHook('onResponse', async (request, reply) => {
      // Skip logging favicon and other browser noise
      if (
        request.url === '/favicon.ico' ||
        request.url === '/robots.txt' ||
        request.url === '/apple-touch-icon.png' ||
        request.url === '/manifest.json'
      ) {
        return;
      }

      logger.info('[Singlet] Request completed', {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      });
    });

    // 5. Register CORS middleware
    await voilaInstance.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // 6. Register application routes
    await voilaInstance.register(routes);

    // 7. Set up AppKit error handling AFTER routes
    voilaInstance.setNotFoundHandler(notFoundHandler());
    voilaInstance.setErrorHandler(errorHandler());

    logger.info('[Singlet] Bootstrap completed successfully');
  } catch (err) {
    if (logger) {
      logger.error('[Singlet] Bootstrap failed:', {
        error: err.message,
        stack: err.stack,
        code: err.code,
      });
    } else {
      console.error(
        '❌ Singlet Framework bootstrap failed before logger initialization:',
        err
      );
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

    // Get server configuration
    const serverConfig = getConfig('server', {
      port: 3000,
      host: '0.0.0.0',
    });
    const appConfig = getConfig('app', {
      name: '@voilajsx/singlet-app',
      version: '1.0.0',
      environment: 'development',
    });

    const { port, host } = serverConfig;

    await voilaInstance.listen({ port, host });

    logger.info('🚀 @voilajsx/singlet Framework Started:', {
      url: `http://${host}:${port}`,
      healthUrl: `http://${host}:${port}/health`,
      apiInfoUrl: `http://${host}:${port}/api/info`,
      environment: appConfig.environment,
      frameworkVersion: appConfig.version,
    });
  } catch (err) {
    if (logger) {
      logger.error('[Singlet] Server startup failed:', {
        error: err.message,
        stack: err.stack,
      });
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

    // Close Voila instance
    if (voilaInstance) {
      await voilaInstance.close();
      console.log('[Shutdown] Voila instance closed.');
    }

    // Flush and close logger
    if (logger) {
      try {
        await Promise.race([
          (async () => {
            await logger.flush();
            await logger.close();
          })(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Logger shutdown timed out')),
              1000
            )
          ),
        ]);
        console.log('[Shutdown] Logger closed successfully.');
      } catch (loggerErr) {
        console.warn(
          `[Shutdown] Logger shutdown warning: ${loggerErr.message}`
        );
      }
    }

    if (logger) {
      logger.info('✅ Singlet framework closed gracefully');
    } else {
      console.log('✅ Singlet framework closed gracefully');
    }
  } catch (err) {
    console.error('❌ Error during Singlet shutdown:', err);
  } finally {
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
 * Export Singlet framework functions, Voila instance, and logger getter
 * @exports
 */
export { start, stop, voilaInstance as voila, getLogger };
