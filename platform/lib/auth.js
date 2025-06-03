/**
 * @fileoverview Auth integration for Singlet Framework with smart defaults
 * @description Provides authentication utilities with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/auth.js
 */

import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';
import { get } from './config.js';
import { authError } from './error.js';

/**
 * Re-export basic appkit auth functions with same names
 */
export {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} from '@voilajsx/appkit/auth';

/**
 * Creates auth middleware with Singlet defaults
 * @param {Object} options - Override options
 * @returns {Function} Fastify middleware
 */
export async function createAuthMiddleware(options = {}) {
  const { createAuthMiddleware: appkitCreateAuthMiddleware } = await import(
    '@voilajsx/appkit/auth'
  );

  const jwtSecret = get('security.jwtSecret', 'singlet-dev-secret');

  return appkitCreateAuthMiddleware({
    secret: jwtSecret,
    getToken: (req) => {
      const auth = req.headers.authorization;
      return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    },
    onError: (error, req, res) => {
      res.status(401).send({
        error: 'Authentication required',
        message: error.message,
        framework: '@voilajsx/singlet',
        timestamp: new Date().toISOString(),
      });
    },
    ...options,
  });
}

/**
 * Creates authorization middleware with Singlet defaults
 * @param {string|string[]} roles - Required roles
 * @param {Object} options - Override options
 * @returns {Function} Fastify middleware
 */
export async function createAuthorizationMiddleware(roles, options = {}) {
  const { createAuthorizationMiddleware: appkitCreateAuthorizationMiddleware } =
    await import('@voilajsx/appkit/auth');

  const rolesArray = Array.isArray(roles) ? roles : [roles];

  return appkitCreateAuthorizationMiddleware(rolesArray, {
    getRoles: (req) => req.user?.roles || [req.user?.role] || [],
    ...options,
  });
}
