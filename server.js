/**
 * @fileoverview Main application entry point for Singlet Framework.
 * @description Initializes and starts the Singlet Framework, handling application-level logs.
 * @package @voilajsx/singlet
 * @file /server.js
 */

// Import the start function and the appLogger getter from the platform's main file
import { start, appLogger } from './platform/main.js';

/**
 * Initializes and starts the Singlet Framework application.
 * This is the application developer's entry point.
 * @async
 * @function initialize
 * @returns {Promise<void>}
 */
async function initialize() {
  try {
    await start();

    if (appLogger) {
      // Check if appLogger getter is available
      appLogger().info(
        '[Application] Welcome! Your Singlet application is now fully operational.'
      );
    } else {
      console.log(
        '[Application] Welcome! Your Singlet application is now fully operational (logger not available).'
      );
    }
  } catch (error) {
    // If the logger is available (meaning initialization partially succeeded), use it for error logging
    if (appLogger) {
      appLogger().error(
        '❌ [Application] Singlet Framework failed to initialize:',
        {
          error: error.message,
          stack: error.stack,
        }
      );
    } else {
      // Fallback to console if logger completely failed to initialize
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
