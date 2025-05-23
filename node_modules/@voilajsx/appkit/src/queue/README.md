# @voilajs/appkit - Queue Module 🔄

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Flexible, efficient job queue system for Node.js with multiple backend
> adapters

The Queue module of `@voilajs/appkit` provides a robust job queuing system with
support for in-memory, Redis, and database backends. It offers a consistent
interface for managing background tasks across different adapters, making it
easy to scale your application as your needs grow.

## Module Overview

The Queue module provides everything you need for reliable background
processing:

| Feature               | What it does                       | Main functions                                       |
| --------------------- | ---------------------------------- | ---------------------------------------------------- |
| **Job Queuing**       | Stores jobs for later processing   | `addJob()`, `getJob()`, `removeJob()`                |
| **Job Processing**    | Consumes and executes jobs         | `processJobs()`, `updateJob()`                       |
| **Queue Monitoring**  | Tracks queue metrics               | `getQueueInfo()`, `clearQueue()`                     |
| **Multiple Backends** | Supports different storage options | `initQueue()` with 'memory', 'redis', or 'database'  |
| **Error Handling**    | Manages failed jobs and retries    | Automatic retry with configurable backoff strategies |
| **Job Scheduling**    | Runs jobs at specific times        | Delayed jobs, recurring jobs (database adapter)      |

## 🚀 Features

- **🔌 Multiple Backends** - Choose between in-memory, Redis, or database
  adapters
- **🔄 Consistent API** - Use the same interface regardless of the backend
- **⏱️ Job Scheduling** - Schedule jobs to run at specific times
- **🔁 Automatic Retries** - Configure retry strategies for failed jobs
- **⚡ Concurrency Control** - Limit the number of jobs processed simultaneously
- **📊 Queue Monitoring** - Get detailed queue statistics and job information
- **🏷️ Job Prioritization** - Process important jobs first
- **🔍 Advanced Querying** - Search and filter jobs by status

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

// Initialize with in-memory adapter (for development)
await initQueue('memory');

// Add a job to a queue
const job = await getQueue().addJob('emails', {
  to: 'user@example.com',
  subject: 'Welcome!',
});

// Process jobs from the queue
getQueue().processJobs('emails', async (job) => {
  console.log(`Processing email to: ${job.data.to}`);
  // Email sending logic here
  return { success: true };
});
```

## 📋 Examples

### Basic Job Processing

```javascript
// Process jobs with concurrency
queue.processJobs(
  'image-processing',
  async (job) => {
    console.log(`Processing image: ${job.data.filename}`);
    // Image processing logic
    return { processed: true };
  },
  {
    concurrency: 3, // Process up to 3 jobs simultaneously
  }
);

// Add a job with options
await queue.addJob(
  'image-processing',
  {
    filename: 'photo.jpg',
    width: 800,
    height: 600,
  },
  {
    priority: 10, // Higher priority jobs run first
    delay: 5000, // 5 second delay
    maxAttempts: 3, // Retry up to 3 times on failure
  }
);
```

### Using Redis Adapter

```javascript
// Initialize with Redis adapter
await initQueue('redis', {
  redis: 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

// Redis adapter specific features
const queue = getQueue();

// Pause/resume a queue
await queue.pauseQueue('emails');
await queue.resumeQueue('emails');

// Clean up old jobs
await queue.cleanUp('emails', 24 * 60 * 60 * 1000, 'completed');
```

### Using Database Adapter

```javascript
// Initialize with PostgreSQL adapter
await initQueue('database', {
  databaseType: 'postgres',
  connectionString: 'postgresql://user:pass@localhost/db',
  pollInterval: 1000,
});

// Database adapter specific features
const queue = getQueue();

// Get metrics about processing
const metrics = await queue.getProcessingMetrics('reports');
console.log(`Average processing time: ${metrics.avgProcessingTime}ms`);

// Create a recurring job (runs daily at midnight)
await queue.createRecurringJob(
  'reports',
  { type: 'daily-summary' },
  { priority: 5 },
  '0 0 * * *'
);
```

## 📖 Core Functions

### Queue Management

| Function       | Description                             | Usage                                  |
| -------------- | --------------------------------------- | -------------------------------------- |
| `initQueue()`  | Initializes the queue adapter           | Setup at application startup           |
| `getQueue()`   | Gets the current queue instance         | Accessing the queue throughout the app |
| `closeQueue()` | Stops all queues and releases resources | Clean shutdown of the application      |

```javascript
// Initialize queue at startup
await initQueue('redis', {
  redis: process.env.REDIS_URL,
});

// Get queue instance in other parts of the app
const queue = getQueue();

// Close queue on shutdown
process.on('SIGTERM', async () => {
  await closeQueue();
  process.exit(0);
});
```

### Job Operations

| Function        | Description                  | Usage                               |
| --------------- | ---------------------------- | ----------------------------------- |
| `addJob()`      | Adds a job to a queue        | Queuing tasks for later processing  |
| `processJobs()` | Processes jobs from a queue  | Defining how jobs should be handled |
| `getJob()`      | Gets a specific job by ID    | Checking job status and details     |
| `updateJob()`   | Updates a job                | Modifying job data or status        |
| `removeJob()`   | Removes a job from the queue | Deleting jobs manually              |

```javascript
// Add a job
const job = await queue.addJob('emails', {
  to: 'user@example.com',
  subject: 'Welcome!',
});

// Check job status later
const jobInfo = await queue.getJob('emails', job.id);
console.log(`Job status: ${jobInfo.status}`);
```

### Queue Information

| Function         | Description                   | Usage                                |
| ---------------- | ----------------------------- | ------------------------------------ |
| `getQueueInfo()` | Gets statistics about a queue | Monitoring queue health and activity |
| `clearQueue()`   | Removes all jobs from a queue | Resetting a queue                    |

```javascript
// Get queue stats
const stats = await queue.getQueueInfo('emails');
console.log(`Pending jobs: ${stats.pending}`);
console.log(`Failed jobs: ${stats.failed}`);

// Clear a queue
await queue.clearQueue('emails');
```

## 🔧 Configuration Options

### Memory Adapter

```javascript
await initQueue('memory', {
  // No specific configuration options
});
```

### Redis Adapter

```javascript
await initQueue('redis', {
  // Redis connection
  redis: 'redis://localhost:6379',
  // or
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'secret',
    tls: true,
  },

  // Default job options
  defaultJobOptions: {
    priority: 0, // Default priority
    attempts: 3, // Retry attempts
    removeOnComplete: true, // Remove completed jobs
    removeOnFail: false, // Keep failed jobs
    backoff: {
      // Retry strategy
      type: 'exponential', // 'exponential', 'fixed', or 'linear'
      delay: 1000, // Base delay in milliseconds
    },
  },

  // Queue prefix (for namespacing)
  prefix: 'myapp',
});
```

### Database Adapter

```javascript
await initQueue('database', {
  // Database type and connection
  databaseType: 'postgres', // 'postgres' or 'mysql'
  connectionString: 'postgresql://user:password@localhost/dbname',

  // Connection pool settings
  connectionPool: {
    max: 10, // Maximum connections
    idleTimeoutMillis: 30000,
  },

  // Queue options
  tableName: 'job_queue', // Custom table name
  pollInterval: 1000, // Polling interval in milliseconds
  maxConcurrency: 10, // Maximum concurrent jobs
});
```

## 💡 Common Use Cases

### Background Processing

Use the queue for time-consuming operations that shouldn't block the main
thread:

```javascript
// API endpoint
app.post('/api/users', async (req, res) => {
  try {
    // Create user in database
    const user = await db.createUser(req.body);

    // Queue background tasks
    await queue.addJob('emails', {
      template: 'welcome',
      to: user.email,
      name: user.name,
    });

    await queue.addJob('onboarding', {
      userId: user.id,
      steps: ['profile', 'preferences', 'tutorial'],
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process emails in the background
queue.processJobs('emails', sendEmailProcessor, { concurrency: 5 });
queue.processJobs('onboarding', onboardingProcessor, { concurrency: 2 });
```

### Job Scheduling

Schedule jobs to run at specific times:

```javascript
// Schedule a delayed reminder
await queue.addJob(
  'reminders',
  {
    userId: '123',
    message: 'Complete your profile',
  },
  {
    delay: 24 * 60 * 60 * 1000, // 24 hours
  }
);

// Create a recurring report using the database adapter
await queue.createRecurringJob(
  'reports',
  { type: 'weekly-summary' },
  { priority: 10 },
  '0 9 * * 1' // Every Monday at 9:00 AM
);
```

### Error Handling and Retries

Handle errors and implement retry strategies:

```javascript
// Define a processor with error handling
queue.processJobs(
  'payments',
  async (job) => {
    try {
      // Payment processing logic
      const result = await processPayment(job.data);
      return result;
    } catch (error) {
      // Differentiate between retryable and non-retryable errors
      if (error.code === 'NETWORK_ERROR') {
        // Will be retried based on maxAttempts
        throw error;
      } else {
        // Save error info but don't retry
        await queue.updateJob('payments', job.id, {
          status: 'failed',
          error: error.message,
          errorCode: error.code,
        });
        return { success: false, error: error.message };
      }
    }
  },
  {
    concurrency: 3,
  }
);

// Job with custom retry settings
await queue.addJob(
  'payments',
  {
    orderId: '12345',
    amount: 99.99,
  },
  {
    maxAttempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds
      maxDelay: 60000, // Max 1 minute delay
    },
  }
);
```

### Queue Monitoring and Management

Create admin tools for monitoring and managing queues:

```javascript
// Get queue statistics
app.get('/admin/queues/:name', async (req, res) => {
  try {
    const stats = await queue.getQueueInfo(req.params.name);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry failed jobs
app.post('/admin/queues/:name/retry-failed', async (req, res) => {
  try {
    const queueName = req.params.name;

    // Get failed jobs (adapter-specific)
    let failedJobs;
    if (queue instanceof MemoryAdapter) {
      failedJobs = await queue.getJobsByStatus(queueName, 'failed');
    } else if (queue instanceof RedisAdapter) {
      failedJobs = await queue.getFailedJobs(queueName);
    } else if (queue instanceof DatabaseAdapter) {
      failedJobs = await queue.getFailedJobs(queueName, 100);
    }

    // Retry each failed job
    const results = await Promise.all(
      failedJobs.map((job) => queue.retryJob(queueName, job.id))
    );

    res.json({
      retried: results.filter(Boolean).length,
      total: failedJobs.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common queue scenarios using the `@voilajs/appkit/queue` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality queue code.

### How to Use LLM Code Generation

Simply copy one of the prompts below (which include a link to the
PROMPT_REFERENCE.md) and share it with ChatGPT, Claude, or another capable LLM.
The LLM will read the reference document and generate high-quality,
production-ready code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Queue Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md and then create a system for processing image uploads using @voilajs/appkit/queue with the following features:
- In-memory queue for development
- Job for image resizing
- Job for optimizing images
- Error handling with retries
```

#### Production Queue System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md and then implement a production-ready queue system using @voilajs/appkit/queue with Redis that includes:
- Email sending queue
- Notification queue
- Recurring report generation
- Queue monitoring endpoints
- Graceful shutdown handling
```

#### Custom Backend Integration

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md and then create code for integrating the @voilajs/appkit/queue module with PostgreSQL, including:
- Database connection setup
- Job processors for user onboarding tasks
- Processing metrics collection
- Job cleanup strategy
- Recurring job for daily reports
```

## 📋 Examples

The module includes several examples to help you get started with common queue
scenarios:

| Example                                                                                                                 | Description                      | Key Features                                          |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| [01-basic-usage.js](https://github.com/voilajs/appkit/blob/main/src/queue/examples/01-basic-usage.js)                   | Introduction to queue basics     | Job creation, processing, error handling              |
| [02-advanced-job-options.js](https://github.com/voilajs/appkit/blob/main/src/queue/examples/02-advanced-job-options.js) | Advanced job configuration       | Priorities, delayed jobs, retry strategies            |
| [03-redis-adapter.js](https://github.com/voilajs/appkit/blob/main/src/queue/examples/03-redis-adapter.js)               | Using Redis for production queue | Redis connection, progress tracking, queue operations |
| [04-database-adapter.js](https://github.com/voilajs/appkit/blob/main/src/queue/examples/04-database-adapter.js)         | Database-backed persistent queue | PostgreSQL integration, metrics, recurring jobs       |

## 🛡️ Security Best Practices

1. **Environment Variables**: Store database and Redis connection strings in
   environment variables, not in code
2. **Authentication**: Use authentication for Redis and database connections
3. **Validation**: Validate job data before processing to prevent injection
   attacks
4. **Secure Connections**: Use TLS for Redis connections in production
5. **Access Control**: Implement authorization for administrative queue
   management endpoints
6. **Sanitization**: Avoid storing sensitive data (passwords, API keys) in job
   data

## 📊 Performance Considerations

- **Choose the right adapter**: Use memory for development, Redis for
  production, database for existing database infrastructure
- **Concurrency tuning**: Adjust concurrency settings based on job resource
  requirements
- **Cleanup old jobs**: Implement job cleanup strategies to prevent
  database/Redis growth
- **Monitor queue health**: Track queue sizes and processing times to identify
  bottlenecks
- **Batch jobs**: Group small related tasks into batches for better efficiency

## 🔍 Error Handling

Always implement proper error handling in job processors:

```javascript
try {
  // Queue initialization
  await initQueue('redis', { redis: process.env.REDIS_URL });
} catch (error) {
  console.error('Failed to initialize queue:', error);
  process.exit(1);
}

// Error handling in job processors
queue.processJobs('tasks', async (job) => {
  try {
    // Process job
    const result = await processTask(job.data);
    return result;
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // Decide whether to retry or fail permanently
    if (job.attempts < job.maxAttempts && isRetryableError(error)) {
      throw error; // Will be retried
    } else {
      // Record failure but don't retry
      await recordFailedJob(job, error);
      return { success: false, error: error.message };
    }
  }
});
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/queue/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/queue/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
