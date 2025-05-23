/**
 * @voilajs/appkit - Redis queue adapter (uses Bull)
 * @module @voilajs/appkit/queue/adapters/redis
 */

import Bull from 'bull';
import { QueueAdapter } from './base.js';

/**
 * Redis queue adapter using Bull
 * @extends QueueAdapter
 */
export class RedisAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.queues = new Map();
    this.redisConfig = this.parseRedisConfig(
      config.redis || 'redis://localhost:6379'
    );
    this.defaultJobOptions = config.defaultJobOptions || {};
    this.prefix = config.prefix || 'appkit';
  }

  /**
   * Parses Redis connection configuration
   * @private
   * @param {string|Object} redisConfig - Redis configuration
   * @returns {string|Object} Parsed configuration
   */
  parseRedisConfig(redisConfig) {
    if (typeof redisConfig === 'string') {
      return redisConfig;
    }

    // Already an object, ensure it has required properties
    if (typeof redisConfig === 'object' && redisConfig !== null) {
      return {
        host: redisConfig.host || 'localhost',
        port: redisConfig.port || 6379,
        db: redisConfig.db || 0,
        password: redisConfig.password,
        tls: redisConfig.tls,
        ...redisConfig,
      };
    }

    return 'redis://localhost:6379';
  }

  /**
   * Initializes the Redis adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    // No initialization needed until queues are accessed
  }

  /**
   * Gets or creates a Bull queue
   * @private
   * @param {string} name - Queue name
   * @returns {Bull.Queue} Bull queue instance
   */
  getOrCreateQueue(name) {
    if (!this.queues.has(name)) {
      try {
        const queue = new Bull(name, {
          redis: this.redisConfig,
          prefix: this.prefix,
        });
        this.queues.set(name, queue);
      } catch (error) {
        throw new Error(`Failed to create Redis queue: ${error.message}`);
      }
    }
    return this.queues.get(name);
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

    // Get or create the Bull queue
    const bullQueue = this.getOrCreateQueue(queue);

    // Prepare job options
    const jobOptions = {
      ...this.defaultJobOptions,
      ...options,
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: options.maxAttempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: options.removeOnComplete !== false,
      removeOnFail: options.removeOnFail !== false,
    };

    try {
      // Add job to the Bull queue
      const job = await bullQueue.add(data, jobOptions);

      // Get the job state
      const state = await job.getState();

      // Return job info
      return {
        id: job.id.toString(),
        queue,
        status: state,
      };
    } catch (error) {
      throw new Error(`Failed to add job to queue: ${error.message}`);
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

    const bullQueue = this.getOrCreateQueue(queue);
    const concurrency = options.concurrency || 1;

    try {
      // Register processor with Bull
      bullQueue.process(concurrency, async (job) => {
        // Wrap Bull job to match our interface
        const wrappedJob = {
          id: job.id.toString(),
          queue,
          data: job.data,
          options: job.opts,
          status: await job.getState(),
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
          progress: job.progress(),
          createdAt: new Date(job.timestamp),
          processedAt: job.processedOn ? new Date(job.processedOn) : null,
          completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
          failedReason: job.failedReason,
        };

        try {
          // Call the user-provided processor
          const result = await processor(wrappedJob);

          // Update progress if supported
          if (job.progress && typeof job.progress === 'function') {
            await job.progress(100);
          }

          return result;
        } catch (error) {
          // Rethrow the error for Bull to handle retry logic
          throw error;
        }
      });

      // Register event handlers if provided
      if (options.onCompleted) {
        bullQueue.on('completed', (job, result) => {
          options.onCompleted(job.id.toString(), result);
        });
      }

      if (options.onFailed) {
        bullQueue.on('failed', (job, error) => {
          options.onFailed(job.id.toString(), error);
        });
      }

      if (options.onProgress) {
        bullQueue.on('progress', (job, progress) => {
          options.onProgress(job.id.toString(), progress);
        });
      }

      // Additional events
      if (options.onStalled) {
        bullQueue.on('stalled', (job) => {
          options.onStalled(job.id.toString());
        });
      }
    } catch (error) {
      throw new Error(`Failed to process queue: ${error.message}`);
    }
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
      const bullQueue = this.getOrCreateQueue(queue);
      const job = await bullQueue.getJob(jobId);

      if (!job) return null;

      const state = await job.getState();

      return {
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        status: state,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        progress: job.progress(),
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
      };
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
      const bullQueue = this.getOrCreateQueue(queue);
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      // Update progress if provided
      if (update.progress !== undefined) {
        await job.progress(update.progress);
      }

      // Update data if provided
      if (update.data) {
        await job.update(update.data);
      }

      // Some updates might require moving to a different state
      if (update.status === 'failed' && update.error) {
        // Manually fail the job
        await job.moveToFailed(new Error(update.error), true);
      }

      return true;
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
      const bullQueue = this.getOrCreateQueue(queue);
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      await job.remove();
      return true;
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
      const bullQueue = this.getOrCreateQueue(queue);

      const [waiting, active, completed, failed, delayed, paused] =
        await Promise.all([
          bullQueue.getWaitingCount(),
          bullQueue.getActiveCount(),
          bullQueue.getCompletedCount(),
          bullQueue.getFailedCount(),
          bullQueue.getDelayedCount(),
          bullQueue.getPausedCount(),
        ]);

      return {
        name: queue,
        total: waiting + active + completed + failed + delayed + paused,
        pending: waiting,
        processing: active,
        completed,
        failed,
        delayed,
        paused,
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
      const bullQueue = this.getOrCreateQueue(queue);
      await bullQueue.empty();
      return true;
    } catch (error) {
      throw new Error(`Failed to clear queue: ${error.message}`);
    }
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    const closePromises = [];

    for (const [name, queue] of this.queues.entries()) {
      try {
        closePromises.push(queue.close());
      } catch (error) {
        console.error(`Error closing queue ${name}:`, error);
      }
    }

    try {
      await Promise.all(closePromises);
    } catch (error) {
      console.error('Error closing queues:', error);
    } finally {
      this.queues.clear();
      this.isInitialized = false;
    }
  }

  /**
   * Additional Bull-specific methods
   */

  /**
   * Pauses a queue
   * @param {string} queue - Queue name
   * @param {boolean} [isLocal=false] - If true, pause only locally
   * @returns {Promise<void>}
   */
  async pauseQueue(queue, isLocal = false) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      const bullQueue = this.getOrCreateQueue(queue);
      await bullQueue.pause(isLocal);
    } catch (error) {
      throw new Error(`Failed to pause queue: ${error.message}`);
    }
  }

  /**
   * Resumes a queue
   * @param {string} queue - Queue name
   * @param {boolean} [isLocal=false] - If true, resume only locally
   * @returns {Promise<void>}
   */
  async resumeQueue(queue, isLocal = false) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      const bullQueue = this.getOrCreateQueue(queue);
      await bullQueue.resume(isLocal);
    } catch (error) {
      throw new Error(`Failed to resume queue: ${error.message}`);
    }
  }

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [start=0] - Start index
   * @param {number} [end=-1] - End index
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, start = 0, end = -1) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    try {
      const bullQueue = this.getOrCreateQueue(queue);
      const jobs = await bullQueue.getFailed(start, end);

      return jobs.map((job) => ({
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        status: 'failed',
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        failedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      }));
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
      const bullQueue = this.getOrCreateQueue(queue);
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      const state = await job.getState();
      if (state !== 'failed') {
        return false;
      }

      await job.retry();
      return true;
    } catch (error) {
      throw new Error(`Failed to retry job: ${error.message}`);
    }
  }

  /**
   * Gets jobs of a specific type
   * @param {string} queue - Queue name
   * @param {string} type - Job type ('active', 'waiting', 'delayed', 'completed', 'failed')
   * @param {number} [start=0] - Start index
   * @param {number} [end=-1] - End index
   * @returns {Promise<Array>} Jobs
   */
  async getJobs(queue, type, start = 0, end = -1) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (
      !['active', 'waiting', 'delayed', 'completed', 'failed'].includes(type)
    ) {
      throw new Error(
        'Invalid job type. Must be one of: active, waiting, delayed, completed, failed'
      );
    }

    try {
      const bullQueue = this.getOrCreateQueue(queue);
      const jobs = await bullQueue.getJobs([type], start, end);

      return jobs.map((job) => ({
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        status: type === 'waiting' ? 'pending' : type,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        completedAt:
          type === 'completed' && job.finishedOn
            ? new Date(job.finishedOn)
            : null,
        failedAt:
          type === 'failed' && job.finishedOn ? new Date(job.finishedOn) : null,
      }));
    } catch (error) {
      throw new Error(`Failed to get ${type} jobs: ${error.message}`);
    }
  }

  /**
   * Cleans up jobs
   * @param {string} queue - Queue name
   * @param {number} [grace=3600000] - Grace period in milliseconds (1 hour)
   * @param {string} [status='completed'] - Job status to clean up
   * @param {number} [limit=1000] - Maximum number of jobs to clean up
   * @returns {Promise<number>} Number of jobs removed
   */
  async cleanUp(queue, grace = 3600000, status = 'completed', limit = 1000) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!['completed', 'failed', 'all'].includes(status)) {
      throw new Error('Invalid status. Must be one of: completed, failed, all');
    }

    try {
      const bullQueue = this.getOrCreateQueue(queue);
      const jobs = await bullQueue.clean(grace, status, limit);
      return jobs.length;
    } catch (error) {
      throw new Error(`Failed to clean up jobs: ${error.message}`);
    }
  }
}
