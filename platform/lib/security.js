/**
 * @fileoverview Security integration for Singlet Framework with smart defaults
 * @description Provides security utilities with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/security.js
 */

/**
 * Re-export all appkit security functions with same names
 */
export {
  generateCsrfToken,
  verifyCsrfToken,
  escapeString,
  sanitizeHtml,
  sanitizeFilename,
  generateEncryptionKey,
  encrypt,
  decrypt,
} from '@voilajsx/appkit/security';

/**
 * Creates CSRF middleware with Singlet defaults
 * @param {Object} options - Override options
 * @returns {Function} Fastify middleware
 */
export async function createCsrfMiddleware(options = {}) {
  const { createCsrfMiddleware: appkitCreateCsrfMiddleware } = await import(
    '@voilajsx/appkit/security'
  );

  return appkitCreateCsrfMiddleware({
    tokenField: '_csrf',
    headerField: 'x-csrf-token',
    ...options,
  });
}

/**
 * Creates rate limiter with Singlet defaults
 * @param {Object} options - Rate limiter options
 * @returns {Function} Fastify middleware
 */
export async function createRateLimiter(options = {}) {
  const { createRateLimiter: appkitCreateRateLimiter } = await import(
    '@voilajsx/appkit/security'
  );

  return appkitCreateRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.',
    keyGenerator: (req) => req.ip,
    ...options,
  });
}
