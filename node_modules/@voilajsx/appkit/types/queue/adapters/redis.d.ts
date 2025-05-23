/**
 * Redis queue adapter using Bull
 * @extends QueueAdapter
 */
export class RedisAdapter extends QueueAdapter {
    queues: Map<any, any>;
    redisConfig: any;
    defaultJobOptions: any;
    prefix: any;
    /**
     * Parses Redis connection configuration
     * @private
     * @param {string|Object} redisConfig - Redis configuration
     * @returns {string|Object} Parsed configuration
     */
    private parseRedisConfig;
    /**
     * Gets or creates a Bull queue
     * @private
     * @param {string} name - Queue name
     * @returns {Bull.Queue} Bull queue instance
     */
    private getOrCreateQueue;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Additional Bull-specific methods
     */
    /**
     * Pauses a queue
     * @param {string} queue - Queue name
     * @param {boolean} [isLocal=false] - If true, pause only locally
     * @returns {Promise<void>}
     */
    pauseQueue(queue: string, isLocal?: boolean): Promise<void>;
    /**
     * Resumes a queue
     * @param {string} queue - Queue name
     * @param {boolean} [isLocal=false] - If true, resume only locally
     * @returns {Promise<void>}
     */
    resumeQueue(queue: string, isLocal?: boolean): Promise<void>;
    /**
     * Gets failed jobs
     * @param {string} queue - Queue name
     * @param {number} [start=0] - Start index
     * @param {number} [end=-1] - End index
     * @returns {Promise<Array>} Failed jobs
     */
    getFailedJobs(queue: string, start?: number, end?: number): Promise<any[]>;
    /**
     * Retries a failed job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    retryJob(queue: string, jobId: string): Promise<boolean>;
    /**
     * Gets jobs of a specific type
     * @param {string} queue - Queue name
     * @param {string} type - Job type ('active', 'waiting', 'delayed', 'completed', 'failed')
     * @param {number} [start=0] - Start index
     * @param {number} [end=-1] - End index
     * @returns {Promise<Array>} Jobs
     */
    getJobs(queue: string, type: string, start?: number, end?: number): Promise<any[]>;
    /**
     * Cleans up jobs
     * @param {string} queue - Queue name
     * @param {number} [grace=3600000] - Grace period in milliseconds (1 hour)
     * @param {string} [status='completed'] - Job status to clean up
     * @param {number} [limit=1000] - Maximum number of jobs to clean up
     * @returns {Promise<number>} Number of jobs removed
     */
    cleanUp(queue: string, grace?: number, status?: string, limit?: number): Promise<number>;
}
import { QueueAdapter } from './base.js';
