/**
 * @fileoverview Welcome feature routes for @voilajsx/singlet framework
 * @description Handles welcome-related API endpoints
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /backend/welcome/src/welcome.routes.js
 */

/**
 * Welcome feature routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {object} options - Fastify plugin options
 */
async function welcomeRoutes(fastify, options) {
  // Create a child logger for the welcome feature for more granular context
  const featureLogger = fastify.log.child({ feature: 'welcome' });

  // GET /api/welcome - Get welcome message
  fastify.get('/', async (request, reply) => {
    featureLogger.info('Welcome root endpoint hit');
    return {
      message: 'Welcome to Singlet Framework!',
      feature: 'welcome',
      description: 'This is the welcome feature endpoint',
      timestamp: new Date().toISOString(),
    };
  });

  // GET /api/welcome/user/:name - Personalized welcome
  fastify.get('/user/:name', async (request, reply) => {
    const { name } = request.params;
    featureLogger.info(`Personalized welcome for user: ${name}`);
    return {
      message: `Welcome ${name} to Singlet Framework!`,
      feature: 'welcome',
      user: name,
      personalizedGreeting: true,
      timestamp: new Date().toISOString(),
    };
  });

  // POST /api/welcome/message - Create custom welcome message
  fastify.post('/message', async (request, reply) => {
    const { name, customMessage } = request.body || {};
    featureLogger.info('Custom welcome message created', {
      name,
      customMessage,
    });

    return {
      message: customMessage || `Welcome ${name || 'Guest'} to Singlet!`,
      feature: 'welcome',
      type: 'custom',
      data: {
        name: name || 'Guest',
        customMessage: customMessage || null,
      },
      timestamp: new Date().toISOString(),
    };
  });

  // GET /api/welcome/status - Welcome feature status
  fastify.get('/status', async (request, reply) => {
    featureLogger.debug('Welcome feature status requested');
    return {
      feature: 'welcome',
      status: 'active',
      version: '1.0.0',
      endpoints: ['GET /', 'GET /user/:name', 'POST /message', 'GET /status'],
      timestamp: new Date().toISOString(),
    };
  });
}

export default welcomeRoutes;
