/**
 * @fileoverview Standalone script to test configuration loading with @voilajsx/appkit/config.
 * @description Provides detailed console logs to debug environment variable and schema validation issues.
 */

import { loadConfig, ConfigError } from '@voilajsx/appkit/config';

/**
 * Main function to perform configuration loading test.
 * @async
 * @returns {Promise<void>}
 */
async function testConfigLoading() {
  console.log('--- Starting Config Loading Test ---');
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log('--- Raw process.env values (relevant ones) ---');
  // Log specific env variables that are mapped
  const relevantEnvVars = [
    'APP_NAME',
    'APP_VERSION',
    'NODE_ENV',
    'PORT',
    'HOST',
    'SERVER_SSL_ENABLED',
    'SERVER_SSL_KEY',
    'SERVER_SSL_CERT',
    'LOG_LEVEL',
    'LOG_ENABLE_FILE_LOGGING',
    'LOG_DIR',
    'LOG_FILENAME',
    'LOG_RETENTION_DAYS',
    'LOG_MAX_SIZE',
    'FEATURE_WELCOME',
    'FEATURE_GREETING',
    'FEATURE_DEBUGTOLBAR',
  ];
  relevantEnvVars.forEach((key) => {
    console.log(`  ${key}: '${process.env[key] || 'undefined'}'`);
  });
  console.log('-----------------------------------');

  // Define schema with 'string' types for values coming from .env
  // Removed 'app', 'server', 'logging' from top-level 'required' array
  const configSchema = {
    type: 'object',
    // Removed 'app', 'server', 'logging' from here
    // required: ['app', 'server', 'logging'],
    properties: {
      app: {
        type: 'object',
        required: ['name', 'version', 'environment'], // Individual properties can still be required
        properties: {
          name: { type: 'string', default: '@voilajsx/singlet-app' },
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
        required: ['port', 'host'], // Individual properties can still be required
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
          // Properties can still be required within the logging object if needed
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

  const envMap = {
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

  console.log('--- Schema defined for validation (after modification) ---');
  console.dir(configSchema, { depth: null, colors: true });
  console.log('-----------------------------------');
  console.log('--- Environment variable to config path map ---');
  console.dir(envMap, { depth: null, colors: true });
  console.log('-----------------------------------');

  let loadedConfig;
  try {
    console.log('Attempting to load configuration from process.env...');
    loadedConfig = await loadConfig(process.env, {
      validate: true,
      schema: configSchema,
      env: true,
      interpolate: true,
      map: envMap,
    });

    console.log('✅ Configuration loaded successfully (as strings):');
    console.dir(loadedConfig, { depth: null, colors: true });

    console.log('--- Attempting manual type parsing ---');
    // Ensure nested objects exist before trying to access properties
    if (loadedConfig.server) {
      loadedConfig.server.port = parseInt(loadedConfig.server.port, 10);
      if (loadedConfig.server.ssl) {
        loadedConfig.server.ssl.enabled =
          String(loadedConfig.server.ssl.enabled).toLowerCase() === 'true';
      }
    }

    if (loadedConfig.logging) {
      loadedConfig.logging.enableFileLogging =
        String(loadedConfig.logging.enableFileLogging).toLowerCase() === 'true';
      loadedConfig.logging.retentionDays = parseInt(
        loadedConfig.logging.retentionDays,
        10
      );
      loadedConfig.logging.maxSize = parseInt(loadedConfig.logging.maxSize, 10);
    }

    if (loadedConfig.features) {
      for (const key in loadedConfig.features) {
        if (Object.prototype.hasOwnProperty.call(loadedConfig.features, key)) {
          loadedConfig.features[key] =
            String(loadedConfig.features[key]).toLowerCase() === 'true';
        }
      }
    }
    console.log('✅ Configuration after manual parsing:');
    console.dir(loadedConfig, { depth: null, colors: true });
  } catch (err) {
    console.error('❌ Configuration loading failed!');
    if (err instanceof ConfigError) {
      console.error(`Error Code: ${err.code}`);
      console.error(`Error Message: ${err.message}`);
      if (err.details && err.details.errors) {
        console.error('--- Detailed Validation Errors ---');
        err.details.errors.forEach((validationErr, index) => {
          console.error(
            `  ${index + 1}. Path: ${validationErr.path || 'N/A'}, Message: ${
              validationErr.message
            }`
          );
        });
        console.error('----------------------------------');
      }
    } else {
      console.error('An unexpected error occurred:', err);
    }
  } finally {
    console.log('--- Config Loading Test Finished ---');
  }
}

// Execute the test function
testConfigLoading();
