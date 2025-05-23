/**
 * In-memory cache strategy implementation
 * @extends CacheStrategy
 */
export class MemoryStrategy extends CacheStrategy {
    /**
     * Create a new memory cache strategy
     * @param {Object} config - Strategy configuration
     * @param {number} [config.maxItems=1000] - Maximum items to store
     * @param {number} [config.defaultTTL] - Default TTL in seconds
     */
    constructor(config: {
        maxItems?: number;
        defaultTTL?: number;
    });
    store: Map<any, any>;
    timers: Map<any, any>;
    maxItems: number;
    /**
     * Get all keys matching a pattern
     * @param {string} pattern - Pattern to match
     * @returns {Promise<string[]>} Matching keys
     */
    keys(pattern: string): Promise<string[]>;
    /**
     * Delete keys matching a pattern
     * @param {string} pattern - Pattern to match
     * @returns {Promise<number>} Number of keys deleted
     */
    deletePattern(pattern: string): Promise<number>;
    /**
     * Get time-to-live for a key
     * @param {string} key - Cache key
     * @returns {Promise<number>} TTL in seconds, -1 if no TTL, -2 if key doesn't exist
     */
    ttl(key: string): Promise<number>;
    /**
     * Update expiration for a key
     * @param {string} key - Cache key
     * @param {number} ttl - New TTL in seconds
     * @returns {Promise<boolean>} Success status
     */
    expire(key: string, ttl: number): Promise<boolean>;
}
import { CacheStrategy } from './base.js';
