import Redis from 'ioredis';

// Redis configuration
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

// Create Redis client instance
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Helper functions for common Redis operations
export const redisHelpers = {
  // String operations
  async setString(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await redis.set(key, value, 'EX', expirySeconds);
    } else {
      await redis.set(key, value);
    }
  },

  async getString(key: string): Promise<string | null> {
    return redis.get(key);
  },

  // Hash/Map operations
  async setHash(key: string, data: Record<string, string>): Promise<void> {
    await redis.hmset(key, data);
  },

  async getHash(key: string): Promise<Record<string, string>> {
    return redis.hgetall(key);
  },

  async getHashField(key: string, field: string): Promise<string | null> {
    return redis.hget(key, field);
  },

  async setHashField(key: string, field: string, value: string): Promise<void> {
    await redis.hset(key, field, value);
  },

  // List operations
  async pushToList(key: string, value: string): Promise<void> {
    await redis.rpush(key, value);
  },

  async getList(key: string, start: number = 0, end: number = -1): Promise<string[]> {
    return redis.lrange(key, start, end);
  },

  // Set operations
  async addToSet(key: string, member: string): Promise<void> {
    await redis.sadd(key, member);
  },

  async getSetMembers(key: string): Promise<string[]> {
    return redis.smembers(key);
  },

  // Key operations
  async deleteKey(key: string): Promise<void> {
    await redis.del(key);
  },

  async keyExists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  async setExpiry(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },

  // Utility functions
  async clearDatabase(): Promise<void> {
    await redis.flushdb();
  },

  async closeConnection(): Promise<void> {
    await redis.quit();
  },
};

export default redis;
