/**
 * @fileoverview Entry point for the @voilajsx/singlet framework
 * @description Minimal entry point that bootstraps the Singlet platform server
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file server.js
 */

import { start } from './platform/main.js';

/**
 * Initialize and start the Singlet framework server
 * Handles startup errors and graceful exit on failure
 * @async
 * @function initialize
 * @returns {Promise<void>}
 * @throws {Error} When server initialization fails
 */
async function initialize() {
  try {
    await start();
  } catch (error) {
    console.error('❌ Singlet Framework failed to start:', error);
    process.exit(1);
  }
}

// Start the Singlet application
initialize();
