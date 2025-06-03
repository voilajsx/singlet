/**
 * @fileoverview Greeting feature controllers
 * @description HTTP request/response handling for greeting endpoints
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.controller.js
 */

import { validateRequest } from '@platform/lib/validation';
import { getLogger } from '@platform/lib/logging';
import { notFoundError } from '@platform/lib/error';
import * as service from './greeting.service.js';
import { customGreetingSchema } from './greeting.validation.js';

const logger = getLogger('greeting');

/**
 * Get random greeting
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Random greeting response
 */
export async function getRandomGreeting(request, reply) {
  return service.getRandomGreeting();
}

/**
 * Get greeting in specific language
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Language-specific greeting response
 * @throws {Error} If language is not found
 */
export async function getLanguageGreeting(request, reply) {
  const { language } = request.params;
  const result = service.getGreetingByLanguage(language);

  if (!result) {
    logger.warn(`Language not found: ${language}`);
    throw notFoundError(`Language '${language}' not available`);
  }

  return result;
}

/**
 * Get all available greetings
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} All greetings response
 */
export async function getAllGreetings(request, reply) {
  return service.getAllGreetings();
}

/**
 * Get available languages
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Available languages response
 */
export async function getLanguages(request, reply) {
  return service.getAvailableLanguages();
}

/**
 * Create custom greeting
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<Object>} Custom greeting response
 * @throws {Error} If validation fails
 */
export async function createCustomGreeting(request, reply) {
  const { name, language } = validateRequest(
    request.body,
    customGreetingSchema
  );
  return service.createCustomGreeting(name, language);
}
