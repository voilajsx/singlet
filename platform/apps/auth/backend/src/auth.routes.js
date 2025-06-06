/**
 * @fileoverview Auth platform app routes for @voilajsx/singlet framework
 * @description Provides authentication endpoints (login, register, profile).
 * @package @voilajsx/singlet
 * @file /platform/apps/auth/src/auth.routes.js
 */

import { getLogger } from '@platform/lib/logging.js';
import {
  login,
  register,
  auth,
  createTestToken,
  getAllUsers,
} from '@platform/lib/auth.js';
import { get } from '@platform/lib/config.js';

/**
 * Auth Platform App Initializer.
 * Registers auth routes under the '/api/auth' prefix.
 *
 * @param {import('fastify').FastifyInstance} voila - The Fastify server instance.
 * @param {Object} options - Options passed to the plugin during registration.
 * @param {Object} options.config - The application configuration object.
 * @param {Object} [options.logger] - The logger instance (optional, if passed).
 */
async function authRoutes(voila, options) {
  const config = options.config;
  const logger = options.logger || getLogger('auth');

  if (!config) {
    logger.error('Auth app: Configuration not found in plugin options.');
    throw new Error('Configuration not available for auth app.');
  }

  logger.info('🎯 Initializing auth platform routes...');

  // Login endpoint
  voila.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body || {};

      if (!email || !password) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await login(email, password);

      // Set HTTP-only cookie for web clients
      reply.setCookie('auth_token', result.token, {
        httpOnly: true,
        secure: config.app.environment === 'production',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
      });

      return {
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn('Login failed', {
        email: request.body?.email,
        error: error.message,
      });

      return reply.code(401).send({
        error: 'Authentication Failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Register endpoint
  voila.post('/register', async (request, reply) => {
    try {
      const { email, password, name, role = 'user' } = request.body || {};

      if (!email || !password || !name) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Email, password, and name are required',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await register(email, password, name, role);

      // Set HTTP-only cookie for web clients
      reply.setCookie('auth_token', result.token, {
        httpOnly: true,
        secure: config.app.environment === 'production',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
      });

      return {
        success: true,
        message: 'Registration successful',
        token: result.token,
        user: result.user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn('Registration failed', {
        email: request.body?.email,
        error: error.message,
      });

      const statusCode = error.message.includes('already registered')
        ? 409
        : 400;

      return reply.code(statusCode).send({
        error: 'Registration Failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get current user profile
  voila.get('/me', { preHandler: auth }, async (request, reply) => {
    return {
      success: true,
      user: request.user,
      timestamp: new Date().toISOString(),
    };
  });

  // Logout endpoint
  voila.post('/logout', async (request, reply) => {
    reply.clearCookie('auth_token', { path: '/' });

    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  });

  // Development-only endpoints
  if (config.app.environment === 'development') {
    logger.info('Adding development auth endpoints...');

    // Create test token
    voila.post('/test-token', async (request, reply) => {
      try {
        const { role = 'user', ...userData } = request.body || {};
        const token = createTestToken(role, userData);

        return {
          success: true,
          token,
          message: `Test token created for role: ${role}`,
          expiresIn: '1 day',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return reply.code(400).send({
          error: 'Test Token Error',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Get all users
    voila.get('/dev/users', async (request, reply) => {
      try {
        const users = getAllUsers();
        return {
          success: true,
          users,
          count: users.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return reply.code(500).send({
          error: 'Dev Endpoint Error',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Health check with auth info
    voila.get('/dev/health', async (request, reply) => {
      return {
        status: 'OK',
        service: 'auth',
        environment: config.app.environment,
        jwtConfigured: !!get('security.jwtSecret'),
        defaultUsers: ['admin@example.com', 'user@example.com'],
        timestamp: new Date().toISOString(),
      };
    });
  }

  logger.info('✅ Auth platform routes initialized successfully');
}

export default authRoutes;
