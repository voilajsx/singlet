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
} from '@voilajsx/appkit/auth';
import { get } from './config.js';
import { getLogger } from './logging.js';
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

// Simple in-memory user store for development
const users = new Map();

// Initialize with default users for development
users.set('admin@example.com', {
  id: 'admin_1',
  name: 'Admin User',
  email: 'admin@example.com',
  password: '$2b$12$JuueZmb4/Og1ObgkmpMLb.gLeeF7RMFKxznPpxzy4l5vSxY0PAfNW',
  role: 'admin',
  roles: ['admin'],
  active: true,
  createdAt: new Date().toISOString(),
});

users.set('moderator@example.com', {
  id: 'moderator_1',
  name: 'Moderator User',
  email: 'moderator@example.com',
  password: '$2b$12$JuueZmb4/Og1ObgkmpMLb.gLeeF7RMFKxznPpxzy4l5vSxY0PAfNW',
  role: 'moderator',
  roles: ['moderator'],
  active: true,
  createdAt: new Date().toISOString(),
});

users.set('user@example.com', {
  id: 'user_1',
  name: 'Regular User',
  email: 'user@example.com',
  password: '$2b$12$JuueZmb4/Og1ObgkmpMLb.gLeeF7RMFKxznPpxzy4l5vSxY0PAfNW',
  role: 'user',
  roles: ['user'],
  active: true,
  createdAt: new Date().toISOString(),
});

const logger = getLogger('auth');

/**
 * Role hierarchy levels
 */
const ROLE_LEVELS = {
  user: 1,
  moderator: 2,
  admin: 3,
};

/**
 * Get JWT secret with smart defaults
 * @returns {string} JWT secret
 */
function getJwtSecret() {
  return (
    process.env.JWT_SECRET || get('security.jwtSecret', 'singlet-dev-secret')
  );
}

/**
 * Find user by email for development storage
 * @param {string} email - User email
 * @returns {Object|null} User or null
 */
function findUserByEmail(email) {
  return users.get(email.toLowerCase()) || null;
}

/**
 * Create user object for responses (removes password)
 * @param {Object} user - User data
 * @returns {Object} Safe user object
 */
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Check if user has minimum role level
 * @param {Object} user - User object
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if user has required level or higher
 */
function hasRoleLevel(user, requiredRole) {
  if (!user || !user.role) return false;

  const userLevel = ROLE_LEVELS[user.role] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Creates auth middleware with Singlet defaults
 * @param {Object} options - Override options
 * @returns {Function} Fastify middleware
 */
export async function createAuthMiddleware(options = {}) {
  const { createAuthMiddleware: appkitCreateAuthMiddleware } = await import(
    '@voilajsx/appkit/auth'
  );

  const jwtSecret = getJwtSecret();

  return appkitCreateAuthMiddleware({
    secret: jwtSecret,
    getToken: (req) => {
      const auth = req.headers.authorization;
      return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    },
    onError: (error, req, reply) => {
      reply.code(401).send({
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

/**
 * Base auth middleware - verifies JWT token
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 * @param {Function} done - Callback function
 */
export function auth(request, reply, done) {
  const token = request.headers.authorization?.startsWith('Bearer ')
    ? request.headers.authorization.slice(7)
    : null;

  if (!token) {
    return reply.code(401).send({
      error: 'Authentication required',
      message: 'Please provide a valid authentication token',
    });
  }

  try {
    const payload = verifyToken(token, {
      secret: getJwtSecret(),
      algorithms: ['HS256'],
    });

    request.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      roles: [payload.role],
      level: ROLE_LEVELS[payload.role] || 0,
      isUser: payload.role === 'user',
      isModerator: payload.role === 'moderator',
      isAdmin: payload.role === 'admin',
    };

    if (done) done();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      method: request.method,
      url: request.url,
    });

    return reply.code(401).send({
      error: 'Authentication failed',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * User role middleware - requires any authenticated user (level 1+)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 * @param {Function} done - Callback function
 */
export function user(request, reply, done) {
  auth(request, reply, (error) => {
    if (error) return;

    if (!hasRoleLevel(request.user, 'user')) {
      return reply.code(403).send({
        error: 'Access denied',
        message: 'User access required',
      });
    }

    if (done) done();
  });
}

/**
 * Moderator role middleware - requires moderator or admin (level 2+)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 * @param {Function} done - Callback function
 */
export function moderator(request, reply, done) {
  auth(request, reply, (error) => {
    if (error) return;

    if (!hasRoleLevel(request.user, 'moderator')) {
      return reply.code(403).send({
        error: 'Access denied',
        message: 'Moderator access required',
      });
    }

    if (done) done();
  });
}

/**
 * Admin role middleware - requires admin role only (level 3)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 * @param {Function} done - Callback function
 */
export function admin(request, reply, done) {
  auth(request, reply, (error) => {
    if (error) return;

    if (!hasRoleLevel(request.user, 'admin')) {
      return reply.code(403).send({
        error: 'Access denied',
        message: 'Admin access required',
      });
    }

    if (done) done();
  });
}

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result with user and token
 * @throws {Error} If authentication fails
 */
export async function login(email, password) {
  if (!email || !password) {
    throw authError('Email and password are required');
  }

  const user = findUserByEmail(email);
  if (!user) {
    throw authError('Invalid email or password');
  }

  if (!user.active) {
    throw authError('Account is deactivated');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw authError('Invalid email or password');
  }

  const token = generateToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    {
      secret: getJwtSecret(),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @param {string} [role='user'] - User role
 * @returns {Promise<Object>} Registration result with user and token
 * @throws {Error} If registration fails
 */
export async function register(email, password, name, role = 'user') {
  if (!email || !password || !name) {
    throw authError('Email, password, and name are required');
  }

  if (password.length < 6) {
    throw authError('Password must be at least 6 characters');
  }

  if (findUserByEmail(email)) {
    throw authError('Email already registered');
  }

  if (!['user', 'moderator', 'admin'].includes(role)) {
    throw authError('Invalid role. Must be user, moderator, or admin');
  }

  const hashedPassword = await hashPassword(password, 12);
  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    roles: [role],
    active: true,
    createdAt: new Date().toISOString(),
  };

  users.set(email.toLowerCase(), newUser);

  const token = generateToken(
    {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    {
      secret: getJwtSecret(),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  logger.info('User registered successfully', {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: sanitizeUser(newUser),
    token,
  };
}

/**
 * Development helper - create test token for any role
 * @param {string} [role='user'] - User role
 * @param {Object} [userData={}] - Additional user data
 * @returns {string} JWT token
 */
export function createTestToken(role = 'user', userData = {}) {
  const environment = get('app.environment', 'development');

  if (environment !== 'development') {
    throw new Error('Test tokens only available in development');
  }

  return generateToken(
    {
      userId: userData.id || `test_${Date.now()}`,
      email: userData.email || `test@example.com`,
      name: userData.name || 'Test User',
      role,
    },
    {
      secret: getJwtSecret(),
      expiresIn: '1d',
    }
  );
}

/**
 * Get all users (development helper)
 * @returns {Array} List of users without passwords
 */
export function getAllUsers() {
  const environment = get('app.environment', 'development');

  if (environment !== 'development') {
    throw new Error('User listing only available in development');
  }

  return Array.from(users.values()).map(sanitizeUser);
}
