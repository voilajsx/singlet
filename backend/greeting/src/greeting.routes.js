/**
 * @fileoverview Greeting feature route definitions
 * @description Clean route definitions with controller integration
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.routes.js
 */

import { getLogger } from '@platform/lib/logging';
import * as controller from './greeting.controller.js';

/**
 * Greeting feature routes
 * @param {Object} voila - Fastify instance
 */
async function greetingRoutes(voila) {
  const logger = getLogger('greeting');
  logger.info('Initializing greeting routes');

  // Random greeting
  voila.get('/', controller.getRandomGreeting);

  // Specific language greeting
  voila.get('/lang/:language', controller.getLanguageGreeting);

  // All available greetings
  voila.get('/all', controller.getAllGreetings);

  // Available languages list
  voila.get('/languages', controller.getLanguages);

  // Custom greeting with validation
  voila.post('/custom', controller.createCustomGreeting);

  logger.info('Greeting routes initialized successfully');
}

export default greetingRoutes;
