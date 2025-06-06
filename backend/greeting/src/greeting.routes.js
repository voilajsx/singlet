/**
 * @fileoverview Greeting feature route definitions
 * @description Simple routes with auth for the greeting feature
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.routes.js
 */

import { getLogger } from '@platform/lib/logging.js';
import { auth, admin, user } from '@platform/lib/auth.js';
import * as controller from './greeting.controller.js';

/**
 * Greeting feature routes
 * @param {Object} voila - Fastify instance
 * @param {Object} options - Plugin options with config and logger
 */
async function greetingRoutes(voila, options) {
  const config = options.config;
  const logger = options.logger || getLogger('greeting');

  logger.info('🎯 Initializing greeting routes...');

  // Public routes - no authentication required
  voila.get('/', async (request, reply) => {
    return controller.getRandomGreeting();
  });

  voila.get('/lang/:language', async (request, reply) => {
    return controller.getLanguageGreeting(request.params.language);
  });

  voila.get('/all', async (request, reply) => {
    return controller.getAllGreetings();
  });

  voila.get('/languages', async (request, reply) => {
    return controller.getLanguages();
  });

  // Authenticated routes - require login
  voila.post('/custom', { preHandler: auth }, async (request, reply) => {
    return {
      message: `Hello ${request.user.name}! Your custom greeting was created.`,
      user: request.user.name,
      timestamp: new Date().toISOString(),
    };
  });

  voila.get('/personal', { preHandler: user }, async (request, reply) => {
    return {
      greeting: `Welcome back, ${request.user.name}!`,
      role: request.user.role,
      email: request.user.email,
    };
  });

  // Admin routes - require admin role
  voila.post('/admin/add', { preHandler: admin }, async (request, reply) => {
    return {
      message: `Admin ${request.user.name} added a new greeting`,
      success: true,
    };
  });

  voila.get('/admin/stats', { preHandler: admin }, async (request, reply) => {
    return {
      totalGreetings: 42,
      adminUser: request.user.name,
      message: 'Admin stats accessed',
    };
  });

  logger.info('✅ Greeting routes initialized successfully');
}

export default greetingRoutes;
