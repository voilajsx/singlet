/**
 * @fileoverview Singlet Framework - Main Entry Point
 * @description Application startup sequence
 * @package @voilajsx/singlet
 * @file /index.js
 */

import {
  setupConfig,
  setupLogging,
  createServer,
  setupRoutes,
  startServer,
} from './platform/app.js';

/*
 * Singlet Framework Startup
 */

try {
  // Load configuration and environment variables
  const config = await setupConfig();

  // Initialize structured logging
  const logger = await setupLogging(config);

  // Create Fastify server with middleware
  const server = await createServer(config, logger);

  // Register core routes and discover components
  await setupRoutes(server, config, logger);

  // Start listening for requests
  await startServer(server, config, logger);

  console.log('✨ Singlet Framework is ready to serve requests');
} catch (error) {
  console.error('Startup failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
