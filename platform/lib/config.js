/**
 * @fileoverview Config integration for Singlet Framework with smart defaults
 * @description Provides configuration utilities with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/config.js
 */

import {
  loadConfig,
  getConfig,
  hasConfig,
  createConfigSchema,
  validateConfigSchema,
} from '@voilajsx/appkit/config';
import { configSchema } from '../app.config.js';

let appConfig = null;

/**
 * Re-export all appkit config functions
 */
export {
  loadConfig,
  getConfig,
  hasConfig,
  createConfigSchema,
  validateConfigSchema,
} from '@voilajsx/appkit/config';

/**
 * Initialize configuration with Singlet schema
 * @returns {Promise<Object>} Loaded configuration
 * @throws {Error} If config loading fails
 */
export async function initConfig() {
  if (appConfig) {
    return appConfig;
  }

  try {
    // Load environment variables first
    const dotenv = await import('dotenv');
    dotenv.config();

    // Define Singlet schema if not already defined
    try {
      createConfigSchema('singlet', configSchema);
    } catch (error) {
      // Schema might already exist, continue
      if (!error.message?.includes('already defined')) {
        throw error;
      }
    }

    // Load configuration using appkit/config with automatic env mapping
    // Defaults come from the schema in app.config.js
    appConfig = await loadConfig(
      {},
      {
        validate: true,
        schema: 'singlet',
        env: true, // Auto-maps UPPER_SNAKE_CASE → lower.dot.notation
      }
    );

    return appConfig;
  } catch (error) {
    console.error('Failed to load Singlet configuration:', error.message);
    if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
      error.details.errors.forEach((err) => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
    throw error;
  }
}

/**
 * Get configuration value with dot notation
 * @param {string} path - Config path (e.g., 'server.port')
 * @param {*} fallback - Fallback value
 * @returns {*} Configuration value
 */
export function get(path, fallback) {
  if (!appConfig) {
    console.warn('Config not initialized, returning fallback');
    return fallback;
  }

  return getConfig(path, fallback);
}

/**
 * Check if configuration path exists
 * @param {string} path - Config path
 * @returns {boolean} True if path exists
 */
export function has(path) {
  if (!appConfig) {
    return false;
  }

  return hasConfig(path);
}

/**
 * Validate configuration against Singlet schema
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateConfig(config) {
  try {
    return validateConfigSchema(config, 'singlet');
  } catch (error) {
    console.error('Config validation failed:', error.message);
    throw error;
  }
}
