/**
 * @fileoverview Enhanced routing module for @voilajsx/singlet framework
 * @description Auto-registers backend features - Fastify handles async natively
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /platform/routes.js
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import from centralized lib modules
import { getLogger } from './lib/logging.js';
import { getConfig } from './lib/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Auto-discover and register backend feature routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
async function autoRegisterFeatures(fastify) {
  const logger = getLogger().child({ operation: 'autoRegisterFeatures' });

  try {
    const backendPath = join(__dirname, '..', 'backend');
    logger.info(`🔍 Looking for features in: ${backendPath}`);

    let featureDirs;
    try {
      featureDirs = readdirSync(backendPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (error) {
      logger.warn('Backend directory not found or cannot be read:', {
        path: backendPath,
        error: error.message,
      });
      return;
    }

    logger.info(
      `📁 Found ${featureDirs.length} potential features: ${featureDirs.join(
        ', '
      )}`
    );

    // Register each feature directly - Fastify handles async automatically
    for (const featureDir of featureDirs) {
      try {
        logger.info(`🚀 Processing feature: ${featureDir}`);

        // ✅ Check if feature is enabled BEFORE importing
        const featureKey = `features.${featureDir.toLowerCase()}`;
        const isFeatureEnabled = getConfig(featureKey, true); // Default to enabled if no flag

        logger.info(`⚙️  Feature '${featureDir}' enabled: ${isFeatureEnabled}`);

        if (!isFeatureEnabled) {
          logger.info(
            `⏭️  Feature '${featureDir}' is disabled, skipping registration`
          );
          continue; // Skip to next feature without importing
        }

        const routeFile = join(
          backendPath,
          featureDir,
          'src',
          `${featureDir}.routes.js`
        );

        logger.info(`📂 Route file path: ${routeFile}`);
        logger.debug(`🔗 Import URL: file://${routeFile}`);

        // ✅ Only import if feature is enabled
        logger.info(`📥 Importing feature routes...`);
        const { default: featureRoutes } = await import(`file://${routeFile}`);
        logger.info(`✅ Feature routes imported successfully`);

        if (typeof featureRoutes !== 'function') {
          logger.error(`❌ Feature '${featureDir}' export is not a function:`, {
            type: typeof featureRoutes,
            value: featureRoutes,
          });
          continue;
        }

        // ✅ Register feature directly - Fastify handles async errors automatically
        logger.info(`🔧 Registering feature with prefix: /api/${featureDir}`);

        await fastify.register(featureRoutes, { prefix: `/api/${featureDir}` });

        logger.info(
          `✅ Feature '${featureDir}' registered successfully at /api/${featureDir}`
        );
      } catch (error) {
        logger.error(`❌ Failed to register feature '${featureDir}':`, {
          feature: featureDir,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    logger.info(`🎯 Feature auto-registration completed`);
  } catch (error) {
    logger.error(
      'Feature auto-registration failed during top-level execution:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
  }
}

/**
 * Register all routes for the Singlet framework
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {object} options - Fastify plugin options
 */
async function routes(fastify, options) {
  const logger = getLogger().child({ operation: 'routes' });

  logger.info('🚀 Starting route registration...');

  // Auto-register backend features
  await autoRegisterFeatures(fastify);

  // Get app configuration for responses
  const appConfig = getConfig('app', {
    name: '@voilajsx/singlet-app',
    version: '1.0.0',
    environment: 'development',
  });

  logger.info('📝 Registering core routes...');

  // Core routes - Fastify handles async automatically
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Hello from @voilajsx/singlet Framework!',
      framework: '@voilajsx/singlet',
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      version: appConfig.version,
      environment: appConfig.environment,
    };
  });

  // Health check route
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      framework: '@voilajsx/singlet',
      version: appConfig.version,
    };
  });

  // API information route
  fastify.get('/api/info', async (request, reply) => {
    return {
      name: appConfig.name,
      framework: '@voilajsx/singlet',
      version: appConfig.version,
      environment: appConfig.environment,
      node_version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    };
  });

  // Feature status endpoint
  fastify.get('/api/features', async (request, reply) => {
    const features = getConfig('features', {});

    return {
      features,
      framework: '@voilajsx/singlet',
      timestamp: new Date().toISOString(),
    };
  });

  logger.info('✅ Core routes registered successfully');
  logger.info('🎯 All route registration complete');
}

export default routes;
