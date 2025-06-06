/**
 * @fileoverview Core platform app routes for @voilajsx/singlet framework
 * @description Provides essential system information and health endpoints.
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /platform/apps/system/src/system.routes.js
 */

import { getLogger } from '@platform/lib/logging.js';

/**
 * Core Platform App Initializer.
 * Registers core framework routes under the '/api/core' prefix.
 *
 * @param {import('fastify').FastifyInstance} voila - The Fastify server instance.
 * @param {Object} options - Options passed to the plugin during registration.
 * @param {Object} options.config - The application configuration object.
 * @param {Object} [options.logger] - The logger instance (optional, if passed).
 */
async function coreRoutes(voila, options) {
  const config = options.config;
  const logger = options.logger || getLogger('core'); // Use logger from options, fallback to global with 'core' tag

  if (!config) {
    logger.error('Core app: Configuration not found in plugin options.');
    throw new Error('Configuration not available for core app.');
  }

  logger.info('🎯 Initializing core platform routes...');

  // Root endpoint for the core app
  voila.get('/', async (request, reply) => {
    logger.debug('Core app root endpoint hit');
    return {
      message: 'Hello from Singlet (Core App)!',
      feature: 'core',
      description: 'This is the core platform application endpoint',
      timestamp: new Date().toISOString(),
    };
  });

  // Health check endpoint
  voila.get('/health', async (request, reply) => {
    logger.debug('Core app health check requested');
    return {
      status: 'OK',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: config.app.version,
    };
  });

  // Application information endpoint
  voila.get('/info', async (request, reply) => {
    logger.debug('Core app info requested');
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
  voila.get('/features', async (request, reply) => {
    logger.debug('Core app feature flags requested');
    return {
      features: config.features || {},
      timestamp: new Date().toISOString(),
    };
  });

  logger.info('✅ Core platform routes initialized successfully');
}

export default coreRoutes;
