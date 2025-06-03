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
    security: {
      type: 'object',
      properties: {
        jwtSecret: {
          type: 'string',
          default: 'singlet-dev-secret-change-in-production',
        },
        sessionSecret: {
          type: 'string',
          default: 'singlet-session-secret-change-in-production',
        },
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
 * Environment variable mapping is now handled automatically by @voilajsx/appkit
 *
 * Mapping rules:
 * - SERVER_PORT → server.port
 * - SERVER_HOST → server.host
 * - LOG_LEVEL → logging.level
 * - FEATURES_WELCOME → features.welcome
 * - FEATURES_GREETING → features.greeting
 * - JWT_SECRET → security.jwtSecret
 * - SESSION_SECRET → security.sessionSecret
 *
 * Rule: UPPER_SNAKE_CASE → lower.dot.notation
 */
export const envMap = {
  // Note: This is now optional since appkit handles automatic mapping
  // But we can keep explicit mappings for documentation
};
