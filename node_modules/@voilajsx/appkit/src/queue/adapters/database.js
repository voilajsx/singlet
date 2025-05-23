/**
 * @voilajs/appkit - Database queue adapter
 * @module @voilajs/appkit/queue/adapters/database
 */

import { QueueAdapter } from './base.js';
import { DEFAULT_POLL_INTERVAL } from '../constants.js';

/**
 * Database queue adapter with support for multiple database drivers
 * @extends QueueAdapter
 */
export class DatabaseAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.databaseType = config.databaseType || 'postgres';
    this.connectionConfig = config.connectionConfig || {};
    this.tableName = config.tableName || 'jobs';
    this.connection = null;
    this.driver = null;
    this.processors = new Map();
    this.processing = false;
    this.pollInterval = config.pollInterval || DEFAULT_POLL_INTERVAL;
    this.maxConcurrency = config.maxConcurrency || 10;
  }

  /**
   * Initializes the database connection and creates tables
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();

    try {
      // Load the appropriate database driver
      this.driver = await this.loadDatabaseDriver(this.databaseType);

      // Connect to the database
      this.connection = await this.driver.connect(this.connectionConfig);

      // Create the jobs table if it doesn't exist
      await this.driver.createJobsTable(this.connection, this.tableName);
    } catch (error) {
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Loads the appropriate database driver for the specified database type
   * @private
   * @param {string} databaseType - The type of database to use
   * @returns {Promise<Object>} The database driver
   */
  async loadDatabaseDriver(databaseType) {
    try {
      // Import the appropriate driver based on the database type
      switch (databaseType.toLowerCase()) {
        case 'postgres':
          return await import('../drivers/postgres.js').then((m) => m.default);
        case 'mysql':
          return await import('../drivers/mysql.js').then((m) => m.default);
        case 'sqlite':
          return await import('../drivers/sqlite.js').then((m) => m.default);
        case 'mongodb':
          return await import('../drivers/mongodb.js').then((m) => m.default);
        default:
          throw new Error(`Unsupported database type: ${databaseType}`);
      }
    } catch (error) {
      // Check if the error is a module not found error
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          `Database driver not installed: ${databaseType}. Please install @voilajs/appkit-queue-driver-${databaseType}`
        );
      }
      throw error;
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
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (data === undefined || data === null) {
      throw new Error('Job data is required');
    }

    try {
      const delay = options.delay || 0;
      const processAfter = new Date(Date.now() + delay);

      const job = await this.driver.addJob(
        this.connection,
        this.tableName,
        queue,
        data,
        options,
        processAfter
      );

      // Trigger processing
      this.startProcessing();

      return {
        id: job.id.toString(),
        queue,
        status: job.status || 'pending',
      };
    } catch (error) {
      throw new Error(`Failed to add job: ${error.message}`);
    }
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   */
  async processJobs(queue, processor, options = {}) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (typeof processor !== 'function') {
      throw new Error('Job processor must be a function');
    }

    this.processors.set(queue, {
      processor,
      concurrency: Math.min(options.concurrency || 1, this.maxConcurrency),
      options,
    });

    this.startProcessing();
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    try {
      const job = await this.driver.getJob(
        this.connection,
        this.tableName,
        queue,
        jobId
      );

      if (!job) {
        return null;
      }

      return this._standardizeJob(job);
    } catch (error) {
      throw new Error(`Failed to get job: ${error.message}`);
    }
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update data must be an object');
    }

    try {
      return await this.driver.updateJob(
        this.connection,
        this.tableName,
        queue,
        jobId,
        update
      );
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    try {
      return await this.driver.removeJob(
        this.connection,
        this.tableName,
        queue,
        jobId
      );
    } catch (error) {
      throw new Error(`Failed to remove job: ${error.message}`);
    }
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      const stats = await this.driver.getQueueInfo(
        this.connection,
        this.tableName,
        queue
      );

      return {
        name: queue,
        total: stats.total || 0,
        pending: stats.pending || 0,
        processing: stats.processing || 0,
        completed: stats.completed || 0,
        failed: stats.failed || 0,
        delayed: stats.delayed || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get queue info: ${error.message}`);
    }
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    // Validation
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      return await this.driver.clearQueue(
        this.connection,
        this.tableName,
        queue
      );
    } catch (error) {
      throw new Error(`Failed to clear queue: ${error.message}`);
    }
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    this.processing = false;
    this.processors.clear();

    if (this.connection && this.driver) {
      try {
        await this.driver.disconnect(this.connection);
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }

    this.isInitialized = false;
  }

  /**
   * Starts the processing loop
   * @private
   */
  startProcessing() {
    if (this.processing) return;

    this.processing = true;
    this.processLoop();
  }

  /**
   * Main processing loop
   * @private
   */
  async processLoop() {
    while (this.processing && this.processors.size > 0) {
      try {
        await this.processNextBatch();
      } catch (error) {
        console.error('Error in process loop:', error);
        // Add delay after error to prevent CPU spinning
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollInterval * 2)
        );
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
    }
  }

  /**
   * Processes the next batch of jobs
   * @private
   */
  async processNextBatch() {
    for (const [queueName, config] of this.processors.entries()) {
      const { processor, concurrency } = config;

      // Get available jobs
      try {
        const jobs = await this.driver.getNextJobs(
          this.connection,
          this.tableName,
          queueName,
          concurrency
        );

        // Process jobs concurrently
        if (jobs && jobs.length > 0) {
          const promises = jobs.map((job) => this.processJob(job, processor));
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error(`Error processing batch for queue ${queueName}:`, error);
      }
    }
  }

  /**
   * Processes a single job
   * @private
   * @param {Object} job - Job data
   * @param {Function} processor - Job processor function
   */
  async processJob(job, processor) {
    try {
      // Increment attempts
      job.attempts = (job.attempts || 0) + 1;

      // Process the job
      const result = await processor(this._standardizeJob(job));

      // Mark as completed
      await this.updateJob(job.queue, job.id, {
        status: 'completed',
        completedAt: new Date(),
        result:
          typeof result === 'object' ? JSON.stringify(result) : String(result),
      });
    } catch (error) {
      // Mark as failed
      await this.updateJob(job.queue, job.id, {
        status: 'failed',
        failedAt: new Date(),
        error: error.message,
        attempts: job.attempts,
      });

      // Check if should retry
      if (job.attempts < (job.maxAttempts || 3)) {
        const retryDelay = this._calculateRetryDelay(job.attempts, job.options);
        const processAfter = new Date(Date.now() + retryDelay);

        await this.updateJob(job.queue, job.id, {
          status: 'pending',
          processAfter: processAfter,
        });
      }
    }
  }

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, limit = 10) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      const jobs = await this.driver.getJobsByStatus(
        this.connection,
        this.tableName,
        queue,
        'failed',
        limit
      );

      return jobs.map((job) => this._standardizeJob(job));
    } catch (error) {
      throw new Error(`Failed to get failed jobs: ${error.message}`);
    }
  }

  /**
   * Retries a failed job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async retryJob(queue, jobId) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    try {
      const success = await this.updateJob(queue, jobId, {
        status: 'pending',
        error: null,
        failedAt: null,
        attempts: 0,
        processAfter: new Date(),
      });

      if (success) {
        this.startProcessing();
      }

      return success;
    } catch (error) {
      throw new Error(`Failed to retry job: ${error.message}`);
    }
  }

  /**
   * Gets jobs by status
   * @param {string} queue - Queue name
   * @param {string} status - Job status
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Jobs
   */
  async getJobsByStatus(queue, status, limit = 10) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    try {
      const jobs = await this.driver.getJobsByStatus(
        this.connection,
        this.tableName,
        queue,
        status,
        limit
      );

      return jobs.map((job) => this._standardizeJob(job));
    } catch (error) {
      throw new Error(`Failed to get jobs by status: ${error.message}`);
    }
  }

  /**
   * Cleans up old completed jobs
   * @param {string} queue - Queue name
   * @param {number} [daysOld=7] - Age of jobs to remove in days
   * @returns {Promise<number>} Number of jobs removed
   */
  async cleanupOldJobs(queue, daysOld = 7) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      return await this.driver.cleanupOldJobs(
        this.connection,
        this.tableName,
        queue,
        daysOld
      );
    } catch (error) {
      throw new Error(`Failed to cleanup old jobs: ${error.message}`);
    }
  }

  /**
   * Gets job processing metrics
   * @param {string} queue - Queue name
   * @param {number} [timeSpan=86400000] - Time span in milliseconds (default: 24 hours)
   * @returns {Promise<Object>} Processing metrics
   */
  async getProcessingMetrics(queue, timeSpan = 86400000) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      return await this.driver.getProcessingMetrics(
        this.connection,
        this.tableName,
        queue,
        timeSpan
      );
    } catch (error) {
      throw new Error(`Failed to get processing metrics: ${error.message}`);
    }
  }

  /**
   * Creates a recurring job
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} options - Job options
   * @param {string} cronExpression - Cron expression for scheduling
   * @returns {Promise<Object>} Job info
   */
  async createRecurringJob(queue, data, options = {}, cronExpression) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!cronExpression) {
      throw new Error('Cron expression is required');
    }

    try {
      // Add metadata to identify this as a recurring job template
      const recurringOptions = {
        ...options,
        recurring: true,
        cronExpression,
        lastScheduled: null,
      };

      return await this.driver.createRecurringJob(
        this.connection,
        this.tableName,
        queue,
        data,
        recurringOptions,
        cronExpression
      );
    } catch (error) {
      throw new Error(`Failed to create recurring job: ${error.message}`);
    }
  }
}
