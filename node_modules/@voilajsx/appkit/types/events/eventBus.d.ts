/**
 * Initializes the event bus with a custom store
 * @param {EventStore} store - Custom event store implementation
 * @throws {Error} If store doesn't implement EventStore interface
 */
export function setEventStore(store: EventStore): void;
/**
 * Subscribes to an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(event: string, callback: Function): Function;
/**
 * Subscribes to an event with an async handler
 * @param {string} event - Event name
 * @param {Function} callback - Async event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribeAsync(event: string, callback: Function): Function;
/**
 * Unsubscribes from an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function to remove
 */
export function unsubscribe(event: string, callback: Function): void;
/**
 * Unsubscribes from an async event
 * @param {string} event - Event name
 * @param {Function} callback - Async event handler function to remove
 */
export function unsubscribeAsync(event: string, callback: Function): void;
/**
 * Publishes an event
 * @param {string} event - Event name
 * @param {any} data - Event data
 * @returns {string} Event ID
 */
export function publish(event: string, data: any): string;
/**
 * Publishes multiple events at once
 * @param {Array<{event: string, data: any}>} events - Array of events
 * @returns {Array<string>} Array of event IDs
 */
export function publishBatch(events: Array<{
    event: string;
    data: any;
}>): Array<string>;
/**
 * Gets event history
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.event] - Filter by event name
 * @param {Date} [filters.since] - Filter events since date
 * @param {number} [filters.limit] - Limit number of events returned
 * @returns {Array<Object>} Array of event records
 */
export function getEventHistory(filters?: {
    event?: string;
    since?: Date;
    limit?: number;
}): Array<any>;
/**
 * Clears event history
 */
export function clearEventHistory(): void;
/**
 * Waits for a specific event to occur
 * @param {string} eventName - Event to wait for
 * @param {Object} [options] - Options
 * @param {number} [options.timeout] - Timeout in milliseconds
 * @param {Function} [options.filter] - Filter function for event data
 * @returns {Promise<any>} Event data when it occurs
 */
export function waitForEvent(eventName: string, options?: {
    timeout?: number;
    filter?: Function;
}): Promise<any>;
import { EventStore } from './stores/base.js';
