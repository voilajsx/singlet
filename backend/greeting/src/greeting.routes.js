/**
 * @fileoverview Clean greeting routes with direct smart logging
 * @description Perfect balance - clean imports, full power ✨
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.routes.js
 */

import { getLogger } from '@platform/lib/logging.js';
import { validate, notFound } from '@platform/lib/core.js';

/**
 * Greeting feature routes - clean and powerful ✨
 */
async function greetingRoutes(voila, options) {
  // Smart logger - automatically creates child logger with feature context
  const logger = getLogger('greeting');

  logger.warn('🎯 Initializing greeting routes...');

  const greetings = {
    english: 'Hello',
    spanish: 'Hola',
    french: 'Bonjour',
    german: 'Hallo',
    italian: 'Ciao',
    portuguese: 'Olá',
    japanese: 'こんにちは',
    chinese: '你好',
  };

  // Random greeting
  voila.get('/', async (request, reply) => {
    const languages = Object.keys(greetings);
    const randomLang = languages[Math.floor(Math.random() * languages.length)];

    logger.info('Random greeting requested', { language: randomLang });

    return {
      greeting: greetings[randomLang],
      language: randomLang,
      timestamp: new Date().toISOString(),
    };
  });

  // Specific language greeting
  voila.get('/lang/:language', async (request, reply) => {
    const { language } = request.params;

    logger.debug('Processing language request', {
      requestedLanguage: language,
    });

    const greeting = greetings[language.toLowerCase()];

    if (!greeting) {
      logger.warn('Language not found', {
        language,
        availableLanguages: Object.keys(greetings),
      });
      throw notFound(`Language '${language}' not available`);
    }

    logger.info('Specific greeting requested', { language });

    return {
      greeting,
      language: language.toLowerCase(),
      timestamp: new Date().toISOString(),
    };
  });

  // All greetings
  voila.get('/all', async (request, reply) => {
    logger.error('All greetings requested');

    return {
      greetings,
      count: Object.keys(greetings).length,
      timestamp: new Date().toISOString(),
    };
  });

  // Custom greeting with validation
  voila.post('/custom', async (request, reply) => {
    logger.debug('Processing custom greeting request', {
      bodyKeys: Object.keys(request.body || {}),
    });

    const { name, language = 'english' } = validate(request.body, {
      name: 'required|string|min:1',
      language: 'string',
    });

    const baseGreeting = greetings[language.toLowerCase()] || greetings.english;

    logger.info('Custom greeting created', { name, language });

    return {
      greeting: `${baseGreeting}, ${name}!`,
      name,
      language: language.toLowerCase(),
      timestamp: new Date().toISOString(),
    };
  });

  // Available languages
  voila.get('/languages', async (request, reply) => {
    return {
      languages: Object.keys(greetings),
      count: Object.keys(greetings).length,
      timestamp: new Date().toISOString(),
    };
  });

  logger.info('✅ Greeting routes initialized successfully');
}

export default greetingRoutes;
