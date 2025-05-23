/**
 * Creates a new cache instance with the specified options
 * @param {Object} options - Cache options
 * @param {string} [options.strategy='memory'] - Cache strategy ('redis', 'memcached', 'memory')
 * @param {string} [options.url] - Connection URL (for Redis)
 * @param {string[]} [options.servers] - Server list (for Memcached)
 * @param {number} [options.maxItems] - Maximum items (for Memory)
 * @param {string} [options.keyPrefix] - Key prefix for all cache keys
 * @param {number} [options.defaultTTL] - Default TTL in seconds
 * @param {Object} [options.serializer] - Custom serializer
 * @returns {Promise<Object>} Cache instance
 * @throws {Error} If strategy is invalid or connection fails
 */
export function createCache(options?: {
    strategy?: string;
    url?: string;
    servers?: string[];
    maxItems?: number;
    keyPrefix?: string;
    defaultTTL?: number;
    serializer?: any;
}): Promise<any>;
