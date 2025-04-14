import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

export const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: {},
});
