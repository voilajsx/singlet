/**
 * @fileoverview Greeting feature routes for @voilajsx/singlet framework
 * @description Handles greeting-related API endpoints
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /backend/greeting/src/backend.routes.js
 */

// Import the centralized logger getter function
// --- UPDATED LOGGER IMPORT ---
import { getAppLogger } from '../../../platform/lib/logger.js';
// --- END UPDATED LOGGER IMPORT ---

/**
 * Greeting feature routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {object} options - Fastify plugin options
 */
async function greetingRoutes(fastify, options) {
  // Get the logger instance and create a child logger for this feature
  const featureLogger = getAppLogger().child({ feature: 'greeting' });

  // Sample greetings data
  const greetings = {
    english: 'Hello',
    spanish: 'Hola',
    french: 'Bonjour',
    german: 'Hallo',
    italian: 'Ciao',
    portuguese: 'Olá',
    japanese: 'こんにちは',
    korean: '안녕하세요',
  };

  // GET /api/greeting - Get random greeting
  fastify.get('/', async (request, reply) => {
    const languages = Object.keys(greetings);
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    featureLogger.info('Random greeting requested', { language: randomLang });

    return {
      greeting: greetings[randomLang],
      language: randomLang,
      feature: 'greeting',
      type: 'random',
      timestamp: new Date().toISOString(),
    };
  });

  // GET /api/greeting/lang/:language - Get greeting by language
  fastify.get('/lang/:language', async (request, reply) => {
    const { language } = request.params;
    const greeting = greetings[language.toLowerCase()];

    if (!greeting) {
      featureLogger.warn(`Greeting for language '${language}' not found`);
      reply.status(404);
      return {
        error: 'Language not found',
        message: `Greeting for language '${language}' not available`,
        availableLanguages: Object.keys(greetings),
        timestamp: new Date().toISOString(),
      };
    }

    featureLogger.info(`Specific greeting requested for language: ${language}`);
    return {
      greeting,
      language: language.toLowerCase(),
      feature: 'greeting',
      type: 'specific',
      timestamp: new Date().toISOString(),
    };
  });

  // GET /api/greeting/all - Get all available greetings
  fastify.get('/all', async (request, reply) => {
    featureLogger.debug('All greetings requested');
    return {
      greetings,
      feature: 'greeting',
      type: 'collection',
      count: Object.keys(greetings).length,
      timestamp: new Date().toISOString(),
    };
  });

  // POST /api/greeting/custom - Create custom greeting
  fastify.post('/custom', async (request, reply) => {
    const { name, language = 'english', message } = request.body || {};
    const baseGreeting = greetings[language.toLowerCase()] || greetings.english;
    featureLogger.info('Custom greeting created', {
      name,
      language,
      customMessage: message,
    });

    return {
      greeting: message || `${baseGreeting}, ${name || 'Friend'}!`,
      customMessage: message || null,
      name: name || 'Friend',
      language: language.toLowerCase(),
      feature: 'greeting',
      type: 'custom',
      timestamp: new Date().toISOString(),
    };
  });

  // GET /api/greeting/status - Greeting feature status
  fastify.get('/status', async (request, reply) => {
    featureLogger.debug('Greeting feature status requested');
    return {
      feature: 'greeting',
      status: 'active',
      version: '1.0.0',
      supportedLanguages: Object.keys(greetings),
      endpoints: [
        'GET /',
        'GET /lang/:language',
        'GET /all',
        'POST /custom',
        'GET /status',
      ],
      timestamp: new Date().toISOString(),
    };
  });
}

export default greetingRoutes;
