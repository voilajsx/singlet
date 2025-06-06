/**
 * @fileoverview Component Discovery for Singlet Framework
 * @description Discovers and loads platform apps, features, and frontends
 * @package @voilajsx/singlet
 * @file /platform/discovery.js
 */

import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { getConfig } from './lib/config.js';
import { getLogger } from './lib/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Track discovered components with clear naming
let platformAppsBackendList = new Map();
let platformAppsFrontendList = new Map();
let featureBackendList = new Map();
let featureFrontendList = new Map();

/**
 * Set up all application routes and components
 * @param {Object} server - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
export async function setupComponents(server, config, logger) {
  logger.info('🔍 Starting component discovery...');

  // Discover and register backend components
  await discoverPlatformAppsBackend(server, config, logger);
  await discoverFeaturesBackend(server, config, logger);

  // Discover and register frontend components
  await discoverPlatformAppsFrontend(server, config, logger);
  await discoverFeaturesFrontend(server, config, logger);

  // Handle default route if no 'main' frontend exists
  if (!featureFrontendList.has('main')) {
    server.get('/', async (request, reply) => {
      return {
        message: 'Hello from Singlet Framework!',
        version: config.app.version,
        environment: config.app.environment,
        timestamp: new Date().toISOString(),
      };
    });
    logger.info('✅ Default route registered (JSON response)');
  }

  logger.info('🔍 Component discovery completed');
}

/**
 * Auto-discover and register platform app backends
 * @param {Object} fastify - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
async function discoverPlatformAppsBackend(fastify, config, logger) {
  const platformAppsPath = join(__dirname, 'apps');

  let appDirs;
  try {
    appDirs = readdirSync(platformAppsPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (error) {
    logger.warn(`Platform apps directory not found: ${platformAppsPath}`);
    return;
  }

  for (const appName of appDirs) {
    const appKey = `apps.${appName.toLowerCase()}`;
    const enabled = getConfig(appKey, true);

    if (!enabled) {
      logger.debug(`Platform app ${appName}: disabled`);
      continue;
    }

    const routeFile = join(
      platformAppsPath,
      appName,
      'backend',
      'src',
      `${appName}.routes.js`
    );

    try {
      const { default: appRoutes } = await import(`file://${routeFile}`);

      if (typeof appRoutes !== 'function') {
        logger.error(
          `❌ Platform app ${appName}: routes.js must export a function`
        );
        continue;
      }

      await fastify.register(appRoutes, {
        prefix: `/api/${appName}`,
        config,
        logger,
      });
      logger.info(`✅ Platform app backend: ${appName} (/api/${appName})`);
      platformAppsBackendList.set(appName, {
        initialized: true,
        prefix: `/api/${appName}`,
      });
    } catch (err) {
      logger.error(`❌ Platform app backend ${appName}: ${err.message}`);

      if (config.app.environment === 'development') {
        logger.debug(`Error details: ${err.stack}`);
        logger.debug(`File path: ${routeFile}`);
        logger.error('🛑 Development mode: stopping for debugging');
        process.exit(1);
      }
    }
  }
}

/**
 * Auto-discover and register feature backends
 * @param {Object} fastify - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
async function discoverFeaturesBackend(fastify, config, logger) {
  const backendPath = join(__dirname, '..', 'backend');

  let featureDirs;
  try {
    featureDirs = readdirSync(backendPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (error) {
    logger.warn(`Backend directory not found: ${backendPath}`);
    return;
  }

  for (const dir of featureDirs) {
    const featureKey = `features.${dir.toLowerCase()}`;
    const enabled = getConfig(featureKey, true);

    if (!enabled) {
      logger.debug(`Feature ${dir}: disabled`);
      continue;
    }

    const routeFile = join(backendPath, dir, 'src', `${dir}.routes.js`);

    try {
      const { default: featureRoutes } = await import(`file://${routeFile}`);

      if (typeof featureRoutes !== 'function') {
        logger.error(`❌ Feature ${dir}: routes.js must export a function`);
        continue;
      }

      await fastify.register(featureRoutes, {
        prefix: `/api/${dir}`,
        config,
        logger,
      });
      logger.info(`✅ Feature backend: ${dir} (/api/${dir})`);
      featureBackendList.set(dir, {
        initialized: true,
        prefix: `/api/${dir}`,
      });
    } catch (err) {
      logger.error(`❌ Feature backend ${dir}: ${err.message}`);

      if (config.app.environment === 'development') {
        logger.debug(`Error details: ${err.stack}`);
        logger.debug(`File path: ${routeFile}`);
        logger.error('🛑 Development mode: stopping for debugging');
        process.exit(1);
      }
    }
  }
}

/**
 * Discover platform app frontends
 * @param {Object} server - Fastify server instance
 * @param {Object} config - Application configuration
 * @param {Object} logger - Logger instance
 */
async function discoverPlatformAppsFrontend(server, config, logger) {
  const platformAppsPath = join(__dirname, 'apps');
  const fs = await import('fs/promises');

  logger.debug(
    `Starting platform app frontend discovery in: ${platformAppsPath}`
  );

  let appDirs;
  try {
    appDirs = readdirSync(platformAppsPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (error) {
    logger.warn(`Platform apps directory not found: ${platformAppsPath}`);
    return;
  }

  for (const appName of appDirs) {
    logger.debug(`Processing platform app frontend for: ${appName}`);

    // Check if app is enabled in config
    const appKey = `apps.${appName.toLowerCase()}`;
    const enabled = getConfig(appKey, true);

    if (!enabled) {
      logger.debug(
        `Platform app ${appName}: disabled by config, skipping frontend`
      );
      continue;
    }

    // Point to the dist directory
    const distPath = join(platformAppsPath, appName, 'frontend', 'dist');

    if (!existsSync(distPath)) {
      logger.debug(
        `Platform app ${appName}: No dist directory found, skipping frontend`
      );
      continue;
    }

    // Add direct file check to debug
    const indexPath = join(distPath, 'index.html');
    if (!existsSync(indexPath)) {
      logger.debug(
        `Platform app ${appName}: index.html not found in ${distPath}`
      );
      continue;
    } else {
      logger.debug(`Platform app ${appName}: index.html found at ${indexPath}`);
    }

    try {
      const routePrefix = `/${appName}`;

      // Read index.html content
      const indexContent = await fs.readFile(indexPath, 'utf8');

      // Create a sub-application for this platform app
      await server.register(
        async function platformAppFrontend(fastify) {
          // Serve static files from the dist directory
          await fastify.register(fastifyStatic, {
            root: distPath,
            prefix: '/',
            decorateReply: false,
          });

          // Handle the root route for this platform app
          fastify.get('/', async (request, reply) => {
            logger.debug(`Platform app frontend root route hit for ${appName}`);
            return reply.type('text/html').send(indexContent);
          });

          // Use a more specific pattern to avoid conflicts
          fastify.get('/app/*', async (request, reply) => {
            logger.debug(
              `Platform app frontend SPA route hit for ${appName}: ${request.url}`
            );
            return reply.type('text/html').send(indexContent);
          });

          // Set a 404 handler for this sub-app to serve the SPA
          fastify.setNotFoundHandler(async (request, reply) => {
            logger.debug(
              `Platform app frontend 404 handler for ${appName}: ${request.url}`
            );
            return reply.type('text/html').send(indexContent);
          });
        },
        { prefix: routePrefix }
      );

      logger.info(
        `✅ Platform app frontend: ${appName} (${routePrefix}) -> ${distPath}`
      );

      platformAppsFrontendList.set(appName, {
        path: distPath,
        prefix: routePrefix,
      });
    } catch (err) {
      logger.error(`❌ Platform app frontend ${appName}: ${err.message}`);
      logger.debug(`Error details: ${err.stack}`);
    }
  }

  logger.debug(
    `Platform app frontend discovery completed. Found ${platformAppsFrontendList.size} frontends.`
  );
}

/**
 * Discover feature frontends - Fixed to avoid route conflicts
 */
async function discoverFeaturesFrontend(server, config, logger) {
  const frontendPath = join(__dirname, '..', 'frontend');
  const fs = await import('fs/promises');

  logger.debug(`Starting feature frontend discovery in: ${frontendPath}`);

  let featureDirs;
  try {
    featureDirs = readdirSync(frontendPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (error) {
    logger.warn(`Frontend directory not found: ${frontendPath}`);
    return;
  }

  for (const featureName of featureDirs) {
    logger.debug(`Processing frontend for feature: ${featureName}`);

    const featureKey = `features.${featureName.toLowerCase()}`;
    const enabled = getConfig(featureKey, true);

    if (!enabled) {
      logger.debug(
        `Feature ${featureName}: disabled by config, skipping frontend`
      );
      continue;
    }

    const distPath = join(frontendPath, featureName, 'dist');

    if (!existsSync(distPath)) {
      logger.debug(
        `Feature ${featureName}: No dist directory found, skipping frontend`
      );
      continue;
    }

    const indexPath = join(distPath, 'index.html');
    if (!existsSync(indexPath)) {
      logger.debug(
        `Feature ${featureName}: index.html not found in ${distPath}`
      );
      continue;
    }

    try {
      const routePrefix = featureName === 'main' ? '' : `/${featureName}`;

      // Read index.html content
      const indexContent = await fs.readFile(indexPath, 'utf8');

      // Create a sub-application for this feature with unique prefix
      await server.register(
        async function featureApp(fastify) {
          // Serve static files from the dist directory
          await fastify.register(fastifyStatic, {
            root: distPath,
            prefix: '/',
            decorateReply: false,
          });

          // Handle the root route for this feature
          if (routePrefix) {
            // For non-main features, handle both root and catch-all
            fastify.get('/', async (request, reply) => {
              logger.debug(`Frontend root route hit for ${featureName}`);
              return reply.type('text/html').send(indexContent);
            });

            // Use a more specific pattern to avoid conflicts
            fastify.get('/app/*', async (request, reply) => {
              logger.debug(
                `Frontend SPA route hit for ${featureName}: ${request.url}`
              );
              return reply.type('text/html').send(indexContent);
            });
          } else {
            // For main feature
            fastify.get('/', async (request, reply) => {
              logger.debug(`Main frontend route hit`);
              return reply.type('text/html').send(indexContent);
            });
          }

          // Set a 404 handler for this sub-app to serve the SPA
          fastify.setNotFoundHandler(async (request, reply) => {
            logger.debug(
              `Frontend 404 handler for ${featureName}: ${request.url}`
            );
            return reply.type('text/html').send(indexContent);
          });
        },
        { prefix: routePrefix }
      );

      logger.info(
        `✅ Feature frontend: ${featureName} (${
          routePrefix || '/'
        }) -> ${distPath}`
      );

      featureFrontendList.set(featureName, {
        path: distPath,
        prefix: routePrefix || '/',
      });
    } catch (err) {
      logger.error(`❌ Feature frontend ${featureName}: ${err.message}`);
      logger.debug(`Error details: ${err.stack}`);
    }
  }

  logger.debug(
    `Feature frontend discovery completed. Found ${featureFrontendList.size} frontends.`
  );
}

/**
 * Get discovered components
 * @returns {Object} Maps of discovered components
 */
export function getDiscoveredComponents() {
  return {
    platformAppsBackend: platformAppsBackendList,
    platformAppsFrontend: platformAppsFrontendList,
    featureBackend: featureBackendList,
    featureFrontend: featureFrontendList,
  };
}
