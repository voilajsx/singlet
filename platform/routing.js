/**
 * @fileoverview Enhanced routing module for @voilajsx/singlet framework
 * @description Auto-registers backend features and defines core API endpoints
 * @author VoilaJS Team
 * @package @voilajsx/singlet
 * @version 1.0.0
 * @file /platform/routing.js
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url'; // Corrected syntax

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Auto-discover and register backend feature routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
async function autoRegisterFeatures(fastify) {
  try {
    const backendPath = join(__dirname, '..', 'backend');

    let featureDirs;
    try {
      featureDirs = readdirSync(backendPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (error) {
      fastify.log.warn(
        '[Singlet] Backend directory not found or cannot be read:',
        error.message
      );
      return;
    }

    fastify.log.info(
      `[Singlet] Found ${featureDirs.length} features: ${featureDirs.join(
        ', '
      )}`
    );

    // Register each feature
    for (const featureDir of featureDirs) {
      try {
        const routeFile = join(
          backendPath,
          featureDir,
          'src', // Added 'src' directory based on previous discussion
          `${featureDir}.routes.js`
        );

        fastify.log.info(
          `[Singlet] Attempting to import feature from: file://${routeFile}`
        ); // Log the full path

        const { default: featureRoutes } = await import(`file://${routeFile}`);

        // Register feature routes with /api prefix
        await fastify.register(featureRoutes, { prefix: `/api/${featureDir}` });

        fastify.log.info(`[Singlet] ✓ Registered feature: /api/${featureDir}`);
      } catch (error) {
        // Log the entire error object for detailed debugging
        fastify.log.error(
          `[Singlet] ✗ Failed to register feature ${featureDir} from path ${featureDir}/src/${featureDir}.routes.js:`,
          error // Log the full error object here
        );
      }
    }
  } catch (error) {
    fastify.log.error(
      '[Singlet] Feature auto-registration failed during top-level execution:',
      error
    );
  }
}

/**
 * Register all routes for the Singlet framework
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
async function routes(fastify, options) {
  // Auto-register backend features
  await autoRegisterFeatures(fastify);

  // Root route
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Hello from @voilajsx/singlet Framework!',
      framework: '@voilajsx/singlet',
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
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
    };
  });

  // API information route
  fastify.get('/api/info', async (request, reply) => {
    return {
      name: 'Singlet Framework API',
      framework: '@voilajsx/singlet',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    };
  });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      framework: '@voilajsx/singlet',
      timestamp: new Date().toISOString(),
    });
  });
}

export default routes;
