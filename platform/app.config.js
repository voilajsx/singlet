/**
 * @fileoverview Defines the application's configuration schema and environment variable mapping
 * @description Centralized configuration definition for @voilajsx/singlet framework
 * @package @voilajsx/singlet
 * @file /platform/app.config.js
 */

/**
 * Configuration schema for validation and type coercion
 * Defines the structure and defaults for the entire application
 */
export const configSchema = {
  type: 'object',
  required: ['app', 'server', 'logging'],
  properties: {
    app: {
      type: 'object',
      required: ['name', 'version', 'environment'],
      properties: {
        name: {
          type: 'string',
          default: '@voilajsx/singlet-app',
        },
        version: {
          type: 'string',
          default: '1.0.0',
        },
        environment: {
          type: 'string',
          enum: ['development', 'staging', 'production'],
          default: 'development',
        },
      },
    },
    server: {
      type: 'object',
      required: ['port', 'host'],
      properties: {
        host: {
          type: 'string',
          default: '0.0.0.0',
        },
        port: {
          type: 'number',
          default: 3000,
        },
        ssl: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              default: false,
            },
            key: {
              type: ['string', 'null'],
              default: null,
            },
            cert: {
              type: ['string', 'null'],
              default: null,
            },
          },
        },
      },
    },
    logging: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['error', 'warn', 'info', 'debug'],
          default: 'info',
        },
        enableFileLogging: {
          type: 'boolean',
          default: true,
        },
        dirname: {
          type: 'string',
          default: 'platform/logs',
        },
        filename: {
          type: 'string',
          default: 'app.log',
        },
        retentionDays: {
          type: 'number',
          default: 5,
        },
        maxSize: {
          type: 'number',
          default: 10485760,
        },
      },
    },
    // Updated JWT-only security section
    jwt: {
      type: 'object',
      properties: {
        secret: {
          type: 'string',
          default: 'singlet-dev-secret-change-in-production',
        },
        expiresIn: {
          type: 'string',
          default: '7d',
        },
      },
    },
    // Updated CORS section for multi-client support
    cors: {
      type: 'object',
      properties: {
        origins: {
          type: ['array', 'string'], // Accept both array and string
          items: { type: 'string' },
          default: [
            'http://localhost:3000',
            'http://localhost:3001',
            'capacitor://localhost',
          ],
        },
        credentials: {
          type: 'boolean',
          default: true,
        },
      },
    },
    apps: {
      type: 'object',
      properties: {
        gate: {
          type: 'boolean',
          default: true,
        },
        system: {
          type: 'boolean',
          default: true,
        },
      },
      additionalProperties: {
        type: 'boolean',
      },
    },
    features: {
      type: 'object',
      properties: {
        welcome: { type: 'boolean', default: true },
        greeting: { type: 'boolean', default: true },
      },
      additionalProperties: {
        type: 'boolean',
      },
    },
  },
};

/**
 * Environment variable mapping is handled automatically by @voilajsx/appkit
 *
 * Automatic mapping rules:
 * - JWT_SECRET → jwt.secret
 * - JWT_EXPIRES_IN → jwt.expiresIn
 * - CORS_ORIGINS → cors.origins (comma-separated string → array)
 * - CORS_CREDENTIALS → cors.credentials
 * - SERVER_PORT → server.port
 * - SERVER_HOST → server.host
 * - LOGGING_LEVEL → logging.level
 * - FEATURES_WELCOME → features.welcome
 * - FEATURES_GREETING → features.greeting
 * - APPS_GATE → apps.gate
 * - APPS_SYSTEM → apps.system
 *
 * Rule: UPPER_SNAKE_CASE → lower.dot.notation
 */
export const envMap = {
  // Note: Environment mapping is automatic
  // This object is kept for documentation purposes only
};
