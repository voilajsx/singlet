/**
 * @voilajs/appkit - Cache wrapper
 * @module @voilajs/appkit/cache/wrapper
 */
/**
 * Wrapper around cache strategy to provide enhanced functionality
 */
export class CacheWrapper {
    /**
     * Create a new cache wrapper
     * @param {Object} strategy - Strategy instance to wrap
     */
    constructor(strategy: any);
    strategy: any;
    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or null if not found
     */
    get(key: string): Promise<any>;
    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<boolean>} Success status
     */
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} Success status
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear the entire cache
     * @returns {Promise<boolean>} Success status
     */
    clear(): Promise<boolean>;
    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} True if key exists
     */
    has(key: string): Promise<boolean>;
    /**
     * Get multiple values from cache
     * @param {string[]} keys - Array of cache keys
     * @returns {Promise<Array<any>>} Array of values (null for missing keys)
     */
    getMany(keys: string[]): Promise<Array<any>>;
    /**
     * Set multiple values in cache
     * @param {Object} items - Object with key-value pairs
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<boolean>} Success status
     */
    setMany(items: any, ttl?: number): Promise<boolean>;
    /**
     * Delete multiple keys from cache
     * @param {string[]} keys - Array of cache keys
     * @returns {Promise<number>} Number of keys deleted
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Close the cache connection
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
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
     * Update the expiration time for a key
     * @param {string} key - Cache key
     * @param {number} ttl - New TTL in seconds
     * @returns {Promise<boolean>} Success status
     */
    expire(key: string, ttl: number): Promise<boolean>;
    /**
     * Get all keys matching a pattern
     * @param {string} [pattern='*'] - Pattern to match
     * @returns {Promise<string[]>} Array of matching keys
     */
    keys(pattern?: string): Promise<string[]>;
    /**
     * Create a namespaced cache instance
     * @param {string} prefix - Namespace prefix
     * @returns {CacheWrapper} Namespaced cache instance
     */
    namespace(prefix: string): CacheWrapper;
    /**
     * Get a value from cache or set it if not found
     * @param {string} key - Cache key
     * @param {Function} factory - Function to generate value on cache miss
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<any>} Cached or generated value
     */
    getOrSet(key: string, factory: Function, ttl?: number): Promise<any>;
}
