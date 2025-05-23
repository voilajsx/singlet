/**
 * Updated constants file
 *
 * This file defines constants for the queue module.
 * Create this file in your queue module folder.
 */

/**
 * @voilajs/appkit - Queue constants
 * @module @voilajs/appkit/queue/constants
 */

/**
 * Queue adapter types
 * @type {Object}
 */
export const QUEUE_ADAPTERS = {
  MEMORY: 'memory',
  REDIS: 'redis',
  DATABASE: 'database',
};

/**
 * Job status constants
 * @type {Object}
 */
export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  RECURRING: 'recurring',
};

/**
 * Backoff types
 * @type {Object}
 */
export const BACKOFF_TYPES = {
  EXPONENTIAL: 'exponential',
  FIXED: 'fixed',
  LINEAR: 'linear',
};

/**
 * Default job options
 * @type {Object}
 */
export const DEFAULT_JOB_OPTIONS = {
  priority: 0,
  delay: 0,
  maxAttempts: 3,
  backoff: {
    type: BACKOFF_TYPES.EXPONENTIAL,
    delay: 1000,
    maxDelay: 30000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

/**
 * Default polling interval (ms)
 * @type {number}
 */
export const DEFAULT_POLL_INTERVAL = 1000;

/**
 * Default concurrency
 * @type {number}
 */
export const DEFAULT_CONCURRENCY = 1;
