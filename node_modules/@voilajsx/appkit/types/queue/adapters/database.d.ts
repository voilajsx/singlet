/**
 * Database queue adapter with support for multiple database drivers
 * @extends QueueAdapter
 */
export class DatabaseAdapter extends QueueAdapter {
    databaseType: any;
    connectionConfig: any;
    tableName: any;
    connection: any;
    driver: any;
    processors: Map<any, any>;
    processing: boolean;
    pollInterval: any;
    maxConcurrency: any;
    /**
     * Loads the appropriate database driver for the specified database type
     * @private
     * @param {string} databaseType - The type of database to use
     * @returns {Promise<Object>} The database driver
     */
    private loadDatabaseDriver;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Starts the processing loop
     * @private
     */
    private startProcessing;
    /**
     * Main processing loop
     * @private
     */
    private processLoop;
    /**
     * Processes the next batch of jobs
     * @private
     */
    private processNextBatch;
    /**
     * Processes a single job
     * @private
     * @param {Object} job - Job data
     * @param {Function} processor - Job processor function
     */
    private processJob;
    /**
     * Gets failed jobs
     * @param {string} queue - Queue name
     * @param {number} [limit=10] - Number of jobs to retrieve
     * @returns {Promise<Array>} Failed jobs
     */
    getFailedJobs(queue: string, limit?: number): Promise<any[]>;
    /**
     * Retries a failed job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    retryJob(queue: string, jobId: string): Promise<boolean>;
    /**
     * Gets jobs by status
     * @param {string} queue - Queue name
     * @param {string} status - Job status
     * @param {number} [limit=10] - Number of jobs to retrieve
     * @returns {Promise<Array>} Jobs
     */
    getJobsByStatus(queue: string, status: string, limit?: number): Promise<any[]>;
    /**
     * Cleans up old completed jobs
     * @param {string} queue - Queue name
     * @param {number} [daysOld=7] - Age of jobs to remove in days
     * @returns {Promise<number>} Number of jobs removed
     */
    cleanupOldJobs(queue: string, daysOld?: number): Promise<number>;
    /**
     * Gets job processing metrics
     * @param {string} queue - Queue name
     * @param {number} [timeSpan=86400000] - Time span in milliseconds (default: 24 hours)
     * @returns {Promise<Object>} Processing metrics
     */
    getProcessingMetrics(queue: string, timeSpan?: number): Promise<any>;
    /**
     * Creates a recurring job
     * @param {string} queue - Queue name
     * @param {Object} data - Job data
     * @param {Object} options - Job options
     * @param {string} cronExpression - Cron expression for scheduling
     * @returns {Promise<Object>} Job info
     */
    createRecurringJob(queue: string, data: any, options: any, cronExpression: string): Promise<any>;
}
import { QueueAdapter } from './base.js';
