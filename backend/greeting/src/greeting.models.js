/**
 * @fileoverview Greeting feature data models
 * @description Data structure and basic operations for greetings
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.models.js
 */

import { config } from './greeting.config.js';

/**
 * Core greetings data
 * In the future, this could come from a database
 */
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

/**
 * Get greeting by language code
 * @param {string} language - Language code
 * @returns {string|null} Greeting text or null if not found
 */
export function getGreetingByLanguage(language) {
  return greetings[language.toLowerCase()] || null;
}

/**
 * Get all available greetings
 * @returns {Object} All greetings mapped by language
 */
export function getAllGreetings() {
  return { ...greetings };
}

/**
 * Get list of available language codes
 * @returns {string[]} Array of language codes
 */
export function getAvailableLanguages() {
  return Object.keys(greetings);
}

/**
 * Check if a language is available
 * @param {string} language - Language code to check
 * @returns {boolean} True if language exists
 */
export function hasLanguage(language) {
  return language.toLowerCase() in greetings;
}
