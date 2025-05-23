# @voilajsx/appkit

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal, framework-agnostic Node.js application toolkit providing essential
building blocks for modern applications.

## Introduction

`@voilajsx/appkit` is a modular toolkit designed to simplify Node.js development
with independent, reusable utilities for common application tasks. Each of the
13 modules is standalone, allowing developers to use only what they need while
maintaining a consistent, intuitive API. Whether you're building with Express,
Fastify, Koa, or vanilla Node.js, `@voilajsx/appkit` integrates seamlessly.

### Key Principles

- **Minimal**: Lightweight, focused features without bloat.
- **Framework-agnostic**: Compatible with any Node.js framework or environment.
- **Modular**: Use individual modules independently.
- **Type-safe**: TypeScript support for better developer experience (coming
  soon).
- **Well-tested**: Comprehensive test coverage for reliability.
- **Production-ready**: Proven in real-world applications.

## Installation

```bash
npm install @voilajsx/appkit
```

## Modules Overview

The table below summarizes the 13 independent modules, their purposes, and key
methods. Click a module name to jump to its detailed explanation, including all
methods and documentation links.

| Module                        | Description                                            | Key Methods                                                                  |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [**Auth**](#auth)             | Authentication and authorization utilities             | `generateToken`, `verifyToken`, `hashPassword`, `createAuthMiddleware`       |
| [**TenantDB**](#tenantdb)     | Multi-tenant database management                       | `createDb`, `forTenant`, `createTenant`, `createMiddleware`                  |
| [**Cache**](#cache)           | Caching with in-memory or Redis strategies             | `createCache`, `get`, `set`, `getOrSet`                                      |
| [**Events**](#events)         | Pub/sub event bus for decoupled communication          | `subscribe`, `publish`, `unsubscribe`, `publishBatch`                        |
| [**Security**](#security)     | CSRF protection, rate limiting, and sanitization       | `createCsrfMiddleware`, `createRateLimiter`, `sanitizeInput`, `sanitizeHtml` |
| [**Error**](#error)           | Consistent error handling and formatting               | `createError`, `badRequestError`, `notFoundError`, `createErrorHandler`      |
| [**Logging**](#logging)       | Structured logging with multiple transports            | `createLogger`, `info`, `error`, `debug`                                     |
| [**Storage**](#storage)       | File storage abstraction for local and cloud providers | `initStorage`, `upload`, `download`, `generateSignedUrl`                     |
| [**Email**](#email)           | Template-based email sending                           | `initEmail`, `sendEmail`, `sendTemplatedEmail`, `closeEmail`                 |
| [**Queue**](#queue)           | Background job processing                              | `initQueue`, `addJob`, `processJob`, `closeQueue`                            |
| [**Config**](#config)         | Environment-based configuration management             | `loadConfig`, `getConfig`, `setConfig`, `validateConfig`                     |
| [**Validation**](#validation) | Schema-based data validation                           | `createValidator`, `validate`, `validateAsync`, `createValidationMiddleware` |
| [**Utils**](#utils)           | Helper functions for data manipulation and async tasks | `pick`, `deepMerge`, `generateId`, `retry`                                   |

## Quick Start

```javascript
import { auth, tenantdb, cache, logging } from '@voilajsx/appkit';

// Initialize logger
const logger = logging.createLogger();

// Generate a JWT token
const token = auth.generateToken({ userId: '123' });

// Initialize tenant database
const db = tenantdb.createDb();
const tenantDb = await db.forTenant('tenant1');

// Initialize cache
const cacheInstance = await cache.createCache();
await cacheInstance.set('key', 'value');

logger.info('Application initialized');
```

## Getting Started

1. Install the package: `npm install @voilajsx/appkit`
2. Import the desired modules.
3. Use the key methods as shown in the modules overview table.
4. Refer to detailed explanations below for all methods and further
   documentation.

## Module Details

### Auth

**What It’s About**: The `auth` module provides tools for user authentication
and authorization, including JWT token management, password hashing, and
middleware for securing routes.

**What You Can Do**: Generate and verify JWT tokens, hash and compare passwords,
create middleware for token-based authentication or role-based authorization,
and integrate with any Node.js framework.

**Methods**:

| Method                          | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `generateToken`                 | Creates a JWT token from a payload.                |
| `verifyToken`                   | Verifies and decodes a JWT token.                  |
| `hashPassword`                  | Hashes a password securely.                        |
| `comparePassword`               | Compares a password with its hash.                 |
| `createAuthMiddleware`          | Creates middleware for token-based authentication. |
| `createAuthorizationMiddleware` | Creates middleware for role-based authorization.   |

**Resources**:

- [Auth README](/src/auth/README.md)
- [Developer Reference](/src/auth/docs/DEVELOPER_REFERENCE.md)

### TenantDB

**What It’s About**: The `tenantdb` module enables multi-tenant database
management, supporting row, schema, or database isolation strategies for
tenant-specific data.

**What You Can Do**: Initialize tenant databases, manage tenant-specific data,
create tenant isolation middleware, and perform tenant lifecycle operations like
creation or migration.

**Methods**:

| Method                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `createDb`            | Initializes a multi-tenant database instance.     |
| `forTenant`           | Gets a database client for a specific tenant.     |
| `createTenant`        | Creates a new tenant.                             |
| `deleteTenant`        | Deletes a tenant.                                 |
| `migrateTenant`       | Runs migrations for a tenant.                     |
| `listTenants`         | Lists all tenants.                                |
| `tenantExists`        | Checks if a tenant exists.                        |
| `createMiddleware`    | Creates middleware for tenant isolation.          |
| `createTenantContext` | Creates a context for tenant-specific operations. |

**Resources**:

- [TenantDB README](/src/tenantdb/README.md)
- [Developer Reference](/src/tenantdb/docs/DEVELOPER_REFERENCE.md)

### Cache

**What It’s About**: The `cache` module provides caching utilities with support
for in-memory, Redis, or Memcached strategies.

**What You Can Do**: Store and retrieve data efficiently, manage cache
expiration, implement cache-aside patterns, and namespace caches for isolation.

**Methods**:

| Method          | Description                                         |
| --------------- | --------------------------------------------------- |
| `createCache`   | Initializes a cache instance.                       |
| `get`           | Retrieves a value by key.                           |
| `set`           | Stores a value with a key.                          |
| `has`           | Checks if a key exists.                             |
| `delete`        | Deletes a key.                                      |
| `clear`         | Clears the entire cache.                            |
| `getMany`       | Retrieves multiple values by keys.                  |
| `setMany`       | Stores multiple key-value pairs.                    |
| `deleteMany`    | Deletes multiple keys.                              |
| `deletePattern` | Deletes keys matching a pattern.                    |
| `keys`          | Lists all keys.                                     |
| `ttl`           | Gets the time-to-live for a key.                    |
| `expire`        | Sets expiration for a key.                          |
| `namespace`     | Creates a namespaced cache instance.                |
| `getOrSet`      | Retrieves or sets a value using a factory function. |

**Resources**:

- [Cache README](/src/cache/README.md)
- [Developer Reference](/src/cache/docs/DEVELOPER_REFERENCE.md)

### Events

**What It’s About**: The `events` module implements a pub/sub event bus for
decoupled, event-driven communication.

**What You Can Do**: Publish and subscribe to events, handle async event
processing, manage event history, and integrate with custom event stores.

**Methods**:

| Method              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `subscribe`         | Subscribes to an event with a callback.        |
| `subscribeAsync`    | Subscribes to an event with an async callback. |
| `unsubscribe`       | Unsubscribes a callback from an event.         |
| `unsubscribeAsync`  | Unsubscribes an async callback from an event.  |
| `publish`           | Publishes an event with optional data.         |
| `publishBatch`      | Publishes multiple events.                     |
| `getEventHistory`   | Retrieves event history.                       |
| `clearEventHistory` | Clears event history.                          |
| `setEventStore`     | Sets a custom event store.                     |
| `waitForEvent`      | Waits for an event to occur.                   |

**Resources**:

- [Events README](/src/events/README.md)
- [Developer Reference](/src/events/docs/DEVELOPER_REFERENCE.md)

### Security

**What It’s About**: The `security` module offers utilities to protect
applications from common vulnerabilities like CSRF, rate limiting, and XSS.

**What You Can Do**: Secure API endpoints with middleware, sanitize user inputs,
enforce rate limits, and ensure safe file handling.

**Methods**:

| Method                 | Description                             |
| ---------------------- | --------------------------------------- |
| `createCsrfMiddleware` | Creates middleware for CSRF protection. |
| `createRateLimiter`    | Creates middleware for rate limiting.   |
| `sanitizeInput`        | Sanitizes user input to prevent XSS.    |
| `sanitizeHtml`         | Sanitizes HTML content.                 |
| `escapeString`         | Escapes special characters in a string. |
| `sanitizeFilename`     | Sanitizes filenames for safe storage.   |

**Resources**:

- [Security README](/src/security/README.md)
- [Developer Reference](/src/security/docs/DEVELOPER_REFERENCE.md)

### Error

**What It’s About**: The `error` module standardizes error handling and
formatting across applications.

**What You Can Do**: Create typed errors, handle errors consistently in
middleware, format API error responses, and validate requests.

**Methods**:

| Method                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `createError`             | Creates a custom error with a type.       |
| `validationError`         | Creates an error for validation failures. |
| `notFoundError`           | Creates an error for missing resources.   |
| `authenticationError`     | Creates an authentication error.          |
| `authorizationError`      | Creates an authorization error.           |
| `conflictError`           | Creates a conflict error.                 |
| `badRequestError`         | Creates a bad request error.              |
| `rateLimitError`          | Creates a rate limit error.               |
| `serviceUnavailableError` | Creates a service unavailable error.      |
| `internalError`           | Creates an internal server error.         |
| `formatErrorResponse`     | Formats an error for API responses.       |
| `createErrorHandler`      | Creates middleware for error handling.    |
| `asyncHandler`            | Wraps async routes for error handling.    |
| `notFoundHandler`         | Creates middleware for 404 responses.     |
| `validateRequest`         | Validates request data against a schema.  |

**Resources**:

- [Error README](/src/error/README.md)
- [Developer Reference](/src/error/docs/DEVELOPER_REFERENCE.md)

### Logging

**What It’s About**: The `logging` module provides structured logging with
support for multiple transports.

**What You Can Do**: Log application events at different levels, create
contextual loggers, and manage log lifecycle.

**Methods**:

| Method         | Description                                     |
| -------------- | ----------------------------------------------- |
| `createLogger` | Creates a logger instance.                      |
| `info`         | Logs an info-level message.                     |
| `error`        | Logs an error-level message.                    |
| `warn`         | Logs a warning-level message.                   |
| `debug`        | Logs a debug-level message.                     |
| `child`        | Creates a child logger with additional context. |
| `flush`        | Flushes buffered logs.                          |
| `close`        | Closes the logger.                              |

**Resources**:

- [Logging README](/src/logging/README.md)
- [Developer Reference](/src/logging/docs/DEVELOPER_REFERENCE.md)

### Storage

**What It’s About**: The `storage` module abstracts file storage for local and
cloud providers like S3.

**What You Can Do**: Upload, download, and manage files, generate signed URLs,
and organize file storage with metadata and directories.

**Methods**:

| Method              | Description                                  |
| ------------------- | -------------------------------------------- |
| `initStorage`       | Initializes a storage provider.              |
| `upload`            | Uploads a file to storage.                   |
| `uploadLarge`       | Uploads a large file with progress tracking. |
| `download`          | Downloads a file from storage.               |
| `downloadStream`    | Streams a file from storage.                 |
| `delete`            | Deletes a file from storage.                 |
| `getMetadata`       | Retrieves file metadata.                     |
| `createDirectory`   | Creates a directory.                         |
| `listFiles`         | Lists files in a directory.                  |
| `generateSignedUrl` | Generates a signed URL for file access.      |

**Resources**:

- [Storage README](/src/storage/README.md)
- [Developer Reference](/src/storage/docs/DEVELOPER_REFERENCE.md)

### Email

**What It’s About**: The `email` module simplifies sending emails with template
support.

**What You Can Do**: Send plain or templated emails, manage email provider
connections, and integrate with queue systems for async sending.

**Methods**:

| Method               | Description                           |
| -------------------- | ------------------------------------- |
| `initEmail`          | Initializes an email provider.        |
| `closeEmail`         | Closes the email provider connection. |
| `getEmailProvider`   | Retrieves the current email provider. |
| `sendEmail`          | Sends an email.                       |
| `sendTemplatedEmail` | Sends a templated email.              |

**Resources**:

- [Email README](/src/email/README.md)
- [Developer Reference](/src/email/docs/DEVELOPER_REFERENCE.md)

### Queue

**What It’s About**: The `queue` module manages background job processing for
tasks like data processing or notifications.

**What You Can Do**: Add and process jobs, handle job events, and manage queue
lifecycle for scalable task management.

**Methods**:

| Method       | Description                                         |
| ------------ | --------------------------------------------------- |
| `initQueue`  | Initializes a job queue.                            |
| `addJob`     | Adds a job to the queue.                            |
| `processJob` | Processes jobs of a specific type.                  |
| `on`         | Listens for queue events (e.g., completed, failed). |
| `getJob`     | Retrieves a job by ID.                              |
| `removeJob`  | Removes a job from the queue.                       |
| `clearQueue` | Clears a specific queue.                            |
| `closeQueue` | Closes the queue connection.                        |

**Resources**:

- [Queue README](/src/queue/README.md)
- [Developer Reference](/src/queue/docs/DEVELOPER_REFERENCE.md)

### Config

**What It’s About**: The `config` module handles environment-based configuration
management.

**What You Can Do**: Load and validate configurations, retrieve environment
variables, and manage dynamic configuration updates.

**Methods**:

| Method            | Description                                |
| ----------------- | ------------------------------------------ |
| `loadConfig`      | Loads configuration from a file or object. |
| `setConfig`       | Sets configuration programmatically.       |
| `getConfig`       | Retrieves a configuration value.           |
| `getEnv`          | Retrieves an environment variable.         |
| `reloadConfig`    | Reloads configuration from a file.         |
| `hasConfig`       | Checks if a configuration key exists.      |
| `clearConfig`     | Clears all configuration data.             |
| `validateConfig`  | Validates configuration against a schema.  |
| `defineSchema`    | Defines a configuration schema.            |
| `getConfigSchema` | Retrieves a configuration schema.          |

**Resources**:

- [Config README](/src/config/README.md)
- [Developer Reference](/src/config/docs/DEVELOPER_REFERENCE.md)

### Validation

**What It’s About**: The `validation` module provides schema-based data
validation and sanitization.

**What You Can Do**: Validate user inputs, create validation middleware, and
extend schemas for custom rules.

**Methods**:

| Method                       | Description                                |
| ---------------------------- | ------------------------------------------ |
| `createValidator`            | Creates a validator instance.              |
| `validate`                   | Validates data synchronously.              |
| `validateAsync`              | Validates data asynchronously.             |
| `addRule`                    | Adds a custom validation rule.             |
| `extendSchema`               | Extends a validation schema.               |
| `createValidationMiddleware` | Creates middleware for request validation. |

**Resources**:

- [Validation README](/src/validation/README.md)
- [Developer Reference](/src/validation/docs/DEVELOPER_REFERENCE.md)

### Utils

**What It’s About**: The `utils` module offers helper functions for data
manipulation, string formatting, and async operations.

**What You Can Do**: Manipulate objects, generate IDs, retry operations, format
data, and manage async tasks.

**Methods**:

| Method       | Description                                  |
| ------------ | -------------------------------------------- |
| `pick`       | Selects specific keys from an object.        |
| `omit`       | Omits specific keys from an object.          |
| `deepMerge`  | Merges objects deeply.                       |
| `deepClone`  | Creates a deep copy of an object.            |
| `get`        | Retrieves a nested object value.             |
| `set`        | Sets a nested object value.                  |
| `flatten`    | Flattens a nested object.                    |
| `unflatten`  | Unflattens a flat object.                    |
| `isEqual`    | Compares two values for equality.            |
| `capitalize` | Capitalizes a string.                        |
| `camelCase`  | Converts a string to camelCase.              |
| `generateId` | Generates a random ID.                       |
| `slugify`    | Creates a URL-friendly slug.                 |
| `formatDate` | Formats a date.                              |
| `addDays`    | Adds days to a date.                         |
| `sleep`      | Pauses execution for a specified time.       |
| `retry`      | Retries a function with exponential backoff. |
| `timeout`    | Adds a timeout to a promise.                 |
| `parallel`   | Runs tasks concurrently.                     |

**Resources**:

- [Utils README](/src/utils/README.md)
- [Developer Reference](/src/utils/docs/DEVELOPER_REFERENCE.md)

## Contributing

Contributions are welcome! See our [Contributing Guide](CONTRIBUTING.md) for
details.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p >
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
