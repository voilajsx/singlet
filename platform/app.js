/**
 * @fileoverview Singlet Framework - Core Implementation
 * @description Server setup, configuration, and lifecycle management
 * @package @voilajsx/singlet
 * @file /platform/app.js
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initConfig, getConfig } from './lib/config.js';
import { initLogger, getLogger } from './lib/logging.js';
import { errorHandler, notFoundHandler } from './lib/error.js';
import { setupPlatformRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let logger;
let voilaInstance;

/**
 * Setup application configuration
 * @returns {Promise<Object>} Complete configuration object
 */
export async function setupConfig() {
  await initConfig();

  const config = {
    app: getConfig('app', {
      name: '@voilajsx/singlet-app',
      version: '1.0.0',
      environment: 'development',
    }),
    server: getConfig('server', { port: 3000, host: '0.0.0.0' }),
    logging: getConfig('logging', { level: 'info' }),
    security: getConfig('security', {}),
    features: getConfig('features', {}),
  };

  // Singlet Framework banner - first thing users see
  console.log(
    `🚀 @voilajsx/singlet framework v${config.app.version} (${config.app.environment})`
  );
  console.log(`⚙️  Config loaded for ${config.app.environment}`);

  return config;
}

/**
 * Initialize logging system
 * @param {Object} config - Application configuration
 * @returns {Object} Logger instance
 */
export function setupLogging(config) {
  logger = initLogger();
  return logger;
}

/**
 * Create and configure Fastify server
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 * @returns {Promise<Object>} Configured Fastify instance
 */
export async function createServer(config, logger) {
  voilaInstance = Fastify({ logger: false });

  // Request/response logging
  const shouldSkipLog = (url) =>
    [
      '/favicon.ico',
      '/robots.txt',
      '/apple-touch-icon.png',
      '/manifest.json',
    ].includes(url);

  voilaInstance.addHook('onRequest', async (request) => {
    if (!shouldSkipLog(request.url)) {
      logger.info(`→ ${request.method} ${request.url}`);
    }
  });

  voilaInstance.addHook('onResponse', async (request, reply) => {
    if (!shouldSkipLog(request.url)) {
      logger.info(`← ${request.method} ${request.url} ${reply.statusCode}`);
    }
  });

  // Register CORS middleware
  await voilaInstance.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  return voilaInstance;
}

/**
 * Register all application routes
 * @param {Object} server - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
export async function setupRoutes(server, config, logger) {
  // Platform routes
  setupPlatformRoutes(server, config);

  // Auto-discover backend features
  await discoverFeatures(server, config, logger);

  // Error handling (must be last)
  server.setNotFoundHandler(notFoundHandler());
  server.setErrorHandler(errorHandler());
}

/**
 * Start the HTTP server
 * @param {Object} server - Configured Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
export async function startServer(server, config, logger) {
  await server.listen(config.server);

  logger.info(
    `Server ready: http://${config.server.host}:${config.server.port} [health: /health, api: /api/info]`
  );
}

/**
 * Auto-discover and register backend features
 * @param {Object} fastify - Fastify instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
async function discoverFeatures(fastify, config, logger) {
  const backendPath = join(__dirname, '..', 'backend');

  let featureDirs;
  try {
    featureDirs = readdirSync(backendPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (error) {
    logger.warn(`Backend directory not found: ${backendPath}`);
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  const loadedFeatures = [];
  const failedFeatures = [];

  for (const dir of featureDirs) {
    const featureKey = `features.${dir.toLowerCase()}`;
    const enabled = getConfig(featureKey, true);

    if (!enabled) {
      logger.debug(`Feature ${dir}: disabled`);
      continue;
    }

    const routeFile = join(backendPath, dir, 'src', `${dir}.routes.js`);

    try {
      const { default: featureRoutes } = await import(`file://${routeFile}`);

      if (typeof featureRoutes !== 'function') {
        logger.error(`❌ Feature ${dir}: routes.js must export a function`);
        failedFeatures.push(dir);
        failureCount++;
        continue;
      }

      await fastify.register(featureRoutes, { prefix: `/api/${dir}` });
      logger.info(`✅ Feature: ${dir} (/api/${dir})`);
      loadedFeatures.push(dir);
      successCount++;
    } catch (err) {
      logger.error(`❌ Feature ${dir}: ${err.message}`);
      failedFeatures.push(dir);

      // Environment-aware error handling
      if (config.app.environment === 'development') {
        logger.debug(`Error details: ${err.stack}`);
        logger.debug(`File path: ${routeFile}`);
        logger.error('🛑 Development mode: stopping for debugging');
        process.exit(1);
      }

      failureCount++;
    }
  }

  // Summary - useful for deployment verification
  if (successCount > 0) {
    logger.info(
      `Features loaded: ${loadedFeatures.join(', ')} (${successCount} total)`
    );
  }

  if (failureCount > 0) {
    logger.warn(
      `Features failed: ${failedFeatures.join(', ')} (${failureCount} total)`
    );
  }
}

/**
 * Graceful shutdown handler with proper error handling
 */
let shutdownInProgress = false;

async function gracefulShutdown(signal) {
  // Prevent multiple shutdown handlers from running
  if (shutdownInProgress) {
    return;
  }
  shutdownInProgress = true;

  logger?.info(`Shutting down Singlet (${signal})`);

  try {
    // Close Fastify server first
    if (voilaInstance) {
      await voilaInstance.close();
    }

    // Close logger with timeout but don't show timeout errors
    if (logger) {
      try {
        await Promise.race([
          (async () => {
            await logger.flush?.();
            await logger.close?.();
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 1000)
          ),
        ]);
      } catch (err) {
        // Silently ignore timeout errors during shutdown
        if (err.message !== 'timeout') {
          console.error('Logger shutdown error:', err.message);
        }
      }
    }

    console.log('✅ Singlet stopped gracefully');
  } catch (err) {
    console.error('❌ Shutdown error:', err.message);
  } finally {
    process.exit(0);
  }
}

// Register shutdown handlers only once
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Export utilities
export { getLogger, voilaInstance as voila };
