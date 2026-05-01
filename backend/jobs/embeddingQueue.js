const { Queue } = require('bullmq');
const IORedis = require('ioredis');

let embeddingQueue = null;
let connection = null;
let useMemoryQueue = false;

// Try to connect to Redis
try {
  connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    connectTimeout: 3000,
    retryStrategy: (times) => {
      if (times === 1) {
        console.warn('⚠️  Redis connection failed. Switching to in-memory queue (development mode)');
        useMemoryQueue = true;
        return null; // Stop retrying
      }
      return null;
    },
  });

  connection.on('ready', () => {
    console.log('✅ Redis connected successfully');
  });

  connection.on('error', (err) => {
    if (!useMemoryQueue) {
      console.warn('⚠️  Redis error:', err.message);
    }
  });

  // Create queue with Redis
  embeddingQueue = new Queue('embedding', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });

  // Catch initialization errors
  embeddingQueue.on('error', (err) => {
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    console.warn('⚠️  Using in-memory queue. Redis not available in development.');
  });
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Redis is required in production. ' + err.message);
  }
  console.warn('⚠️  Creating in-memory queue for development');
  embeddingQueue = createMemoryQueue();
  useMemoryQueue = true;
}

// Fallback: In-memory queue for development
function createMemoryQueue() {
  const jobs = new Map();
  return {
    add: async (name, data, opts = {}) => {
      const jobId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const job = {
        id: jobId,
        name,
        data,
        progress: () => 0,
        update: async () => {},
        waitUntilFinished: async () => ({ success: true }),
      };
      jobs.set(jobId, job);
      console.log(`📋 Job queued (memory): ${name}`);
      return job;
    },
    process: async (name, handler) => {
      console.log(`👁️  Processor ready: ${name} (in-memory mode)`);
    },
    on: (event, handler) => {
      // No-op for memory queue
    },
    addEventListener: (event, handler) => {
      // No-op for memory queue
    },
  };
}

module.exports = { embeddingQueue, connection, useMemoryQueue };
