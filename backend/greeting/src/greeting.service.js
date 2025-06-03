/**
 * @fileoverview Greeting feature business logic
 * @description Core greeting functionality and business rules
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.service.js
 */

import * as models from './greeting.models.js';
import { config } from './greeting.config.js';

/**
 * Get a random greeting
 * @returns {Object} Random greeting with language and timestamp
 */
export function getRandomGreeting() {
  const languages = models.getAvailableLanguages();
  const randomLang = languages[Math.floor(Math.random() * languages.length)];
  const greeting = models.getGreetingByLanguage(randomLang);

  return {
    greeting,
    language: randomLang,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get greeting by specific language
 * @param {string} language - Language code
 * @returns {Object|null} Greeting object with timestamp or null if not found
 */
export function getGreetingByLanguage(language) {
  const normalizedLang = language.toLowerCase();
  const greeting = models.getGreetingByLanguage(normalizedLang);

  if (!greeting) {
    return null;
  }

  return {
    greeting,
    language: normalizedLang,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get all available greetings
 * @returns {Object} All greetings with count and timestamp
 */
export function getAllGreetings() {
  const greetings = models.getAllGreetings();

  return {
    greetings,
    count: Object.keys(greetings).length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get list of available languages
 * @returns {Object} Languages array with count and timestamp
 */
export function getAvailableLanguages() {
  const languages = models.getAvailableLanguages();

  return {
    languages,
    count: languages.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a custom greeting for a person
 * @param {string} name - Person's name
 * @param {string} [language='english'] - Language code (optional)
 * @returns {Object} Custom greeting object with timestamp
 */
export function createCustomGreeting(name, language = config.defaultLanguage) {
  const normalizedLang = language.toLowerCase();
  const baseGreeting =
    models.getGreetingByLanguage(normalizedLang) ||
    models.getGreetingByLanguage(config.defaultLanguage);

  return {
    greeting: `${baseGreeting}, ${name}!`,
    name,
    language: normalizedLang,
    timestamp: new Date().toISOString(),
  };
}
