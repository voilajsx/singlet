/**
 * @voilajs/appkit - Base queue adapter
 * @module @voilajs/appkit/queue/adapters/base
 */

/**
 * Base queue adapter interface
 */
export class QueueAdapter {
  constructor(config = {}) {
    this.config = config;
    this.isInitialized = false;
  }

  /**
   * Initializes the queue adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    this.isInitialized = true;
  }

  /**
   * Validates that the adapter is initialized
   * @private
   * @throws {Error} If the adapter is not initialized
   */
  _validateInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        'Queue adapter not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Validates queue name
   * @protected
   * @param {string} queue - Queue name to validate
   * @throws {Error} If queue name is invalid
   */
  _validateQueue(queue) {
    if (!queue) {
      throw new Error('Queue name is required');
    }
    if (typeof queue !== 'string') {
      throw new Error('Queue name must be a string');
    }
  }

  /**
   * Validates job ID
   * @protected
   * @param {string} jobId - Job ID to validate
   * @throws {Error} If job ID is invalid
   */
  _validateJobId(jobId) {
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    if (typeof jobId !== 'string') {
      throw new Error('Job ID must be a string');
    }
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    this._validateInitialized();
    this._validateQueue(queue);
    if (data === undefined || data === null) {
      throw new Error('Job data is required');
    }

    // This should be implemented by subclass
    throw new Error('addJob() not implemented in this adapter');
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   * @returns {void}
   */
  async processJobs(queue, processor, options = {}) {
    this._validateInitialized();
    this._validateQueue(queue);
    if (typeof processor !== 'function') {
      throw new Error('Job processor must be a function');
    }

    // This should be implemented by subclass
    throw new Error('processJobs() not implemented in this adapter');
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);

    // This should be implemented by subclass
    throw new Error('getJob() not implemented in this adapter');
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);
    if (!update || typeof update !== 'object') {
      throw new Error('Update data must be an object');
    }

    // This should be implemented by subclass
    throw new Error('updateJob() not implemented in this adapter');
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);

    // This should be implemented by subclass
    throw new Error('removeJob() not implemented in this adapter');
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    this._validateInitialized();
    this._validateQueue(queue);

    // This should be implemented by subclass
    throw new Error('getQueueInfo() not implemented in this adapter');
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    this._validateInitialized();
    this._validateQueue(queue);

    // This should be implemented by subclass
    throw new Error('clearQueue() not implemented in this adapter');
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    // This should be implemented by subclass
    throw new Error('stop() not implemented in this adapter');
  }

  /**
   * Standardizes a job object format
   * @protected
   * @param {Object} job - Job data to standardize
   * @returns {Object} Standardized job object
   */
  _standardizeJob(job) {
    return {
      id: job.id.toString(),
      queue: job.queue,
      data: job.data || {},
      options: job.options || {},
      status: job.status || 'pending',
      priority: job.priority || 0,
      attempts: job.attempts || 0,
      maxAttempts: job.maxAttempts || job.options?.maxAttempts || 3,
      result: job.result || null,
      error: job.error || null,
      createdAt: job.createdAt || new Date(),
      processAfter: job.processAfter || job.createdAt || new Date(),
      startedAt: job.startedAt || null,
      completedAt: job.completedAt || null,
      failedAt: job.failedAt || null,
    };
  }

  /**
   * Calculates retry delay using backoff strategy
   * @protected
   * @param {number} attempts - Current attempt count
   * @param {Object} options - Job options
   * @returns {number} Delay in milliseconds
   */
  _calculateRetryDelay(attempts, options = {}) {
    const backoff = options.backoff || { type: 'exponential', delay: 1000 };
    const maxDelay = backoff.maxDelay || 30000;

    if (backoff.type === 'exponential') {
      return Math.min(backoff.delay * Math.pow(2, attempts - 1), maxDelay);
    } else if (backoff.type === 'fixed') {
      return backoff.delay || 1000;
    } else if (backoff.type === 'linear') {
      return Math.min(backoff.delay * attempts, maxDelay);
    }

    return 1000; // Default to 1 second
  }
}
