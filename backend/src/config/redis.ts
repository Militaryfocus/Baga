import { createClient, RedisClientType } from 'redis';

<<<<<<< HEAD
let redisClient: RedisClientType | null = null;
=======
let redisClient: RedisClientType | undefined;
>>>>>>> 96ce9b5 (Checkpoint before follow-up message)

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export default redisClient;