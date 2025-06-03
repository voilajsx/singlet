/**
 * @fileoverview Platform route definitions for Singlet Framework
 * @description Core system routes and endpoints
 * @package @voilajsx/singlet
 * @file /platform/routes.js
 */

/**
 * Register all platform routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify server instance
 * @param {Object} config - Application configuration
 */
export function setupPlatformRoutes(fastify, config) {
  // Application root endpoint
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Hello from Singlet!',
      status: 'Running',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      environment: config.app.environment,
    };
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: config.app.version,
    };
  });

  // Application information endpoint
  fastify.get('/api/info', async (request, reply) => {
    return {
      name: config.app.name,
      framework: '@voilajsx/singlet',
      version: config.app.version,
      environment: config.app.environment,
      node: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    };
  });

  // Feature flags endpoint
  fastify.get('/api/features', async (request, reply) => {
    return {
      features: config.features || {},
      timestamp: new Date().toISOString(),
    };
  });
}
