// File: jobs/queues/notificationQueue.js
import { Queue } from 'bullmq';
import { redisConnection } from '../../redis/index.js';

export const notificationQueue = new Queue('notifications', {
    connection: redisConnection,
});
