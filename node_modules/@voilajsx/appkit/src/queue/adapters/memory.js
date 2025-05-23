/**
 * @voilajs/appkit - Memory queue adapter
 * @module @voilajs/appkit/queue/adapters/memory
 */

import { QueueAdapter } from './base.js';
import crypto from 'crypto';

/**
 * In-memory queue adapter
 * @extends QueueAdapter
 */
export class MemoryAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.queues = new Map();
    this.processors = new Map();
    this.processing = new Map();
    this.jobCounter = 0;
    this.delayedTimeouts = new Map();
  }

  /**
   * Initializes the memory adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    // Nothing specific to initialize for memory adapter
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

    // Initialize queue if it doesn't exist
    if (!this.queues.has(queue)) {
      this.queues.set(queue, []);
    }

    // Create job object
    const job = {
      id: this.generateJobId(),
      queue,
      data,
      options,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      priority: options.priority || 0,
      delay: options.delay || 0,
    };

    // Handle delayed jobs
    if (job.delay > 0) {
      job.status = 'delayed';
      job.processAfter = new Date(Date.now() + job.delay);

      const timeoutId = setTimeout(() => {
        if (job.status === 'delayed') {
          job.status = 'pending';
          this.delayedTimeouts.delete(job.id);
          this.processNextJob(queue);
        }
      }, job.delay);

      this.delayedTimeouts.set(job.id, timeoutId);
    }

    // Add job to queue
    const queueJobs = this.queues.get(queue);
    queueJobs.push(job);

    // Sort queue by priority (higher numbers first)
    if (options.priority !== 0) {
      this.sortQueueByPriority(queue);
    }

    // Trigger processing
    this.processNextJob(queue);

    // Return job info
    return {
      id: job.id,
      queue,
      status: job.status,
    };
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

    // Set concurrency
    const concurrency = options.concurrency || 1;

    // Store processor config
    this.processors.set(queue, {
      processor,
      concurrency,
      options,
    });

    // Start processing
    for (let i = 0; i < concurrency; i++) {
      this.processNextJob(queue);
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

    const jobs = this.queues.get(queue) || [];
    const job = jobs.find((j) => j.id === jobId);

    if (!job) {
      return null;
    }

    // Return formatted job
    return this.formatJob(job);
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

    const jobs = this.queues.get(queue) || [];
    const jobIndex = jobs.findIndex((j) => j.id === jobId);

    if (jobIndex === -1) return false;

    Object.assign(jobs[jobIndex], update);

    // If priority changed, resort the queue
    if (update.priority !== undefined) {
      this.sortQueueByPriority(queue);
    }

    return true;
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

    const jobs = this.queues.get(queue) || [];
    const index = jobs.findIndex((job) => job.id === jobId);

    if (index === -1) return false;

    // Clear any associated timeout for delayed jobs
    if (this.delayedTimeouts.has(jobId)) {
      clearTimeout(this.delayedTimeouts.get(jobId));
      this.delayedTimeouts.delete(jobId);
    }

    jobs.splice(index, 1);
    return true;
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

    const jobs = this.queues.get(queue) || [];
    const now = new Date();

    return {
      name: queue,
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      delayed: jobs.filter(
        (j) =>
          j.status === 'delayed' ||
          (j.status === 'pending' && j.processAfter > now)
      ).length,
    };
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

    const jobs = this.queues.get(queue) || [];

    // Clear timeouts for delayed jobs
    for (const job of jobs) {
      if (this.delayedTimeouts.has(job.id)) {
        clearTimeout(this.delayedTimeouts.get(job.id));
        this.delayedTimeouts.delete(job.id);
      }
    }

    this.queues.set(queue, []);
    return true;
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    // Clean up timeouts
    for (const timeoutId of this.delayedTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.delayedTimeouts.clear();

    this.processors.clear();
    this.processing.clear();

    this.isInitialized = false;
  }

  /**
   * Process next job in queue
   * @private
   * @param {string} queue - Queue name
   */
  async processNextJob(queue) {
    const processorConfig = this.processors.get(queue);
    if (!processorConfig) return;

    const { processor, concurrency } = processorConfig;

    // Check concurrency limit
    const processing = this.processing.get(queue) || 0;
    if (processing >= concurrency) return;

    // Get next job
    const jobs = this.queues.get(queue) || [];
    const now = new Date();
    const job = jobs.find(
      (j) =>
        j.status === 'pending' && (!j.processAfter || j.processAfter <= now)
    );

    if (!job) return;

    // Mark as processing
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;

    // Update processing count
    this.processing.set(queue, (this.processing.get(queue) || 0) + 1);

    try {
      // Process job
      const result = await processor(this.formatJob(job));

      // Mark as completed
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;

      // Remove completed jobs if configured
      if (processorConfig.options.removeOnComplete) {
        await this.removeJob(queue, job.id);
      }
    } catch (error) {
      // Mark as failed
      job.status = 'failed';
      job.failedAt = new Date();
      job.error = error.message;

      // Handle retries
      if (job.attempts < (job.options.maxAttempts || job.maxAttempts)) {
        job.status = 'pending';
        job.delay = this.calculateRetryDelay(job.attempts, job.options);
        job.processAfter = new Date(Date.now() + job.delay);
      }
    } finally {
      // Update processing count
      this.processing.set(queue, (this.processing.get(queue) || 0) - 1);

      // Process next job
      setImmediate(() => this.processNextJob(queue));
    }
  }

  /**
   * Generates a unique job ID
   * @private
   * @returns {string} Job ID
   */
  generateJobId() {
    return `job_${++this.jobCounter}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Sorts a queue by job priority
   * @private
   * @param {string} queue - Queue name to sort
   */
  sortQueueByPriority(queue) {
    const jobs = this.queues.get(queue);
    if (jobs && jobs.length > 1) {
      jobs.sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Then oldest first (FIFO)
        return a.createdAt - b.createdAt;
      });
    }
  }

  /**
   * Formats a job for processors
   * @private
   * @param {Object} job - Internal job object
   * @returns {Object} Formatted job
   */
  formatJob(job) {
    return {
      id: job.id,
      queue: job.queue,
      data: job.data,
      options: job.options,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      error: job.error,
      result: job.result,
      createdAt: job.createdAt,
      processAfter: job.processAfter,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      failedAt: job.failedAt,
    };
  }

  /**
   * Calculates retry delay
   * @private
   * @param {number} attempts - Current attempt count
   * @param {Object} options - Job options
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(attempts, options = {}) {
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

  /**
   * Gets jobs with a specific status
   * @param {string} queue - Queue name
   * @param {string} status - Job status
   * @param {number} [limit=100] - Maximum number of jobs to return
   * @returns {Promise<Array>} Jobs with the specified status
   */
  async getJobsByStatus(queue, status, limit = 100) {
    if (!queue) {
      throw new Error('Queue name is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    const jobs = this.queues.get(queue) || [];
    return jobs
      .filter((job) => job.status === status)
      .slice(0, limit)
      .map((job) => this.formatJob(job));
  }

  /**
   * Retries a failed job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async retryJob(queue, jobId) {
    const job = await this.getJob(queue, jobId);
    if (!job || job.status !== 'failed') return false;

    await this.updateJob(queue, jobId, {
      status: 'pending',
      error: null,
      failedAt: null,
      processAfter: new Date(),
    });

    this.processNextJob(queue);
    return true;
  }
}
