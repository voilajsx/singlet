/**
 * @fileoverview Main application entry point for Singlet Framework
 * @description Initializes and starts the Singlet Framework with centralized logging
 * @package @voilajsx/singlet
 * @file /index.js
 */

// Import from updated platform files
import { start, getLogger } from './platform/app.js';

/**
 * Initializes and starts the Singlet Framework application
 * This is the developer's main entry point
 * @async
 * @function initialize
 * @returns {Promise<void>}
 */
async function initialize() {
  try {
    await start();

    const logger = getLogger();
    logger.info(
      '[Application] Welcome! Your Singlet application is now fully operational.'
    );
  } catch (error) {
    // Try to use logger if available, fallback to console
    try {
      const logger = getLogger();
      logger.error('❌ [Application] Singlet Framework failed to initialize:', {
        error: error.message,
        stack: error.stack,
      });
    } catch (loggerError) {
      // Fallback to console if logger completely failed
      console.error(
        '❌ [Application] Singlet Framework failed to initialize:',
        error
      );
    }
    process.exit(1);
  }
}

// Start the application initialization process
initialize();
