import { Redis } from 'ioredis';

export const redisConnection = new Redis({
    host: 'localhost', // Or your Redis host
    port: 6379, // Default port
});
