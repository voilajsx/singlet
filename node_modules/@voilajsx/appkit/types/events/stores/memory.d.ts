/**
 * In-memory event store implementation
 * @extends EventStore
 */
export class MemoryStore extends EventStore {
    /**
     * Creates a new in-memory store
     * @param {Object} options - Store options
     * @param {number} [options.maxEvents=10000] - Maximum events to store
     * @param {number} [options.maxEventSize=1048576] - Maximum event size in bytes (1MB default)
     */
    constructor(options?: {
        maxEvents?: number;
        maxEventSize?: number;
    });
    events: any[];
    maxEvents: number;
    maxEventSize: number;
    /**
     * Gets events by event name
     * @param {string} eventName - Event name to filter by
     * @returns {Array<Object>} Filtered events
     */
    getEventsByName(eventName: string): Array<any>;
    /**
     * Gets events since timestamp
     * @param {Date} since - Date to filter from
     * @returns {Array<Object>} Filtered events
     */
    getEventsSince(since: Date): Array<any>;
    /**
     * Gets recent events
     * @param {number} count - Number of events to return
     * @returns {Array<Object>} Recent events
     */
    getRecentEvents(count?: number): Array<any>;
    /**
     * Adds multiple events at once
     * @param {Array<Object>} events - Array of events to add
     * @returns {Array<string>} Array of added event IDs
     */
    addEvents(events: Array<any>): Array<string>;
}
import { EventStore } from './base.js';
