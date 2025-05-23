/**
 * In-memory queue adapter
 * @extends QueueAdapter
 */
export class MemoryAdapter extends QueueAdapter {
    queues: Map<any, any>;
    processors: Map<any, any>;
    processing: Map<any, any>;
    jobCounter: number;
    delayedTimeouts: Map<any, any>;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Process next job in queue
     * @private
     * @param {string} queue - Queue name
     */
    private processNextJob;
    /**
     * Generates a unique job ID
     * @private
     * @returns {string} Job ID
     */
    private generateJobId;
    /**
     * Sorts a queue by job priority
     * @private
     * @param {string} queue - Queue name to sort
     */
    private sortQueueByPriority;
    /**
     * Formats a job for processors
     * @private
     * @param {Object} job - Internal job object
     * @returns {Object} Formatted job
     */
    private formatJob;
    /**
     * Calculates retry delay
     * @private
     * @param {number} attempts - Current attempt count
     * @param {Object} options - Job options
     * @returns {number} Delay in milliseconds
     */
    private calculateRetryDelay;
    /**
     * Gets jobs with a specific status
     * @param {string} queue - Queue name
     * @param {string} status - Job status
     * @param {number} [limit=100] - Maximum number of jobs to return
     * @returns {Promise<Array>} Jobs with the specified status
     */
    getJobsByStatus(queue: string, status: string, limit?: number): Promise<any[]>;
    /**
     * Retries a failed job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    retryJob(queue: string, jobId: string): Promise<boolean>;
}
import { QueueAdapter } from './base.js';
