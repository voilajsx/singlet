/**
 * @fileoverview Singlet Framework - Core Implementation
 * @description Server setup, configuration, and lifecycle management
 * @package @voilajsx/singlet
 * @file /platform/app.js
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { initConfig, getConfig } from './lib/config.js';
import { initLogger, getLogger } from './lib/logging.js';
import { setupComponents, getDiscoveredComponents } from './discovery.js';

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
    jwt: getConfig('jwt', {}),
    apps: getConfig('apps', { system: true }),
    features: getConfig('features', {}),
  };

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

  // Smart CORS configuration based on environment
  const environment = config.app.environment;
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';

  let corsOrigins;
  if (isDevelopment) {
    // Development: Allow common local dev origins
    corsOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite
      'http://localhost:8080', // Vue CLI
      'capacitor://localhost', // Capacitor mobile apps
      'http://localhost', // Generic localhost
    ];
  } else if (isProduction) {
    // Production: Must be explicitly configured via environment
    const envOrigins = process.env.CORS_ORIGINS;
    if (envOrigins) {
      corsOrigins = envOrigins.split(',').map((origin) => origin.trim());
    } else {
      // Default to false for security - origins must be explicitly set in production
      corsOrigins = false;
      logger.warn(
        '⚠️  CORS_ORIGINS not set in production - CORS disabled for security'
      );
    }
  } else {
    // Staging: Allow configuration via env or use development defaults
    const envOrigins = process.env.CORS_ORIGINS;
    corsOrigins = envOrigins
      ? envOrigins.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];
  }

  // Register CORS plugin
  await voilaInstance.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Enable cookies and authorization headers
  });

  // Register Cookie plugin with secure configuration
  await voilaInstance.register(cookie, {
    secret: getConfig('jwt.secret', 'singlet-dev-secret-change-in-production'),
    hook: 'onRequest', // Parse cookies early
    parseOptions: {
      secure: isProduction, // Only secure cookies in production
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax', // More permissive in dev
    },
  });

  logger.info('✅ Fastify plugins registered (CORS, Cookies)');
  logger.info(
    `🌐 CORS origins: ${
      Array.isArray(corsOrigins) ? corsOrigins.join(', ') : corsOrigins
    }`
  );

  return voilaInstance;
}

/**
 * Register all application routes and components
 * @param {Object} server - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
export async function setupRoutes(server, config, logger) {
  // Use the discovery module to set up all components
  await setupComponents(server, config, logger);
}

/**
 * Start the HTTP server
 * @param {Object} server - Configured Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
export async function startServer(server, config, logger) {
  await server.listen(config.server);

  const {
    platformAppsBackend,
    platformAppsFrontend,
    featureBackend,
    featureFrontend,
  } = getDiscoveredComponents();

  logger.info(
    `Server ready: http://${config.server.host}:${config.server.port}`
  );

  // Log discovered components summary
  if (platformAppsBackend.size > 0) {
    const appsList = Array.from(platformAppsBackend.keys()).join(', ');
    logger.info(`Platform apps active: ${appsList}`);
  }

  if (featureBackend.size > 0) {
    const featuresList = Array.from(featureBackend.keys()).join(', ');
    logger.info(`Features active: ${featuresList}`);
  }

  if (platformAppsFrontend.size > 0 || featureFrontend.size > 0) {
    const frontendCount = platformAppsFrontend.size + featureFrontend.size;
    logger.info(`Frontend applications: ${frontendCount} active`);
  }
}

/**
 * Graceful shutdown handler
 */
let shutdownInProgress = false;

async function gracefulShutdown(signal) {
  if (shutdownInProgress) {
    return;
  }
  shutdownInProgress = true;

  logger?.info(`Shutting down Singlet (${signal})`);

  try {
    if (voilaInstance) {
      await voilaInstance.close();
    }

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

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { getLogger, voilaInstance as voila };
