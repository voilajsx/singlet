/**
 * @voilajs/appkit - Base event store interface
 * @module @voilajs/appkit/events/stores/base
 */
/**
 * Base event store interface
 * @abstract
 */
export class EventStore {
    /**
     * Adds event to store
     * @abstract
     * @param {Object} event - Event record
     * @returns {string} Event ID
     */
    addEvent(event: any): string;
    /**
     * Gets all events
     * @abstract
     * @returns {Array<Object>} Array of events
     */
    getEvents(): Array<any>;
    /**
     * Clears all events
     * @abstract
     */
    clearEvents(): void;
    /**
     * Gets events count
     * @returns {number} Number of events
     */
    getCount(): number;
    /**
     * Validates event structure
     * @param {Object} event - Event to validate
     * @returns {boolean} True if valid
     */
    validateEvent(event: any): boolean;
}
