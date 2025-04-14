import { Queue } from 'bullmq';
import { redisConnection } from '../../redis/index.js';

export const scrapingQueue = new Queue('scraping', {
    connection: redisConnection,
});
