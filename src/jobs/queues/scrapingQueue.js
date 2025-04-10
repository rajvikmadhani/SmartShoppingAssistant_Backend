import { Queue } from 'bullmq';
import { redisConnection } from '../../redis';

export const scrapingQueue = new Queue('scraping', {
    connection: redisConnection,
});
