/**
 * Creates and registers a named cache instance
 * @param {string} name - Instance name
 * @param {Object} options - Cache options (strategy, connection details, etc.)
 * @returns {Promise<Object>} Cache instance
 * @throws {Error} If an instance with the same name already exists
 */
export function createNamedCache(name: string, options: any): Promise<any>;
/**
 * Gets a previously created cache instance by name
 * @param {string} name - Instance name
 * @returns {Object} Cache instance
 * @throws {Error} If the named instance doesn't exist
 */
export function getNamedCache(name: string): any;
/**
 * Checks if a named cache instance exists
 * @param {string} name - Instance name
 * @returns {boolean} True if the instance exists
 */
export function hasNamedCache(name: string): boolean;
/**
 * Closes and removes a named cache instance
 * @param {string} name - Instance name
 * @returns {Promise<boolean>} True if the instance was removed
 */
export function removeNamedCache(name: string): Promise<boolean>;
/**
 * Closes and removes all cache instances
 * @returns {Promise<void>}
 */
export function clearAllCaches(): Promise<void>;
/**
 * Gets all registered cache instance names
 * @returns {string[]} Array of instance names
 */
export function getCacheNames(): string[];
