/**
 * @voilajs/appkit - Base queue adapter
 * @module @voilajs/appkit/queue/adapters/base
 */
/**
 * Base queue adapter interface
 */
export class QueueAdapter {
    constructor(config?: {});
    config: {};
    isInitialized: boolean;
    /**
     * Initializes the queue adapter
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Validates that the adapter is initialized
     * @private
     * @throws {Error} If the adapter is not initialized
     */
    private _validateInitialized;
    /**
     * Validates queue name
     * @protected
     * @param {string} queue - Queue name to validate
     * @throws {Error} If queue name is invalid
     */
    protected _validateQueue(queue: string): void;
    /**
     * Validates job ID
     * @protected
     * @param {string} jobId - Job ID to validate
     * @throws {Error} If job ID is invalid
     */
    protected _validateJobId(jobId: string): void;
    /**
     * Adds a job to a queue
     * @param {string} queue - Queue name
     * @param {Object} data - Job data
     * @param {Object} [options] - Job options
     * @returns {Promise<Object>} Job info
     */
    addJob(queue: string, data: any, options?: any): Promise<any>;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     * @returns {void}
     */
    processJobs(queue: string, processor: Function, options?: any): void;
    /**
     * Gets a specific job by ID
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Job data
     */
    getJob(queue: string, jobId: string): Promise<any>;
    /**
     * Updates a job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @param {Object} update - Update data
     * @returns {Promise<boolean>} Success status
     */
    updateJob(queue: string, jobId: string, update: any): Promise<boolean>;
    /**
     * Removes a job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    removeJob(queue: string, jobId: string): Promise<boolean>;
    /**
     * Gets queue information
     * @param {string} queue - Queue name
     * @returns {Promise<Object>} Queue statistics
     */
    getQueueInfo(queue: string): Promise<any>;
    /**
     * Clears a queue
     * @param {string} queue - Queue name
     * @returns {Promise<boolean>} Success status
     */
    clearQueue(queue: string): Promise<boolean>;
    /**
     * Stops processing jobs
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
    /**
     * Standardizes a job object format
     * @protected
     * @param {Object} job - Job data to standardize
     * @returns {Object} Standardized job object
     */
    protected _standardizeJob(job: any): any;
    /**
     * Calculates retry delay using backoff strategy
     * @protected
     * @param {number} attempts - Current attempt count
     * @param {Object} options - Job options
     * @returns {number} Delay in milliseconds
     */
    protected _calculateRetryDelay(attempts: number, options?: any): number;
}
