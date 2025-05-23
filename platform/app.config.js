/**
 * @fileoverview Defines the application's configuration schema and environment variable mapping.
 * @description Centralized configuration definition for @voilajsx/singlet-app.
 */

// Define schema for validation
// IMPORTANT: 'app', 'server', 'logging' are NOT in the top-level 'required' array
// This allows them to be built from mapped environment variables by loadConfig.
export const configSchema = {
  type: 'object',
  properties: {
    app: {
      type: 'object',
      required: ['name', 'version', 'environment'],
      properties: {
        name: { type: 'string', default: '@voilajsx/singletapp' },
        version: { type: 'string', default: '1.0.0' },
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
        host: { type: 'string', default: '0.0.0.0' },
        port: { type: 'string', default: '3000' },
        ssl: {
          type: 'object',
          properties: {
            enabled: { type: 'string', default: 'false' },
            key: { type: 'string' },
            cert: { type: 'string' },
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
        enableFileLogging: { type: 'string', default: 'true' },
        dirname: { type: 'string', default: 'logs' },
        filename: { type: 'string', default: 'app.log' },
        retentionDays: { type: 'string', default: '5' },
        maxSize: { type: 'string', default: '10485760' },
      },
    },
    features: {
      type: 'object',
      patternProperties: {
        '^FEATURE_.*$': { type: 'string' },
      },
      additionalProperties: { type: 'string' },
    },
  },
};

// Define environment variable map
export const envMap = {
  APP_NAME: 'app.name',
  APP_VERSION: 'app.version',
  NODE_ENV: 'app.environment',
  PORT: 'server.port',
  HOST: 'server.host',
  SERVER_SSL_ENABLED: 'server.ssl.enabled',
  SERVER_SSL_KEY: 'server.ssl.key',
  SERVER_SSL_CERT: 'server.ssl.cert',
  LOG_LEVEL: 'logging.level',
  LOG_ENABLE_FILE_LOGGING: 'logging.enableFileLogging',
  LOG_DIR: 'logging.dirname',
  LOG_FILENAME: 'logging.filename',
  LOG_RETENTION_DAYS: 'logging.retentionDays',
  LOG_MAX_SIZE: 'logging.maxSize',
  FEATURE_WELCOME: 'features.welcome',
  FEATURE_GREETING: 'features.greeting',
  FEATURE_DEBUGTOLBAR: 'features.debugToolbar',
};
