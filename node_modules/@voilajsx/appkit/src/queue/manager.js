/**
 * @voilajs/appkit - Queue manager
 * @module @voilajs/appkit/queue/manager
 */

import { MemoryAdapter } from './adapters/memory.js';
import { RedisAdapter } from './adapters/redis.js';
import { DatabaseAdapter } from './adapters/database.js';

let queueInstance = null;

const ADAPTERS = {
  memory: MemoryAdapter,
  redis: RedisAdapter,
  database: DatabaseAdapter,
};

/**
 * Initializes queue adapter
 * @param {string} adapter - Adapter type ('memory', 'redis', 'database')
 * @param {Object} config - Adapter configuration
 * @returns {Promise<QueueAdapter>} Queue adapter instance
 * @throws {Error} If adapter is already initialized or invalid
 */
export async function initQueue(adapter, config = {}) {
  if (queueInstance) {
    throw new Error('Queue already initialized');
  }

  if (!adapter) {
    throw new Error('Queue adapter type is required');
  }

  const AdapterClass = ADAPTERS[adapter];
  if (!AdapterClass) {
    throw new Error(
      `Unknown queue adapter: ${adapter}. Available adapters: ${Object.keys(ADAPTERS).join(', ')}`
    );
  }

  queueInstance = new AdapterClass(config);
  await queueInstance.initialize();
  return queueInstance;
}

/**
 * Gets current queue instance
 * @returns {QueueAdapter} Queue adapter instance
 * @throws {Error} If queue is not initialized
 */
export function getQueue() {
  if (!queueInstance) {
    throw new Error('Queue not initialized. Call initQueue() first.');
  }
  return queueInstance;
}

/**
 * Closes the current queue instance and releases resources
 * @returns {Promise<void>}
 */
export async function closeQueue() {
  if (queueInstance) {
    await queueInstance.stop();
    queueInstance = null;
  }
}
