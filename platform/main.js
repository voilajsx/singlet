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

/**
 * @typedef {Object} ServerConfig
 * @property {number} port - Server port number
 * @property {string} host - Server host address
 * @property {string} environment - Current environment (development/production)
 */

/**
 * @typedef {Object} MemoryUsage
 * @property {number} rss - Resident Set Size
 * @property {number} heapTotal - Total heap size
 * @property {number} heapUsed - Used heap size
 * @property {number} external - External memory usage
 */

/**
 * Fastify instance with configured logger for Singlet framework
 * @type {import('fastify').FastifyInstance}
 */
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

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
    // Global request logging middleware
    fastify.addHook('onRequest', async (request, reply) => {
      request.log.info(`[Singlet] ${request.method} ${request.url}`);
    });

    // CORS configuration for Singlet framework
    await fastify.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Register all Singlet routes
    await fastify.register(routes);

    // Global error handler for Singlet framework
    fastify.setErrorHandler(async (error, request, reply) => {
      request.log.error('[Singlet Error]', error);
      reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
        framework: '@voilajsx/singlet',
        timestamp: new Date().toISOString(),
      });
    });

    fastify.log.info('[Singlet] Bootstrap completed successfully');
  } catch (err) {
    fastify.log.error('[Singlet] Bootstrap failed:', err);
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

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: PORT, host: HOST });

    console.log('🚀 @voilajsx/singlet Framework Started:');
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API Info: http://localhost:${PORT}/api/info`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Framework: @voilajsx/singlet v1.0.0`);
  } catch (err) {
    fastify.log.error('[Singlet] Server startup failed:', err);
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
    console.log('\n🛑 Shutting down @voilajsx/singlet framework...');
    await fastify.close();
    console.log('✅ Singlet framework closed gracefully');
  } catch (err) {
    console.error('❌ Error during Singlet shutdown:', err);
    throw err;
  }
}

// Handle process signals for graceful shutdown
process.on('SIGINT', async () => {
  await stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stop();
  process.exit(0);
});

/**
 * Export Singlet framework functions and instance
 * @exports
 */
export { start, stop, fastify as app };
