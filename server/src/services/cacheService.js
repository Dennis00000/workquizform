const Redis = require('redis');

let client = null;
let isRedisEnabled = false;
let retryCount = 0;
const MAX_RETRIES = 3;

const connect = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('Redis URL not configured. Running without cache.');
      return;
    }

    client = Redis.createClient({
      url: redisUrl,
      retry_strategy: function(options) {
        if (retryCount >= MAX_RETRIES) {
          console.log('Max Redis connection retries reached. Running without cache.');
          isRedisEnabled = false;
          return false; // Stop retrying
        }
        retryCount++;
        return Math.min(options.attempt * 100, 3000); // Time between retries with max of 3s
      }
    });

    client.on('error', (err) => {
      if (!isRedisEnabled) return; // Don't log errors if we're already disabled
      console.warn('Redis connection error. Running without cache.');
      isRedisEnabled = false;
    });

    client.on('connect', () => {
      console.log('Connected to Redis successfully');
      isRedisEnabled = true;
      retryCount = 0;
    });

    await client.connect().catch(() => {
      console.log('Initial Redis connection failed. Running without cache.');
      isRedisEnabled = false;
    });

  } catch (error) {
    console.warn('Failed to initialize Redis. Running without cache.');
    isRedisEnabled = false;
  }
};

const set = async (key, value, ttl = 3600) => {
  if (!isRedisEnabled) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (error) {
    // Silent fail for cache operations
  }
};

const get = async (key) => {
  if (!isRedisEnabled) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    // Silent fail for cache operations
    return null;
  }
};

const del = async (key) => {
  if (!isRedisEnabled) return;
  try {
    await client.del(key);
  } catch (error) {
    // Silent fail for cache operations
  }
};

module.exports = {
  connect,
  set,
  get,
  del
}; 