/**
 * @fileoverview Welcome feature routes for @voilajsx/singlet framework
 * @description Handles welcome-related API endpoints
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /backend/welcome/src/welcome.routes.js
 */

import { validateRequest } from '@platform/lib/validation.js';
import { getLogger } from '@platform/lib/logging.js';

/**
 * Welcome feature routes.
 * @param {import('fastify').FastifyInstance} voila - Fastify instance.
 */
async function welcomeRoutes(voila) {
  const logger = getLogger('welcome');

  logger.info('🎯 Initializing welcome routes...');

  voila.get('/', async (request, reply) => {
    try {
      logger.info('Welcome root endpoint hit');
      return {
        message: 'Welcome to Singlet Framework!',
        feature: 'welcome',
        description: 'This is the welcome feature endpoint',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error in welcome root endpoint: ${error.message}`);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred processing your request',
      });
    }
  });

  voila.get('/user/:name', async (request, reply) => {
    const { name } = request.params;
    logger.info(`Personalized welcome for user: ${name}`);
    return {
      message: `Welcome ${name} to Singlet Framework!`,
      feature: 'welcome',
      user: name,
      personalizedGreeting: true,
      timestamp: new Date().toISOString(),
    };
  });

  voila.post('/message', async (request, reply) => {
    logger.debug('Processing custom welcome message request', {
      bodyKeys: Object.keys(request.body || {}),
    });

    const { name, customMessage } = validateRequest(request.body, {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, default: 'Guest' },
        customMessage: { type: 'string', required: true, minLength: 1 },
      },
    });

    logger.info('Custom welcome message created', {
      name,
      customMessage,
    });

    return {
      message: customMessage || `Welcome ${name} to Singlet!`,
      feature: 'welcome',
      type: 'custom',
      data: {
        name: name,
        customMessage: customMessage,
      },
      timestamp: new Date().toISOString(),
    };
  });

  voila.get('/status', async (request, reply) => {
    logger.debug('Welcome feature status requested');
    return {
      feature: 'welcome',
      status: 'active',
      version: '1.0.0',
      endpoints: ['GET /', 'GET /user/:name', 'POST /message', 'GET /status'],
      timestamp: new Date().toISOString(),
    };
  });

  logger.info('✅ Welcome routes initialized successfully');
}

export default welcomeRoutes;
