/**
 * Memcached cache strategy implementation
 * @extends CacheStrategy
 */
export class MemcachedStrategy extends CacheStrategy {
    /**
     * Create a new Memcached cache strategy
     * @param {Object} config - Strategy configuration
     * @param {string[]} [config.servers] - Memcached servers
     * @param {Object} [config.options] - Memcached client options
     * @param {string} [config.keyPrefix] - Key prefix
     * @param {number} [config.defaultTTL] - Default TTL in seconds
     */
    constructor(config: {
        servers?: string[];
        options?: any;
        keyPrefix?: string;
        defaultTTL?: number;
    });
    client: any;
    serializer: any;
    /**
     * Update expiration for a key
     * @param {string} key - Cache key
     * @param {number} ttl - New TTL in seconds
     * @returns {Promise<boolean>} Success status
     */
    expire(key: string, ttl: number): Promise<boolean>;
    /**
     * Promisify a Memcached method
     * @private
     * @param {Function} method - Method to promisify
     * @returns {Function} Promisified method
     */
    private _promisify;
}
import { CacheStrategy } from './base.js';
